export interface Subtema {
    titulo: string;
    contenido: string;
    completado: boolean;
  }
  
export interface Curso {
    nombre: string;
    porcentaje: number;
    tecnologias: string[];
    subtemas: Subtema[];
  }