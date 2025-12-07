"use client";
import { BookOpen, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface LeccionCardProps {
  nombre: string;
  porcentaje: number;
  tecnologias: string[];
  onEdit?: () => void;
  onDelete?: () => void;
}

export function LeccionCard({ nombre, porcentaje, tecnologias, onEdit, onDelete }: LeccionCardProps) {
  return (
    <Card 
      className="overflow-hidden transition-all hover:scale-105 cursor-pointer"
      style={{ 
        background: 'rgba(38, 36, 34, 0.6)', 
        backdropFilter: 'blur(10px)',
        borderColor: '#00A3E2',
        borderWidth: '1px'
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #00A3E2 0%, #006b9a 100%)' }}
            >
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 
                className="truncate" 
                style={{ color: '#ffffff' }}
              >
                {nombre}
              </h3>
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
      
      <CardContent className="space-y-4">
        {/* Porcentaje completado */}
        <div className="space-y-2">
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
        <div className="flex flex-wrap gap-2">
          {tecnologias.map((tech, index) => (
            <Badge
              key={index}
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
}