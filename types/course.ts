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
    objetive: string;
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