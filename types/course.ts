export interface Curso {
  id: string;
  nombre: string;
  dificultad: string;
  conocimientosPrevios: string[];
}

export interface Subtema {
    order: number;
    title: string;
    description: string;    
    completado?: string;
  }
  
export interface CursoCardI {
    nombre: string;
    porcentaje: number;
    tecnologias: string[];
    subtemas: Subtema[];
  }
export interface CursoCardInfo {
    id: number
    tecnologia: string;
    progreso: number;
    herramientasRequeridas: string[];
    dificultad?: string | null;
    created_at?: string | null;
}

export interface CreateCourseParams {
    tecnologiaPrincipal: string;
    dificultad: string;
    razonCurso: string;
    requiredTools?: string[];
    priorKnowledge?: string[];
    outOfScope?: string[];
}

export interface PlannerModules {
    order?: number;
    title: string;    
    objective?: string;
}

export interface Module {
    order: number;
    title: string;
    objective: string;
    subtopics: Subtema[];
}

export interface ModuleDB {
    id?: number
    orden: number;
    titulo: string;
    curso_id?: number;
    objetivo?: string;
}

// : tipado plannerData
export type EstadoSubtema = 
  | 'vacio'
  | 'pendiente' 
  | 'en-curso' 
  | 'listo-para-prueba' 
  | 'aprobado' 
  | 'reprobado' 
  | 'completado';


export interface SubtopicTemaryI {
  order: number;
  title: string;
  description?: string;
  state?: EstadoSubtema;
}

export interface ModuleTemaryI {
  order: number;
  title: string;
  objective?: string;
  subtopics: SubtopicTemaryI[];
}

export interface TemaryInterface {
  outlineVersion: number;
  modules: ModuleTemaryI[];
}

export interface ContextDB {
  id?: number,
  subtema_id: number,
  content: string,
  esDuda?: boolean
}

export interface ordenSubtema {
  mod: number,
  sub: number
}