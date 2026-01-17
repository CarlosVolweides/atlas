"use client";
import { useRouter, useParams } from 'next/navigation';
import { BookOpen, ArrowLeft, ArrowRight, Calendar, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCourseInfo, useTemary } from '@/hooks/useCourse';
import { technologyIcons } from '@/lib/utils/tecnologyIcons';
import { ModuleTemaryI, SubtopicTemaryI } from '@/types/course';
import { Header } from '@/components/Header';

export default function DetalleCursoPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.cursoId ? parseInt(params.cursoId as string) : null;
  const { data: courseInfo, isLoading } = useCourseInfo(courseId || 0);
  const { data: temaryData, isLoading: isLoadingTemary } = useTemary(courseId || 0, { enabled: !!courseId });

  const handleEntrarCurso = () => {
    if (courseId) {
      router.push(`/curso/${courseId}`);
    }
  };

  const handleVolver = () => {
    router.push('/inicio');
  };

  const tecnologia = courseInfo?.tecnologia || '';
  const Icon = tecnologia ? technologyIcons[tecnologia.toLowerCase()] : null;
  const dificultad = courseInfo?.dificultad || null;
  const razonCurso = (courseInfo as any)?.razonCurso || null;
  const conocimientosPrevios = (courseInfo?.conocimientosPrevios || []) as string[];
  const herramientasRequeridas = (courseInfo?.herramientasRequeridas || []) as string[];
  const tecnologiasExcluidas = (courseInfo?.tecnologiasExcluidas || []) as string[];
  const createdAt = (courseInfo as any)?.created_at || null;

  const getDificultadLabel = (dificultad: string | null) => {
    if (!dificultad) return null;
    const labels: Record<string, string> = {
      basico: 'Básico',
      intermedio: 'Intermedio',
      avanzado: 'Avanzado'
    };
    return labels[dificultad.toLowerCase()] || dificultad;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div 
      className="min-h-screen max-h-screen flex flex-col overflow-hidden" 
      style={{ background: 'linear-gradient(135deg, #001a33 0%, #004d66 50%, #00A3E2 100%)' }}
    >
      <Header />

      {/* Contenido principal */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Botón de retroceso */}
          <Button
            variant="ghost"
            onClick={handleVolver}
            className="gap-2 mb-6"
            style={{ color: '#ffffff' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>

          {/* Grid de dos columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna izquierda - Detalles del curso */}
            <div
              className="rounded-lg p-6 flex flex-col"
              style={{ 
                background: 'rgba(38, 36, 34, 0.95)', 
                backdropFilter: 'blur(20px)',
                borderColor: '#00A3E2',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
            >
            {/* Header del curso */}
            <div className="flex items-center gap-3 mb-6">
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
                <h1 className="text-xl sm:text-2xl" style={{ color: '#ffffff' }}>
                  {isLoading ? 'Cargando...' : tecnologia || 'Detalles del Curso'}
                </h1>
                <p className="text-xs sm:text-sm mt-1" style={{ color: '#cccccc' }}>
                  {isLoading ? 'Obteniendo información del curso...' : 'Información detallada del curso'}
                </p>
              </div>
            </div>

            {/* Contenido */}
            <div 
              className="py-2 pr-2 mb-6 max-h-[500px] overflow-y-auto"
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

                  {/* Fecha de creación */}
                  {createdAt && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                        Fecha de Creación
                      </h3>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" style={{ color: '#00A3E2' }} />
                        <p className="text-sm" style={{ color: '#cccccc' }}>
                          {formatDate(createdAt)}
                        </p>
                      </div>
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

                  {!dificultad && !createdAt && !razonCurso && conocimientosPrevios.length === 0 && 
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
            </div>

            {/* Columna derecha - Temario */}
            <div
              className="rounded-lg p-6 flex flex-col h-full"
              style={{ 
                background: 'rgba(38, 36, 34, 0.95)', 
                backdropFilter: 'blur(20px)',
                borderColor: '#00A3E2',
                borderWidth: '1px',
                borderStyle: 'solid',
                minHeight: '600px'
              }}
            >
              {/* Header del temario */}
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #00A3E2 0%, #006b9a 100%)' }}
                >
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl" style={{ color: '#ffffff' }}>
                    Temario
                  </h2>
                  <p className="text-xs sm:text-sm mt-1" style={{ color: '#cccccc' }}>
                    {temaryData?.modules 
                      ? `${temaryData.modules.length} módulos • ${temaryData.modules.reduce((acc: number, m: ModuleTemaryI) => acc + (m.subtopics?.length || 0), 0)} subtemas`
                      : 'Estructura del curso'}
                  </p>
                </div>
              </div>

              {/* Contenido scrolleable del temario */}
              <div 
                className="flex-1 overflow-y-auto py-2 pr-2"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#00A3E2 rgba(255, 255, 255, 0.1)'
                }}
              >
                {isLoadingTemary || isLoading ? (
                  <div className="text-center py-8" style={{ color: '#cccccc' }}>
                    <p>Cargando temario...</p>
                  </div>
                ) : temaryData?.modules && temaryData.modules.length > 0 ? (
                  <div className="space-y-4">
                    {temaryData.modules.map((module: ModuleTemaryI) => (
                      <div
                        key={module.order}
                        className="rounded-lg p-4"
                        style={{
                          background: 'rgba(0, 163, 226, 0.1)',
                          borderLeft: '3px solid #00A3E2'
                        }}
                      >
                        {/* Título del módulo */}
                        <div className="flex items-start gap-3 mb-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ 
                              background: '#00A3E2',
                              color: '#ffffff'
                            }}
                          >
                            {module.order}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base sm:text-lg" style={{ color: '#ffffff' }}>
                              {module.title}
                            </h3>
                            {module.objective && (
                              <p className="text-xs mt-1" style={{ color: '#999999' }}>
                                {module.objective}
                              </p>
                            )}
                            <p className="text-xs mt-1" style={{ color: '#999999' }}>
                              {module.subtopics?.length || 0} subtemas
                            </p>
                          </div>
                        </div>

                        {/* Subtemas */}
                        {module.subtopics && module.subtopics.length > 0 && (
                          <div className="space-y-2 ml-11">
                            {module.subtopics.map((subtopic: SubtopicTemaryI) => (
                              <div
                                key={subtopic.order}
                                className="flex items-center gap-3 p-2 rounded"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.05)'
                                }}
                              >
                                <CheckCircle2 
                                  className="w-4 h-4 flex-shrink-0" 
                                  style={{ color: '#00A3E2' }}
                                />
                                <div className="flex-1">
                                  <span className="text-sm" style={{ color: '#cccccc' }}>
                                    {subtopic.order}. {subtopic.title}
                                  </span>
                                  {subtopic.description && (
                                    <p className="text-xs mt-1" style={{ color: '#999999' }}>
                                      {subtopic.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" style={{ color: '#cccccc' }}>
                    <p>No hay temario disponible para este curso.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
