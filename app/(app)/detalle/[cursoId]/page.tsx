"use client";
import { useRouter, useParams } from 'next/navigation';
import { BookOpen, ArrowLeft, ArrowRight, Calendar, CheckCircle2, Circle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCourseInfo, useTemary } from '@/hooks/useCourse';
import { iconMapping } from '@/lib/utils/iconMapping';
import { ModuleTemaryI, SubtopicTemaryI, EstadoSubtema } from '@/types/course';
import { Header } from '@/components/Header';
import ShineButton, { ReturnButton } from '@/components/ui/ButtonsAnimated';

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
  const imageId = (courseInfo as any)?.image || null;
  const Icon = imageId ? iconMapping[imageId] : null;
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

  const obtenerIconoEstado = (estado: EstadoSubtema | undefined) => {
    const estadoValido = estado || 'vacio';
    switch (estadoValido) {
      case 'vacio':
        return { 
          icon: <Circle className="w-4 h-4 flex-shrink-0" style={{ color: '#666666' }} />,
          color: '#666666',
          texto: 'Vacío'
        };
      case 'pendiente':
        return { 
          icon: <Clock className="w-4 h-4 flex-shrink-0" style={{ color: '#FFA500' }} />,
          color: '#FFA500',
          texto: 'Pendiente'
        };
      case 'en-curso':
        return { 
          icon: <Clock className="w-4 h-4 flex-shrink-0" style={{ color: '#00A3E2' }} />,
          color: '#00A3E2',
          texto: 'En curso'
        };
      case 'listo-para-prueba':
        return { 
          icon: <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#FFFF00' }} />,
          color: '#FFFF00',
          texto: 'Listo para prueba'
        };
      case 'aprobado':
        return { 
          icon: <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#00FF00' }} />,
          color: '#00FF00',
          texto: 'Aprobado'
        };
      case 'reprobado':
        return { 
          icon: <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#FF4444' }} />,
          color: '#FF4444',
          texto: 'Reprobado'
        };
      case 'completado':
        return { 
          icon: <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#00FF00' }} />,
          color: '#00FF00',
          texto: 'Completado'
        };
      default:
        return { 
          icon: <Circle className="w-4 h-4 flex-shrink-0" style={{ color: '#666666' }} />,
          color: '#666666',
          texto: 'Pendiente'
        };
    }
  };

  const calcularProgresoModulo = (module: ModuleTemaryI) => {
    if (!module.subtopics || module.subtopics.length === 0) return 0;
    const completados = module.subtopics.filter(
      sub => sub.state === 'completado' || sub.state === 'aprobado'
    ).length;
    return Math.round((completados / module.subtopics.length) * 100);
  };

  const calcularProgresoGeneral = () => {
    if (!temaryData?.modules) return 0;
    let totalSubtopics = 0;
    let completados = 0;
    
    temaryData.modules.forEach((module: ModuleTemaryI) => {
      if (module.subtopics) {
        totalSubtopics += module.subtopics.length;
        completados += module.subtopics.filter(
          sub => sub.state === 'completado' || sub.state === 'aprobado'
        ).length;
      }
    });
    
    return totalSubtopics > 0 ? Math.round((completados / totalSubtopics) * 100) : 0;
  };

  const obtenerMetricasProgreso = () => {
    if (!temaryData?.modules) {
      return {
        totalSubtopics: 0,
        completados: 0,
        enCurso: 0,
        pendientes: 0,
        totalModulos: 0,
        modulosCompletados: 0,
        porcentaje: 0
      };
    }

    let totalSubtopics = 0;
    let completados = 0;
    let enCurso = 0;
    let pendientes = 0;
    let totalModulos = temaryData.modules.length;
    let modulosCompletados = 0;

    temaryData.modules.forEach((module: ModuleTemaryI) => {
      if (module.subtopics) {
        const subtopics = module.subtopics;
        totalSubtopics += subtopics.length;
        
        const completadosModulo = subtopics.filter(
          sub => sub.state === 'completado' || sub.state === 'aprobado'
        ).length;
        completados += completadosModulo;

        enCurso += subtopics.filter(
          sub => sub.state === 'en-curso' || sub.state === 'listo-para-prueba'
        ).length;

        pendientes += subtopics.filter(
          sub => !sub.state || sub.state === 'vacio' || sub.state === 'pendiente'
        ).length;

        // Módulo completado si todos sus subtemas están completados
        if (subtopics.length > 0 && completadosModulo === subtopics.length) {
          modulosCompletados++;
        }
      }
    });

    return {
      totalSubtopics,
      completados,
      enCurso,
      pendientes,
      totalModulos,
      modulosCompletados,
      porcentaje: totalSubtopics > 0 ? Math.round((completados / totalSubtopics) * 100) : 0
    };
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
          <ReturnButton          
            onClick={handleVolver}
            className="gap-2 mb-6"
            width="w-40"
            height="h-8"
            fontSize="text-lg"
            buttonColor="#00a2e207"
            containerColor="bg-cyan-400"
            borderColor="white"
            textColor="#ffffffff"
            >
            Volver
          </ReturnButton>          

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
              {isLoading ? 'Cargando...' :
                  (
                  <ShineButton 
                    onClick={handleEntrarCurso} 
                    disabled={!courseId || isLoading}
                  >
                    Entrar al Curso
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </ShineButton>
                  )
                }
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
                  {/* Métricas de Progreso */}
                  {temaryData && !isLoadingTemary && (() => {
                    const metricas = obtenerMetricasProgreso();
                    if (metricas.totalSubtopics === 0) return null;
                    
                    return (
                      <div className="space-y-4 pb-4 border-b" style={{ borderColor: 'rgba(0, 163, 226, 0.3)' }}>
                        <h3 className="text-sm font-semibold mb-3" style={{ color: '#ffffff' }}>
                          Progreso del Curso
                        </h3>
                        
                        {/* Barra de progreso general */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs" style={{ color: '#cccccc' }}>
                              Progreso General
                            </span>
                            <span className="text-sm font-semibold" style={{ color: '#00A3E2' }}>
                              {metricas.porcentaje}%
                            </span>
                          </div>
                          <Progress 
                            value={metricas.porcentaje} 
                            className="h-2"
                            style={{ background: 'rgba(255, 255, 255, 0.3)' }}
                          />
                        </div>

                        {/* Estadísticas */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Subtemas completados */}
                          <div 
                            className="p-3 rounded-lg hover:shadow-[0_0_10px_rgba(0,163,226,1)]"
                            style={{
                              background: 'rgba(0, 163, 226, 0.15)',
                              borderLeft: '3px solid #00A3E2'
                            }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle2 className="w-4 h-4" style={{ color: '#00A3E2' }} />
                              <span className="text-xs" style={{ color: '#cccccc' }}>
                                Subtemas
                              </span>
                            </div>
                            <p className="text-lg font-semibold" style={{ color: '#ffffff' }}>
                              {metricas.completados}/{metricas.totalSubtopics}
                            </p>
                          </div>

                          {/* Módulos completados */}
                          <div 
                            className="p-3 rounded-lg hover:shadow-[0_0_10px_rgba(0,163,226,1)]"
                            style={{
                              background: 'rgba(0, 163, 226, 0.15)',
                              borderLeft: '3px solid #00A3E2'
                            }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <BookOpen className="w-4 h-4" style={{ color: '#00A3E2' }} />
                              <span className="text-xs" style={{ color: '#cccccc' }}>
                                Módulos
                              </span>
                            </div>
                            <p className="text-lg font-semibold" style={{ color: '#ffffff' }}>
                              {metricas.modulosCompletados}/{metricas.totalModulos}
                            </p>
                          </div>
                        </div>

                        {/* Estados de subtemas */}
                        {metricas.enCurso > 0 || metricas.pendientes > 0 ? (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {metricas.enCurso > 0 && (
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{
                                  background: 'rgba(0, 163, 226, 0.2)',
                                  borderColor: '#00A3E2',
                                  color: '#00A3E2'
                                }}
                              >
                                <Clock className="w-3 h-3 mr-1" />
                                {metricas.enCurso} en curso
                              </Badge>
                            )}
                            {metricas.pendientes > 0 && (
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.2)',
                                  borderColor: '#ffffff',
                                  color: '#ffffff'
                                }}
                              >
                                <Circle className="w-3 h-3 mr-1" />
                                {metricas.pendientes} pendientes
                              </Badge>
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })()}

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
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h2 className="text-xl sm:text-2xl" style={{ color: '#ffffff' }}>
                      Temario
                    </h2>
                    {temaryData?.modules && (
                      <Badge
                        variant="outline"
                        className="text-xs sm:text-sm"
                        style={{
                          background: 'rgba(0, 255, 0, 0.2)',
                          borderColor: '#00FF00',
                          color: '#00FF00'
                        }}
                      >
                        {calcularProgresoGeneral()}% completado
                      </Badge>
                    )}
                  </div>
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
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h3 className="text-base sm:text-lg" style={{ color: '#ffffff' }}>
                                {module.title}
                              </h3>
                              {module.subtopics && module.subtopics.length > 0 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                  style={{
                                    background: 'rgba(0, 163, 226, 0.2)',
                                    borderColor: '#00A3E2',
                                    color: '#00A3E2'
                                  }}
                                >
                                  {calcularProgresoModulo(module)}%
                                </Badge>
                              )}
                            </div>
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
                            {module.subtopics.map((subtopic: SubtopicTemaryI) => {
                              const { icon, color, texto } = obtenerIconoEstado(subtopic.state);
                              return (
                                <div
                                  key={subtopic.order}
                                  className="flex items-center gap-3 p-2 rounded hover:shadow-[0_0_5px_rgba(0,163,226,1)]"
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderLeft: `3px solid ${color}`
                                  }}
                                >
                                  {icon}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm" style={{ color: '#cccccc' }}>
                                        {subtopic.order}. {subtopic.title}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="text-xs px-2 py-0"
                                        style={{
                                          background: `${color}20`,
                                          borderColor: color,
                                          color: color
                                        }}
                                      >
                                        {texto}
                                      </Badge>
                                    </div>
                                    {subtopic.description && (
                                      <p className="text-xs mt-1" style={{ color: '#999999' }}>
                                        {subtopic.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
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
