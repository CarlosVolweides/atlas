import { CursoCardI } from "@/types/course";

// Datos de ejemplo para los cursos iniciales
export const cursosInicialesEjemplo: CursoCardI[] = [
    {
      nombre: 'Fundamentos de React',
      porcentaje: 75,
      tecnologias: ['React', 'JavaScript', 'JSX'],
      subtemas: [
        {
          titulo: 'Introducción a React',
          contenido: 'React es una biblioteca de JavaScript para construir interfaces de usuario. Fue desarrollada por Facebook y se ha convertido en una de las herramientas más populares para el desarrollo web moderno.\n\nEn este módulo aprenderás los conceptos básicos de React, incluyendo componentes, props, y el virtual DOM. React te permite crear aplicaciones web interactivas y dinámicas de manera eficiente.\n\nLa filosofía de React se basa en componentes reutilizables que gestionan su propio estado, lo que hace que el código sea más mantenible y escalable.',
          completado: true
        },
        {
          titulo: 'JSX y Componentes',
          contenido: 'JSX es una extensión de sintaxis para JavaScript que te permite escribir código similar a HTML dentro de tus archivos JavaScript. Aunque parece HTML, en realidad es JavaScript transformado.\n\nLos componentes son los bloques de construcción fundamentales en React. Pueden ser funciones o clases que retornan elementos de React. Los componentes te permiten dividir la UI en piezas independientes y reutilizables.\n\nCada componente puede recibir datos a través de props (propiedades) y puede mantener su propio estado interno usando hooks como useState.',
          completado: true
        },
        {
          titulo: 'Estado y Props',
          contenido: 'El estado (state) es un objeto que contiene datos que pueden cambiar a lo largo del tiempo en un componente. Cuando el estado cambia, React vuelve a renderizar el componente automáticamente.\n\nLas props son argumentos que se pasan a los componentes React, similar a los parámetros de funciones. Son inmutables y fluyen de componentes padres a hijos.\n\nLa combinación de estado y props te permite crear componentes dinámicos e interactivos que responden a las acciones del usuario.',
          completado: true
        },
        {
          titulo: 'Hooks: useState y useEffect',
          contenido: 'Los Hooks son funciones especiales que te permiten usar características de React en componentes funcionales. useState te permite agregar estado a tus componentes funcionales.\n\nuseEffect te permite realizar efectos secundarios en tus componentes, como llamadas a APIs, suscripciones, o manipulación manual del DOM. Se ejecuta después de que el componente se renderiza.\n\nEstos hooks han revolucionado la forma en que escribimos componentes React, haciendo el código más limpio y fácil de entender.',
          completado: false
        }
      ]
    },
    {
      nombre: 'Desarrollo con TypeScript',
      porcentaje: 45,
      tecnologias: ['TypeScript', 'JavaScript'],
      subtemas: [
        {
          titulo: 'Introducción a TypeScript',
          contenido: 'TypeScript es un superset de JavaScript que añade tipado estático opcional. Fue desarrollado por Microsoft y se compila a JavaScript puro.\n\nEl sistema de tipos de TypeScript te ayuda a detectar errores en tiempo de desarrollo, antes de ejecutar el código. Esto mejora la calidad del código y facilita el mantenimiento.\n\nTypeScript es especialmente útil en proyectos grandes donde la colaboración en equipo y la escalabilidad son importantes.',
          completado: true
        },
        {
          titulo: 'Tipos básicos y interfaces',
          contenido: 'TypeScript ofrece varios tipos básicos como string, number, boolean, array, y tuple. También puedes crear tipos personalizados usando interfaces y type aliases.\n\nLas interfaces definen la estructura de un objeto, especificando qué propiedades debe tener y de qué tipo. Son fundamentales para mantener la consistencia en tu código.\n\nLos tipos pueden ser primitivos, objetos, funciones, o uniones de varios tipos, dándote flexibilidad en cómo defines tus datos.',
          completado: true
        },
        {
          titulo: 'Generics y tipos avanzados',
          contenido: 'Los generics te permiten crear componentes reutilizables que funcionan con múltiples tipos en lugar de uno solo. Son similares a los templates en otros lenguajes.\n\nLos tipos avanzados incluyen union types, intersection types, mapped types, y conditional types. Estas características te dan un control preciso sobre tus tipos.\n\nDominar estos conceptos te permitirá escribir código más flexible y type-safe, aprovechando al máximo el poder de TypeScript.',
          completado: false
        }
      ]
    },
    {
      nombre: 'Estilizado con Tailwind CSS',
      porcentaje: 90,
      tecnologias: ['Tailwind', 'CSS', 'React'],
      subtemas: [
        {
          titulo: 'Introducción a Tailwind',
          contenido: 'Tailwind CSS es un framework de CSS utility-first que te permite construir diseños personalizados sin salir de tu HTML. En lugar de clases predefinidas como "card" o "button", usas utilidades pequeñas.\n\nCon Tailwind, compones diseños combinando clases de utilidad como "flex", "pt-4", "text-center", etc. Esto te da control total sobre el diseño sin escribir CSS personalizado.\n\nTailwind elimina el CSS no utilizado en producción, resultando en archivos CSS muy pequeños y optimizados.',
          completado: true
        },
        {
          titulo: 'Sistema de diseño y configuración',
          contenido: 'Tailwind viene con un sistema de diseño predeterminado que incluye colores, espaciado, tipografía y más. Todo es personalizable a través del archivo de configuración.\n\nPuedes extender o sobrescribir el tema predeterminado para que coincida con tu marca o guías de estilo. Esto asegura consistencia en toda tu aplicación.\n\nLa configuración te permite agregar utilidades personalizadas, plugins, y definir breakpoints responsivos adaptados a tus necesidades.',
          completado: true
        },
        {
          titulo: 'Componentes y patrones',
          contenido: 'Aunque Tailwind es utility-first, es común crear componentes reutilizables extrayendo clases comunes. Puedes hacerlo con componentes React o con la directiva @apply en CSS.\n\nLos patrones comunes incluyen layouts flexbox y grid, tarjetas, formularios, y navegación. Tailwind hace que implementar estos patrones sea rápido y consistente.\n\nLa documentación de Tailwind ofrece ejemplos de componentes que puedes adaptar a tus necesidades específicas.',
          completado: true
        }
      ]
    }
  ];


