# GitHub Copilot Instructions - Atlas

Atlas es una plataforma de aprendizaje personalizada que genera cursos técnicos usando IA, con Next.js 16, TypeScript, Supabase y streaming de contenido AI.

## Arquitectura Clave

### Patrón de Servicios en 3 Capas
1. **API Routes** (`/app/api/vercelai`) - Maneja llamadas a AI Gateway con streaming
2. **Services** (`/lib/services/*.ts`) - Lógica de negocio y operaciones DB
3. **Hooks** (`/hooks/*.ts`) - React Query wrappers que exponen servicios a componentes

**Ejemplo de flujo**: Componente → `useCourse` hook → `CourseService.getCourses()` → Supabase → Vista DB `vista_progreso_cursos`

### Autenticación con Middleware
`middleware.ts` intercepta todas las rutas (excepto estáticos/API) para:
- Refrescar tokens de Supabase automáticamente
- Proteger rutas `/inicio`, `/curso` (redirige a `/login` si no autenticado)
- Redirigir usuarios autenticados de `/login` a `/inicio`

### Clientes Supabase Separados
- **Client-side**: `lib/supabase/client.ts` - Para componentes cliente (`'use client'`)
- **Server-side**: `lib/supabase/server.ts` - Para Server Components, usa `cookies()` de Next.js
- **Middleware**: `lib/supabase/middleware.ts` - Para el middleware de autenticación

⚠️ **Siempre usar el cliente correcto según el contexto de renderizado**

## Integración con IA y Streaming

### AI Gateway Pattern
Todas las llamadas a LLMs pasan por un gateway centralizado (env: `AI_GATEWAY_URL`). Configurable entre `vercelai` o `openai` con `NEXT_PUBLIC_LLM_SERVICE`.

**Estructura de API routes AI**:
```typescript
// app/api/vercelai/subtopicStarted(streming)/route.ts
export const runtime = "nodejs";
const GATEWAY_BASE = process.env.AI_GATEWAY_URL;
const MODEL = process.env.NEXT_PUBLIC_LLM_MODEL ?? "google/gemini-3-flash";

// JSON Schema estricto para respuestas predecibles
const lessonSchema = {
  name: "subtopic_started_schema",
  strict: true,
  schema: { type: "object", properties: { title, content, estimated_read_time_min }, required: [...] }
};
```

### Flujo de generación de contenido
1. `ApiServices.subtopicStarted.create()` llama a `/api/vercelai/subtopicStarted(streming)`
2. La ruta construye prompt con `knowledgeProfile` + rails de formato
3. Respuesta JSON → `ContextService.postContext()` guarda en DB
4. Frontend renderiza con `MarkdownRenderer` component

**Rails de contenido**: Las rutas AI usan "rails" (reglas estrictas) para guiar formato, tono y estructura del contenido generado. Ver ejemplos en routes de `planner`, `systemPromptCreator`, `subtopicStarted`.

### Modo desarrollo sin LLM
Si `NEXT_PUBLIC_LLM_ACTIVE=false`, `ApiServices.subtopicStarted` retorna mock data después de 2.5s sin llamar a AI.

## React Query y Estado

### Configuración Global
`lib/providers/query-provider.tsx` configura:
- `staleTime: 60 * 1000` (1 min) - datos considerados frescos
- `refetchOnWindowFocus: false` - no refetch al volver a la ventana

### Patrón de Custom Hooks
```typescript
// hooks/useCourse.ts
export const useCourses = (page: number = 1, limit: number = 9) => {
  return useQuery<{ courses: CursoCardInfo[]; total: number }>({
    queryKey: ['courses', page, limit],
    queryFn: async () => CourseService.getCourses(page, limit)
  });
}

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, titulo, image }) => 
      CourseService.updateCourse(courseId, titulo, image),
    onSuccess: () => {
      toast.success('Curso actualizado');
      queryClient.invalidateQueries(['courses', 'course-info']);
    }
  });
}
```

**Convención**: 
- Queries: `use<Entity>` o `use<Entity>Info`
- Mutations: `useCreate<Entity>`, `useUpdate<Entity>`
- Siempre invalidar queries relacionadas en `onSuccess`
- Usar `toast.success/error` (sonner) para feedback

## Base de Datos y Supabase

