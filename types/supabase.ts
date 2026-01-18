import { TemaryInterface } from './course';

export interface CursoDB {
  id: number;
  tecnologia: string;
  dificultad: string | null;
  razonCurso: string | null;
  conocimientosPrevios: string[] | null;
  herramientasRequeridas: string[] | null;
  tecnologiasExcluidas: string[] | null;
  systemPrompt: string | null;
  esquemaTemario: TemaryInterface | null;
  user_id: string;
  created_at: string;
  titulo: string | null;
}

export interface ModuloDB {
  id: number;
  curso_id: number;
  titulo: string;
  orden: number | null;
  objetivo: string | null;
}

export interface SubtemaDB {
  id: number;
  modulo_id: number;
  titulo: string;
  descripcion: string | null;
  orden: number | null;
  estado: "vacio" | "pendiente" | "completado" | null;
}

export interface ContextoDB {
  id: number;
  subtema_id: number;
  content: string;
  esDuda: boolean | null;
}
