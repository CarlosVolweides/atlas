export interface Curso {
  id: string;
  nombre: string;
  dificultad: string;
  conocimientosPrevios: string[];
}

export interface Subtema {
    titulo: string;
    contenido: string;
    completado: boolean;
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