// Crear nuevo curso con los datos del formulario
    export const crearNuevoCurso = (datos: { tema: string; dificultad: string; conocimientosPrevios: string }): CursoCardI => {
        return {
        nombre: datos.tema,
        porcentaje: 0, // Nuevo subtema empieza en 0%
        tecnologias: [datos.dificultad.charAt(0).toUpperCase() + datos.dificultad.slice(1)], // Mostrar la dificultad como tecnología
        subtemas: [
          {
            titulo: 'Introducción',
            contenido: `Bienvenido a tu lección sobre ${datos.tema}. Este es un curso diseñado específicamente para el nivel ${datos.dificultad}.\n\nEn esta lección aprenderás los conceptos fundamentales y las mejores prácticas relacionadas con ${datos.tema}. El contenido ha sido estructurado para que puedas avanzar a tu propio ritmo.\n\nComenzaremos con los fundamentos y progresivamente iremos abordando temas más avanzados. ¡Disfruta tu aprendizaje!`,
            completado: false
          },
          {
            titulo: 'Conceptos principales',
            contenido: `En esta sección exploraremos los conceptos principales de ${datos.tema}. Es importante entender estos fundamentos antes de avanzar a temas más complejos.\n\nTus conocimientos previos: ${datos.conocimientosPrevios || 'No especificados'}. Utilizaremos esta base para construir sobre lo que ya sabes.\n\nPractica cada concepto antes de continuar para asegurar una comprensión sólida del material.`,
            completado: false
          },
          {
            titulo: 'Práctica y aplicación',
            contenido: `Ahora es momento de poner en práctica lo aprendido. La mejor manera de dominar ${datos.tema} es a través de la aplicación práctica de los conceptos.\n\nTe recomendamos crear pequeños proyectos que incorporen los conceptos que has aprendido. Esto reforzará tu comprensión y te dará experiencia práctica.\n\nRecuerda que el aprendizaje es un proceso iterativo. No dudes en revisar secciones anteriores si lo necesitas.`,
            completado: false
          }
        ]
      }};