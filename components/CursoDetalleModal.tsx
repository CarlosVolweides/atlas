"use client";
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useCourseInfo } from '@/hooks/useCourse';
import { technologyIcons } from '@/lib/utils/tecnologyIcons';

interface CursoDetalleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: number | null;
}

export function CursoDetalleModal({ open, onOpenChange, courseId }: CursoDetalleModalProps) {
  const router = useRouter();
  const { data: courseInfo, isLoading } = useCourseInfo(courseId || 0);

  const handleEntrarCurso = () => {
    if (courseId) {
      onOpenChange(false);
      router.push(`/curso/${courseId}`);
    }
  };

  const tecnologia = courseInfo?.tecnologia || '';
  const Icon = tecnologia ? technologyIcons[tecnologia.toLowerCase()] : null;
  const dificultad = courseInfo?.dificultad || null;
  const razonCurso = (courseInfo as any)?.razonCurso || null;
  const conocimientosPrevios = (courseInfo?.conocimientosPrevios || []) as string[];
  const herramientasRequeridas = (courseInfo?.herramientasRequeridas || []) as string[];
  const tecnologiasExcluidas = (courseInfo?.tecnologiasExcluidas || []) as string[];

  const getDificultadLabel = (dificultad: string | null) => {
    if (!dificultad) return null;
    const labels: Record<string, string> = {
      basico: 'Básico',
      intermedio: 'Intermedio',
      avanzado: 'Avanzado'
    };
    return labels[dificultad.toLowerCase()] || dificultad;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="!max-w-[600px] w-[calc(100%-2rem)] max-h-[90vh] overflow-hidden flex flex-col"
        style={{ 
          background: 'rgba(38, 36, 34, 0.95)', 
          backdropFilter: 'blur(20px)',
          borderColor: '#00A3E2',
          borderWidth: '1px'
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00A3E2 0%, #006b9a 100%)' }}
            >
              {Icon ? (
                <Icon className="w-6 h-6" />
              ) : (
                <BookOpen className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl sm:text-2xl" style={{ color: '#ffffff' }}>
                {isLoading ? 'Cargando...' : tecnologia || 'Detalles del Curso'}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm mt-1" style={{ color: '#cccccc' }}>
                {isLoading ? 'Obteniendo información del curso...' : 'Información detallada del curso'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Contenido scrolleable */}
        <div 
          className="flex-1 overflow-y-auto py-2 pr-2"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#00A3E2 rgba(255, 255, 255, 0.1)'
          }}
        >
          {isLoading ? (
            <div className="text-center py-8" style={{ color: '#cccccc' }}>
              <p>Cargando información del curso...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Dificultad */}
              {dificultad && (
                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                    Dificultad
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-sm"
                    style={{
                      background: 'rgba(0, 163, 226, 0.2)',
                      borderColor: '#00A3E2',
                      color: '#00A3E2'
                    }}
                  >
                    {getDificultadLabel(dificultad)}
                  </Badge>
                </div>
              )}

              {/* Razón del curso */}
              {razonCurso && (
                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                    Razón del Curso
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#cccccc' }}>
                    {razonCurso}
                  </p>
                </div>
              )}

              {/* Conocimientos previos */}
              {conocimientosPrevios && conocimientosPrevios.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                    Conocimientos Previos
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {conocimientosPrevios.map((conocimiento: string, index: number) => (
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
                        {conocimiento}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Herramientas requeridas */}
              {herramientasRequeridas && herramientasRequeridas.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                    Herramientas Requeridas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {herramientasRequeridas.map((herramienta: string, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs"
                        style={{
                          background: 'rgba(0, 163, 226, 0.2)',
                          borderColor: '#00A3E2',
                          color: '#00A3E2'
                        }}
                      >
                        {herramienta}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tecnologías excluidas */}
              {tecnologiasExcluidas && tecnologiasExcluidas.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                    Tecnologías Excluidas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tecnologiasExcluidas.map((tecnologia: string, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs"
                        style={{
                          background: 'rgba(255, 68, 68, 0.2)',
                          borderColor: '#ff4444',
                          color: '#ff4444'
                        }}
                      >
                        {tecnologia}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {!dificultad && !razonCurso && conocimientosPrevios.length === 0 && 
               herramientasRequeridas.length === 0 && tecnologiasExcluidas.length === 0 && (
                <div className="text-center py-8" style={{ color: '#cccccc' }}>
                  <p>No hay información adicional disponible para este curso.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer con botón */}
        <div className="pt-4 border-t" style={{ borderColor: 'rgba(0, 163, 226, 0.3)' }}>
          <Button
            onClick={handleEntrarCurso}
            className="w-full"
            disabled={!courseId || isLoading}
            style={{ 
              background: '#00A3E2',
              color: '#ffffff'
            }}
          >
            Entrar al Curso
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
