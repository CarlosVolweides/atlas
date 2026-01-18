"use client";
import { BookOpen, MoreVertical, Edit2, Trash2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { technologyIcons } from '@/lib/utils/tecnologyIcons';

interface CursoCardProps {
  nombre: string;
  porcentaje: number;
  tecnologias: string[];
  dificultad?: string | null;
  created_at?: string | null;
  onEdit?: () => void;
  onDelete?: () => void;
}


const getDificultadColor = (dificultad?: string | null) => {
  if (!dificultad) return { bg: 'rgba(255, 255, 255, 0.2)', text: '#ffffff' };
  const lower = dificultad.toLowerCase();
  if (lower === 'principiante' || lower === 'beginner') {
    return { bg: 'rgba(34, 197, 94, 0.3)', text: '#22c55e', border: '#22c55e' };
  }
  if (lower === 'intermedio' || lower === 'intermediate') {
    return { bg: 'rgba(234, 179, 8, 0.3)', text: '#eab308', border: '#eab308' };
  }
  if (lower === 'avanzado' || lower === 'advanced' || lower === 'experto' || lower === 'expert') {
    return { bg: 'rgba(239, 68, 68, 0.3)', text: '#ef4444', border: '#ef4444' };
  }
  return { bg: 'rgba(255, 255, 255, 0.2)', text: '#ffffff', border: '#ffffff' };
};

const getDificultadLabel = (dificultad?: string | null) => {
  if (!dificultad) return '';
  const lower = dificultad.toLowerCase();
  if (lower === 'principiante' || lower === 'beginner') return 'Principiante';
  if (lower === 'intermedio' || lower === 'intermediate') return 'Intermedio';
  if (lower === 'avanzado' || lower === 'advanced') return 'Avanzado';
  if (lower === 'experto' || lower === 'expert') return 'Experto';
  return dificultad.charAt(0).toUpperCase() + dificultad.slice(1);
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return null;
  }
};

export function CursoCard({ nombre, porcentaje, tecnologias, dificultad, created_at, onEdit, onDelete }: CursoCardProps) {
  const Icon = technologyIcons[nombre.toLowerCase() as string]
  const dificultadStyle = getDificultadColor(dificultad);
  const dificultadLabel = getDificultadLabel(dificultad);
  const fechaFormateada = formatDate(created_at);
  
  return (
    <Card 
      className="overflow-hidden transition-all hover:scale-105 cursor-pointer h-full flex flex-col"
      style={{ 
        background: 'rgba(38, 36, 34, 0.6)', 
        backdropFilter: 'blur(10px)',
        borderColor: '#00A3E2',
        borderWidth: '1px',
        minHeight: '220px'
      }}
    >
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #00A3E2 0%, #006b9a 100%)' }}
            >
              {Icon 
              ? (<Icon className="w-7 h-7" />) 
              : (<BookOpen className="w-5 h-5 text-white" />)}
              
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 
                  className="truncate" 
                  style={{ color: '#ffffff' }}
                >
                  {nombre}
                </h3>
                {dificultadLabel && (
                  <Badge
                    variant="outline"
                    className="text-xs font-semibold px-2 py-0.5"
                    style={{
                      background: dificultadStyle.bg,
                      borderColor: dificultadStyle.border,
                      color: dificultadStyle.text
                    }}
                  >
                    {dificultadLabel}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Menú de tres puntos */}
          <DropdownMenu>
            <DropdownMenuTrigger 
              className="focus:outline-none flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <MoreVertical className="w-4 h-4" style={{ color: '#ffffff' }} />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-44" 
              style={{ background: '#262422', borderColor: '#00A3E2' }}
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem 
                className="cursor-pointer" 
                style={{ color: '#ffffff' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Cambiar nombre
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer" 
                style={{ color: '#ff4444' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 flex-1 flex flex-col">
        {/* Porcentaje completado */}
        <div className="space-y-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: '#ffffff' }}>
              Progreso
            </span>
            <span className="text-sm" style={{ color: '#ffffff' }}>
              {porcentaje}%
            </span>
          </div>
          <Progress 
            value={porcentaje} 
            className="h-2"
            style={{ background: 'rgba(255, 255, 255, 0.3)' }}
          />
        </div>

        {/* Tecnologías */}
        <div className="flex flex-wrap gap-2 flex-1 items-start min-h-[24px]">
          {tecnologias && tecnologias.length > 0 && (
            tecnologias.map((tech) => (
              <Badge
                key={tech}
                variant="outline"
                className="text-xs"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderColor: '#ffffff',
                  color: '#ffffff'
                }}
              >
                {tech}
              </Badge>
            ))
          )}
        </div>

        {/* Fecha de creación */}
        {fechaFormateada && (
          <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <Calendar className="w-3 h-3" style={{ color: '#999999' }} />
            <span className="text-xs" style={{ color: '#999999' }}>
              Creado: {fechaFormateada}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}