### Vistas de DB para Performance
`vista_progreso_cursos` - Vista materializada que calcula progreso de cursos:
```typescript
// lib/services/course.ts
const { data } = await supabase
  .from('vista_progreso_cursos')
  .select('*')
  .eq('user_id', user.id)
  .range(from, to);

// Las vistas evitan JOINs complejos y cálculos en tiempo real
```

### Pattern de Autenticación en Servicios
```typescript
async function getAuthenticatedUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Usuario no autenticado.");
  return { user, supabase };
}
```
Refresca token automáticamente antes de validar. Usar al inicio de funciones de servicio que requieren auth.

## UI y Componentes

### Renderizado de Markdown AI
`components/MarkdownRenderer.tsx` - Personaliza react-markdown con:
- Syntax highlighting (react-syntax-highlighter, tema vscDarkPlus)
- Botón de copiar en bloques de código con estado de feedback
- Estilos Tailwind custom para h1-h3, listas, enlaces, párrafos
- `remarkGfm` para tablas, strikethrough, task lists

```tsx
// Uso:
<MarkdownRenderer content={aiGeneratedMarkdown} />
```

### shadcn/ui + Radix UI
Todos componentes en `components/ui/` son de shadcn/ui. Para agregar nuevos:
```bash
pnpm dlx shadcn@latest add [component-name]
```

### Utilidades de Estilos
```typescript
// utils.ts
import { clsxMerge } from '@/utils';
// Combina clsx y tailwind-merge para evitar conflictos de clases
className={clsxMerge("base-class", condition && "conditional-class")}
```

## Helpers y Utilities Específicos

### `lib/utils/roleText.ts` - Builder de Prompts
```typescript
buildRoleText({
  mainTech: "Next.js",
  level: "intermedio", 
  requiredTools: ["Prisma", "Tailwind"],
  priorKnowledge: ["react básico"],
  outOfScope: ["DevOps"]
})
// → "Tutor experto en Next.js nivel intermedio. Herramientas indispensables: Prisma y Tailwind..."
```
Usado en servicios AI para construir contexto de conocimiento del usuario.

### `lib/utils/iconMapping.ts` & `tecnologyIcons.ts`
Mapean tecnologías a componentes de iconos SVG custom en `/assets/icons/`. Ejemplo:
```typescript
const icon = getTechnologyIcon("typescript"); // → <TypeScriptIcon />
```

## Scripts de Desarrollo

```bash
pnpm dev                              # Dev server (localhost:3000)
pnpm reset:db                         # Ejecuta scripts/reset-db.ts - resetea tablas
pnpm test:gateway                     # Test conexión AI Gateway
pnpm test:endpoint:streaming          # Test streaming de subtemas
pnpm migrate:tecnologia-to-titulo     # Migración de schema (ejemplo)
```

**Scripts en `/scripts`**: TypeScript ejecutados con `tsx`. Para nuevos scripts, agregar en `package.json` scripts.

## Variables de Entorno Requeridas

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=

# AI Gateway
AI_GATEWAY_URL=
AI_GATEWAY_API_KEY=
NEXT_PUBLIC_LLM_MODEL=google/gemini-3-flash  # Modelo por defecto
NEXT_PUBLIC_LLM_SERVICE=vercelai              # o "openai"
NEXT_PUBLIC_LLM_ACTIVE=true                   # false para modo dev sin LLM
```

## Convenciones de Código

- **Nombrado de archivos**: kebab-case para utils, PascalCase para componentes
- **Imports absolutos**: Usar `@/` alias (configurado en tsconfig.json)
- **Error handling**: Services lanzan errores, hooks los capturan en `onError` y muestran toast
- **TypeScript**: Interfaces en `/types/*.ts`, usar tipos generados de Supabase cuando aplique
- **Comentarios**: Solo cuando la lógica no es obvia (ej: algoritmos complejos, decisiones de negocio)

## Testing y Debugging

- **No hay tests unitarios configurados actualmente**
- Scripts de test en `/examples` prueban endpoints AI específicos
- Para debuggear AI: revisar logs de console en API routes, verificar `NEXT_PUBLIC_LLM_ACTIVE`
- Supabase logs: usar dashboard de Supabase para queries lentas o errores RLS
