"use client";
import { useState, useEffect, useRef, use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, BookOpen, 
  CheckCircle2, Circle, 
  Clock, XCircle, 
  AlertCircle, Timer, 
  ClipboardList, ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SubtopicTemaryI, ModuleTemaryI, EstadoSubtema } from '@/types/course';
import { useTemary } from '@/hooks/useCourse';

const mockTecnologias = ['PHP', 'MySQL', 'HTML'];

export default function LeccionViewer() {
  const router = useRouter();
  const params = useParams();
  const courseId = parseInt(params?.cursoName as string || '0');
  const { data: temaryData } = useTemary(courseId, { enabled: courseId > 0 });
  const nombreCurso = (params?.cursoName as string) || 'Curso';
  
  // Helper: Obtener todos los subtemas en un array plano
  const getAllSubtopics = () => {
    const allSubtopics: Array<{ moduleIndex: number; subtopicIndex: number; subtopic: SubtopicTemaryI }> = [];
    temaryData?.modules.forEach((module: ModuleTemaryI, moduleIndex: number) => {
      module.subtopics.forEach((subtopic: SubtopicTemaryI, subtopicIndex: number) => {
        allSubtopics.push({ moduleIndex, subtopicIndex, subtopic });
      });
    });
    return allSubtopics;
  };

  const allSubtopics = getAllSubtopics();
  const totalSubtopics = allSubtopics.length;

  // Estado: índice global del subtema actual
  const [subtemaActual, setSubtemaActual] = useState(0);
  const [estadosSubtemas, setEstadosSubtemas] = useState<EstadoSubtema[]>(
    new Array(totalSubtopics).fill('pendiente')
  );
  const [modulosExpandidos, setModulosExpandidos] = useState<Set<number>>(new Set([0])); // Primer módulo expandido por defecto
  const [modoTutoria, setModoTutoria] = useState(false);
  const [subtemaAprobado, setSubtemaAprobado] = useState(false);
  const [modoPrueba, setModoPrueba] = useState(false);

  // Estado para tracking de tiempo por subtema
  const [tiemposPorSubtema, setTiemposPorSubtema] = useState<number[]>(
    new Array(totalSubtopics).fill(0)
  );
  const [tiempoSubtemaActual, setTiempoSubtemaActual] = useState(0); // Tiempo del subtema actual
  const tiempoInterval = useRef<NodeJS.Timeout | null>(null);

  //Estado de generacion de subtemas
  const [subtopicIsLoading, setsubtopicIsLoading ] = useState(false)
  // Iniciar el contador de tiempo para el subtema actual
  useEffect(() => {
    // Limpiar intervalo anterior si existe
    if (tiempoInterval.current) {
      clearInterval(tiempoInterval.current);
    }

    // Iniciar nuevo intervalo
    tiempoInterval.current = setInterval(() => {
      setTiempoSubtemaActual(prev => prev + 1);
    }, 1000);

    return () => {
      if (tiempoInterval.current) {
        clearInterval(tiempoInterval.current);
      }
    };
  }, [subtemaActual]); // Reiniciar cuando cambia de subtema

  // Función para formatear el tiempo
  const formatearTiempo = (segundos: number): string => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;

    if (horas > 0) {
      return `${horas}h ${minutos}m`;
    } else if (minutos > 0) {
      return `${minutos}m ${segs}s`;
    } else {
      return `${segs}s`;
    }
  };

  // Calcular tiempo total invertido en subtemas aprobados
  const tiempoTotalAprobados = (tiemposPorSubtema || []).reduce((total, tiempo, index) => {
    if (estadosSubtemas[index] === 'aprobado') {
      return total + tiempo;
    }
    return total;
  }, 0);

  // Función para obtener el estado actual de un subtema
  const obtenerEstadoSubtema = (index: number, stateIndex: EstadoSubtema): EstadoSubtema => {
    if (index === subtemaActual) {
      if (modoPrueba) return 'listo-para-prueba';
      if (modoTutoria || subtemaAprobado) return 'en-curso';
    }
    return stateIndex || estadosSubtemas[index] || 'pendiente';
  };

  // Función para obtener el icono y color según el estado
  const obtenerIconoEstado = (estado: EstadoSubtema | undefined) => {
    const estadoValido = estado || 'pendiente';
    switch (estadoValido) {
      case 'vacio':
        return { 
          icon: <Circle className="w-5 h-5 flex-shrink-0" style={{ color: '#666666' }} />,
          color: '#666666ff',
          texto: 'Pendiente'
        };
      case 'pendiente':
        return { 
          icon: <Clock className="w-5 h-5 flex-shrink-0" style={{ color: '#FFA500' }} />,
          color: '#FFA500',
          texto: 'En curso'
        };
      case 'listo-para-prueba':
        return { 
          icon: <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#FFFF00' }} />,
          color: '#FFFF00',
          texto: 'Listo para prueba'
        };
      case 'aprobado':
        return { 
          icon: <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#00FF00' }} />,
          color: '#00FF00',
          texto: 'Aprobado'
        };
      case 'reprobado':
        return { 
          icon: <XCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#FF4444' }} />,
          color: '#FF4444',
          texto: 'Reprobado'
        };
      case 'completado':
        return { 
          icon: <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#00FF00' }} />,
          color: '#00FF00',
          texto: 'Completado'
        };
      default:
        return { 
          icon: <Circle className="w-5 h-5 flex-shrink-0" style={{ color: '#666666' }} />,
          color: '#666666ff',
          texto: 'Pendiente'
        };
    }
  };

  const handleMarcarCompletado = () => {
    // Primero mostrar la prueba antes de marcar como completado
    setModoPrueba(true);
  };

  const handleGenerarSubtema = () => {
    setsubtopicIsLoading(true)
  }

  const handleSiguiente = () => {
    if (subtemaActual < totalSubtopics - 1) {
      setSubtemaActual(subtemaActual + 1);
      setModoTutoria(false);
      setSubtemaAprobado(false);
      setModoPrueba(false);
    }
  };

  const toggleModulo = (moduleIndex: number) => {
    setModulosExpandidos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleIndex)) {
        newSet.delete(moduleIndex);
      } else {
        newSet.add(moduleIndex);
      }
      return newSet;
    });
  };

  const handleCambiarSubtemaPorIndices = (moduleIndex: number, subtopicIndex: number) => {
    // Encontrar el índice global del subtema
    let globalIndex = 0;
    for (let i = 0; i < moduleIndex; i++) {
      globalIndex += temaryData?.modules[i]?.subtopics.length || 0;
    }
    globalIndex += subtopicIndex;
    handleCambiarSubtema(globalIndex);
  };

  const handleVolver = () => {
    router.push('/inicio');
  };

  const handleCambiarSubtema = (index: number) => {
    setSubtemaActual(index);
    // Resetear el contador de tiempo para el nuevo subtema
    setTiempoSubtemaActual(0);
    setModoTutoria(false);
    setSubtemaAprobado(false);
    setModoPrueba(false);
    
    // Expandir el módulo que contiene este subtema
    const currentSubtopic = allSubtopics[index];
    if (currentSubtopic) {
      setModulosExpandidos(prev => new Set([...prev, currentSubtopic.moduleIndex]));
    }
  };


  const porcentajeCompletado = Math.round(
    (estadosSubtemas.filter(e => e === 'aprobado').length / totalSubtopics) * 100
  );

  return (
    <div 
      className="min-h-screen max-h-screen flex flex-col overflow-hidden" 
      style={{ background: 'linear-gradient(135deg, #001a33 0%, #004d66 50%, #00A3E2 100%)' }}
    >
      {/* Header */}
      <header 
        className="w-full px-4 md:px-8 py-3 md:py-4" 
        style={{ 
          background: 'rgba(0, 0, 0, 0.3)', 
          backdropFilter: 'blur(10px)', 
          borderBottom: '1px solid rgba(0, 163, 226, 0.2)' 
        }}
      >
        {/* Versión móvil */}
        <div className="flex md:hidden flex-col gap-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleVolver}
              className="gap-2"
              style={{ color: '#ffffff' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #00A3E2 0%, #006b9a 100%)' }}
            >
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg truncate" style={{ color: '#ffffff' }}>{nombreCurso}</h1>
              <div className="flex gap-2 mt-1 flex-wrap">
                {mockTecnologias.map((tech, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded" style={{ 
                    background: 'rgba(0, 163, 226, 0.3)',
                    color: '#ffffff'
                  }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2 rounded-lg" style={{ 
              background: 'rgba(0, 163, 226, 0.2)',
              backdropFilter: 'blur(10px)',
              borderColor: '#00A3E2',
              borderWidth: '1px'
            }}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-3 h-3" style={{ color: '#00A3E2' }} />
                <span className="text-xs" style={{ color: '#cccccc' }}>Subtemas</span>
              </div>
              <p className="text-lg" style={{ color: '#ffffff' }}>
                {estadosSubtemas.filter(e => e === 'aprobado').length}/{totalSubtopics}
              </p>
            </div>

            <div className="flex-1 px-3 py-2 rounded-lg" style={{ 
              background: 'rgba(0, 163, 226, 0.2)',
              backdropFilter: 'blur(10px)',
              borderColor: '#00A3E2',
              borderWidth: '1px'
            }}>
              <div className="flex items-center gap-2 mb-1">
                <Timer className="w-3 h-3" style={{ color: '#00A3E2' }} />
                <span className="text-xs" style={{ color: '#cccccc' }}>Tiempo</span>
              </div>
              <p className="text-lg" style={{ color: '#ffffff' }}>
                {formatearTiempo(tiempoTotalAprobados)}
              </p>
            </div>
          </div>

          <div className="w-full">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs" style={{ color: '#ffffff' }}>Progreso</span>
              <span className="text-xs" style={{ color: '#ffffff' }}>{porcentajeCompletado}%</span>
            </div>
            <Progress 
              value={porcentajeCompletado} 
              className="h-2"
              style={{ background: 'rgba(255, 255, 255, 0.3)' }}
            />
          </div>
        </div>

        {/* Versión desktop */}
        <div className="hidden md:flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleVolver}
            className="gap-2"
            style={{ color: '#ffffff' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>

          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00A3E2 0%, #006b9a 100%)' }}
            >
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl" style={{ color: '#ffffff' }}>{nombreCurso}</h1>
              <div className="flex gap-2 mt-1">
                {mockTecnologias.map((tech, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded" style={{ 
                    background: 'rgba(0, 163, 226, 0.3)',
                    color: '#ffffff'
                  }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Estadísticas */}
            <div className="flex gap-4">
              {/* Subtemas aprobados */}
              <div className="px-4 py-2 rounded-lg" style={{ 
                background: 'rgba(0, 163, 226, 0.2)',
                backdropFilter: 'blur(10px)',
                borderColor: '#00A3E2',
                borderWidth: '1px'
              }}>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4" style={{ color: '#00A3E2' }} />
                  <span className="text-xs" style={{ color: '#cccccc' }}>Subtemas aprobados</span>
                </div>
                <p className="text-xl" style={{ color: '#ffffff' }}>
                  {estadosSubtemas.filter(e => e === 'aprobado').length}/{totalSubtopics}
                </p>
              </div>
            </div>

            {/* Progreso */}
            <div className="w-48">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm" style={{ color: '#ffffff' }}>Progreso</span>
                <span className="text-sm" style={{ color: '#ffffff' }}>{porcentajeCompletado}%</span>
              </div>
              <Progress 
                value={porcentajeCompletado} 
                className="h-2"
                style={{ background: 'rgba(255, 255, 255, 0.3)' }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-8">
        {/* Lista de subtemas - Sidebar */}
        <div className="w-full md:w-80 md:flex-shrink-0 flex flex-col min-h-0">
          <Card 
            style={{ 
              background: 'rgba(38, 36, 34, 0.6)', 
              backdropFilter: 'blur(10px)',
              borderColor: '#00A3E2',
              borderWidth: '1px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <CardContent className="p-3 md:p-4 flex flex-col flex-1 min-h-0 overflow-hidden">
              <h3 className="mb-3 md:mb-4 text-base md:text-lg flex-shrink-0" style={{ color: '#ffffff' }}>
                Contenido del curso
              </h3>
              <div className="space-y-1 flex-1 overflow-y-auto pr-1" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#00A3E2 rgba(255, 255, 255, 0.1)'
              }}>
                {temaryData?.modules.map((module: ModuleTemaryI, moduleIndex: number) => {
                  const isExpanded = modulosExpandidos.has(moduleIndex);
                  // Calcular índice global inicial para este módulo
                  let globalIndexStart = 0;
                  for (let i = 0; i < moduleIndex; i++) {
                    globalIndexStart += temaryData?.modules[i]?.subtopics.length || 0;
                  }
                  
                  return (
                    <div key={moduleIndex} className="space-y-1">
                      {/* Header del módulo */}
                      <button
                        onClick={() => toggleModulo(moduleIndex)}
                        className="w-full text-left p-2 md:p-3 rounded-lg transition-all flex items-center justify-between"
                        style={{
                          background: 'rgba(0, 163, 226, 0.15)',
                          borderLeft: '3px solid #00A3E2'
                        }}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div
                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
                            style={{ 
                              background: '#00A3E2',
                              color: '#ffffff'
                            }}
                          >
                            {module.order}
                          </div>
                          <span className="text-xs md:text-sm font-medium truncate" style={{ color: '#ffffff' }}>
                            {module.title}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: '#00A3E2' }} />
                        ) : (
                          <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#00A3E2' }} />
                        )}
                      </button>

                      {/* Subtemas del módulo */}
                      {isExpanded && (
                        <div className="ml-4 space-y-1 border-l-2 pl-2" style={{ borderColor: 'rgba(0, 163, 226, 0.3)' }}>
                          {module.subtopics.map((subtopic: SubtopicTemaryI, subtopicIndex: number) => {
                            const globalIndex = globalIndexStart + subtopicIndex;
                            if(!subtopic.state){
                                throw new Error("No existe estado en uno de los subtopic")
                            }                            
                            const estado = obtenerEstadoSubtema(globalIndex, subtopic.state);
                            const { icon } = obtenerIconoEstado(estado);
                            const isActive = subtemaActual === globalIndex;
                            
                            return (
                              <button
                                key={subtopicIndex}
                                onClick={() => handleCambiarSubtemaPorIndices(moduleIndex, subtopicIndex)}
                                className={`w-full text-left p-2 rounded-lg transition-all ${
                                  isActive ? 'ring-2 ring-cyan-400' : ''
                                }`}
                                style={{
                                  background: isActive 
                                    ? 'rgba(0, 163, 226, 0.2)' 
                                    : 'rgba(255, 255, 255, 0.05)',
                                  color: '#ffffff'
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  {icon}
                                  <span className="text-xs truncate">{subtopic.title}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

              </div>
              {/* Botón de Tutoría Guiada ( vv ELIMINAR false para activar boton*/}
              {!modoTutoria && !modoPrueba && false && (
                <div className="mt-4 pt-4 border-t flex-shrink-0" style={{ borderColor: 'rgba(0, 163, 226, 0.2)' }}>
                  <Button
                    onClick={() => setModoTutoria(true)}
                    className="w-full text-sm md:text-base"
                    style={{
                      background: 'linear-gradient(135deg, #00A3E2 0%, #006b9a 100%)',
                      color: '#ffffff',
                      border: 'none'
                    }}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Iniciar Tutoría Guiada
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contenido del subtema actual */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {modoPrueba ? (
            <div className="h-full">
            </div>
          ) : !modoTutoria ? (
            <div className="h-full overflow-y-auto">
              <Card 
                style={{ 
                  background: 'rgba(38, 36, 34, 0.6)', 
                  backdropFilter: 'blur(10px)',
                  borderColor: '#00A3E2',
                  borderWidth: '1px'
                }}
              >
              <CardContent className="p-4 md:p-8">
                <div className="mb-4 md:mb-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 mb-3 md:mb-4">
                    <h2 className="text-xl md:text-2xl" style={{ color: '#ffffff' }}>
                      {allSubtopics[subtemaActual]?.subtopic.title || 'Subtema'}
                    </h2>
                    {estadosSubtemas[subtemaActual] === 'aprobado' && (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full self-start" style={{ background: 'rgba(0, 163, 226, 0.2)' }}>
                        <CheckCircle2 className="w-4 h-4" style={{ color: '#00A3E2' }} />
                        <span className="text-sm" style={{ color: '#00A3E2' }}>Completado</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs md:text-sm" style={{ color: '#cccccc' }}>
                    Subtema {subtemaActual + 1} de {totalSubtopics}
                  </div>
                </div>

                <div 
                  className="prose prose-invert max-w-none mb-6 md:mb-8"
                  style={{ color: '#ffffff', lineHeight: '1.8' }}
                >
                  <p className="mb-3 md:mb-4 text-sm md:text-base">
                    {allSubtopics[subtemaActual]?.subtopic.title ? 
                      `Contenido del subtema: ${allSubtopics[subtemaActual].subtopic.title}. Este es un placeholder para el contenido real que se cargará desde la base de datos.` :
                      'Cargando contenido...'
                    }
                  </p>
                </div>

                <div className="flex flex-col gap-3 md:gap-4 pt-4 md:pt-6 border-t" style={{ borderColor: 'rgba(0, 163, 226, 0.2)' }}>
                  {/* Botón de generar subtema */}
                  {estadosSubtemas[subtemaActual] !== 'aprobado' && (
                    <Button
                      onClick={handleGenerarSubtema}
                      variant="outline"
                      className="w-full text-sm md:text-base"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderColor: '#00A3E2',
                        color: '#ffffff'
                      }}
                    >
                      <ClipboardList className="w-4 h-4 mr-2" />
                      Generar subtema
                    </Button>
                  )}

                  {/* Contenido de subtema */}
                  {subtopicIsLoading && (
                    <p 
                    className="w-full text-sm md:text-base"
                    style={{
                      color: '#ffffff',
                      textAlign: 'center'
                    }}>
                      Generando Subtema...
                    </p>
                    
                  )}

                  {subtemaActual < totalSubtopics - 1 && (
                    <Button
                      onClick={handleSiguiente}
                      variant="outline"
                      className="md:ml-auto md:w-auto w-full text-sm md:text-base"
                      style={{
                        background: 'rgba(0, 163, 226, 0.1)',
                        borderColor: '#00A3E2',
                        color: '#ffffff'
                      }}
                    >
                      Siguiente subtema
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="mb-3 md:mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                <h2 className="text-xl md:text-2xl" style={{ color: '#ffffff' }}>
                  {allSubtopics[subtemaActual]?.subtopic.title || 'Subtema'}
                </h2>
                <Button
                  onClick={() => setModoTutoria(false)}
                  variant="outline"
                  size="sm"
                  className="self-start md:self-auto"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderColor: '#00A3E2',
                    color: '#ffffff'
                  }}
                >
                  Volver a lectura
                </Button>
              </div>
              <div className="flex-1 min-h-0">
              </div>
              
              {/* Botón para realizar prueba después de completar la tutoría */}
              {subtemaAprobado && (
                <div className="mt-3 md:mt-4">
                  <Button
                    onClick={handleMarcarCompletado}
                    className="w-full text-sm md:text-base"
                    style={{
                      background: 'linear-gradient(135deg, #00FF00 0%, #00AA00 100%)',
                      color: '#ffffff',
                      border: 'none'
                    }}
                  >
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Realizar Prueba del Subtema
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}