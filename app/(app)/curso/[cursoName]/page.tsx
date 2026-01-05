"use client";
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, BookOpen, 
  CheckCircle2, Circle, 
  Clock, XCircle, 
  AlertCircle, 
  ClipboardList, ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ModuleTemaryI, EstadoSubtema } from '@/types/course';
import { useTemary, useContextSubtopic, useUpdateSubtemaEstado } from '@/hooks/useCourse';
import { toast } from "sonner";

const mockTecnologias = ['PHP', 'MySQL', 'HTML'];

type FlatSubtopic = {
  globalIndex: number
  moduleOrder: number
  subtopicOrder: number
  title: string,
  state: EstadoSubtema
}

export default function LeccionViewer() {
  const router = useRouter();
  const params = useParams();
  const courseId = parseInt(params?.cursoName as string || '0');
  const { data: temaryData } = useTemary(courseId, { enabled: courseId > 0 });
  const nombreCurso = (params?.cursoName as string) || 'Curso';

  const flatSubtopics = useMemo<FlatSubtopic[]>(() => {
  if (!temaryData) return []

  let index = 0

  return temaryData?.modules.flatMap((module : ModuleTemaryI) =>
    module.subtopics.map(sub => ({
      globalIndex: index++,
      moduleOrder: module.order,
      subtopicOrder: sub.order,
      title: sub.title,
      state: sub.state ?? 'pendiente'
    }))
  )
}, [temaryData])
  const totalSubtopics = flatSubtopics.length;

  // Estado: índice global del subtema actual
  const [subtemaActual, setSubtemaActual] = useState(0);
  const [estadosSubtemas, setEstadosSubtemas] = useState<EstadoSubtema[]>([]);

  const ordenActivo = useMemo(() => {
  if (subtemaActual === null || !flatSubtopics[subtemaActual]) return null
  return flatSubtopics[subtemaActual]
    ? {
        mod: flatSubtopics[subtemaActual].moduleOrder,
        sub: flatSubtopics[subtemaActual].subtopicOrder
      }
    : null
}, [subtemaActual, flatSubtopics])

  const { mutateAsync: persistEstado } = useUpdateSubtemaEstado()

  const [modulosExpandidos, setModulosExpandidos] = useState<Set<number>>(new Set([])); // Primer módulo expandido por defecto
  const [modoTutoria, setModoTutoria] = useState(false);
  const [subtemaAprobado, setSubtemaAprobado] = useState(false);
  const [modoPrueba, setModoPrueba] = useState(false);

  //Estado de generacion de subtemas
  const [subtopicIsLoading, setsubtopicIsLoading ] = useState(false)
  //Estado de actualizacion de subtema
  const [isAdvancing, setIsAdvancing] = useState(false)

  const tieneContenido = useMemo(() => {
    const estadoActual = estadosSubtemas[subtemaActual];

    if (!estadoActual) return false;
    return estadoActual !== 'vacio';
  }, [estadosSubtemas, subtemaActual]);

  const {
    data: contextSubtopic,
    isLoading,
    isError
  } = useContextSubtopic(
    courseId,
    ordenActivo?.mod ?? null,
    ordenActivo?.sub ?? null,
    tieneContenido // <--- Hara la consulta solo si no es 'vacio'
  )

  // Función para obtener el estado actual de un subtema
  const obtenerEstadoSubtema = (index: number): EstadoSubtema => {
    const estadoBase = estadosSubtemas[index] ?? 'pendiente';
    if (index === subtemaActual) {
      if (modoPrueba) return 'listo-para-prueba';
      if (modoTutoria || subtemaAprobado) return 'en-curso';
    }
    return estadoBase || 'pendiente';
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

  const handleMarcarCompletado = () => {//Viejo handle diseñado para pruebas
    // Primero mostrar la prueba antes de marcar como completado
    setModoPrueba(true);
  };
  
  const marcarSubtemaCompletado = async () => {
    if (subtemaActual === null) return

    const indexObjetivo = subtemaActual
    const sub = flatSubtopics[indexObjetivo]

    setEstadosSubtemas(prev => {
      const copy = [...prev]
      copy[indexObjetivo] = 'completado'
      return copy
    })

    try {
      // Persistir en BD
      await persistEstado({
        courseId: courseId,
        moduleOrder: sub.moduleOrder,
        subtopicOrder: sub.subtopicOrder,
        newState: 'completado'
      })
    } catch (error) {
      // Rollback
      setEstadosSubtemas(prev => {
        const copy = [...prev]
        copy[indexObjetivo] = sub.state
        return copy
      })
      toast.error('No se pudo guardar el subtema como completado')
      throw error
  }
}

  const handleGenerarSubtema = () => {
    setsubtopicIsLoading(true)
  }

  const handleSiguiente = async () => {
    if (isAdvancing) return
    if (subtemaActual < totalSubtopics - 1) {
      setIsAdvancing(true)
      
      try {
        await marcarSubtemaCompletado()
        setSubtemaActual(subtemaActual + 1);
        setModoTutoria(false);
        setSubtemaAprobado(false);
        setModoPrueba(false);
        setsubtopicIsLoading(false);
      } catch {
        toast.error('No se pudo guardar el progreso')
      } finally {
        setIsAdvancing(false)
      }

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

  
  const handleVolver = () => {
    router.push('/inicio');
  };
  const handleCambiarSubtema = (index: number) => {
    setSubtemaActual(index);
    setsubtopicIsLoading(false);
    
  }

  // Para iniciar estados provenientes del flatSubtopics (temaryData)
  const initializedRef = useRef(false)

  useEffect(() => {
  if (!flatSubtopics.length || initializedRef.current) return

  const iniciales: EstadoSubtema[] = flatSubtopics.map(
    sub => sub.state
  )

  setEstadosSubtemas(iniciales)

  const primerPendiente =
    iniciales.findIndex(e => e !== 'completado')

  setSubtemaActual(primerPendiente !== -1 ? primerPendiente : 0)

  initializedRef.current = true
}, [flatSubtopics])


  useEffect(() => {
  if (subtemaActual === null) return

  const sub = flatSubtopics[subtemaActual]
  if (!sub) return

  const moduleIndex = temaryData.modules.findIndex(
    (m: ModuleTemaryI) => m.order === sub.moduleOrder
  )

  if (moduleIndex !== -1) {
    setModulosExpandidos(prev => new Set([...prev, moduleIndex]))
  }
}, [subtemaActual, flatSubtopics, temaryData])


  const porcentajeCompletado = Math.round(
    (estadosSubtemas.filter(e => e === 'completado').length / totalSubtopics) * 100
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
                {estadosSubtemas.filter(e => e === 'completado').length}/{totalSubtopics}
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
                  {estadosSubtemas.filter(e => e === 'completado').length}/{totalSubtopics}
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
                  const subtopicsDelModulo = flatSubtopics.filter(
                      s => s.moduleOrder === module.order
                    )
                  
                  return (
                    <div key={moduleIndex} className="space-y-1">
                      {/* Header del módulo */}
                      <button
                        onClick={() => toggleModulo(moduleIndex)}
                        className="w-full text-left p-2 md:p-3 rounded-lg transition-all flex items-center justify-between cursor-pointer"
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
                          {subtopicsDelModulo.map(sub => {
                            const globalIndex = sub.globalIndex
                            const estado = obtenerEstadoSubtema(globalIndex)
                            const { icon } = obtenerIconoEstado(estado);
                            const isActive = subtemaActual === globalIndex;
                            const isBlocked =
                              globalIndex > 0 &&
                              estadosSubtemas[globalIndex - 1] !== 'completado'
                            
                            return (
                              <button
                                key={globalIndex}
                                onClick={() => 
                                  isBlocked 
                                  ? toast.warning("Subtema bloqueado, se requiere completar Subtemas o Modulos anteriores")
                                  : handleCambiarSubtema(globalIndex)
                                }                                
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
                                  <span className="text-xs truncate">{sub.title}</span>
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
                      {flatSubtopics[subtemaActual]?.title || 'Subtema'}
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
                    {flatSubtopics[subtemaActual]?.title ? 
                      `Contenido del subtema: ${flatSubtopics[subtemaActual].title}. Este es un placeholder para el contenido real que se cargará desde la base de datos.` :
                      'Cargando contenido...'
                    }
                  </p>
                </div>

                <div className="flex flex-col gap-3 md:gap-4 pt-4 md:pt-6 border-t" style={{ borderColor: 'rgba(0, 163, 226, 0.2)' }}>
                  {/* Botón de generar subtema */}
                  {estadosSubtemas[subtemaActual] == 'vacio' && (
                    <div>                      
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
                    </div>
                  )}

                  {estadosSubtemas[subtemaActual] !== 'vacio' && (
                    <div className="flex flex-col gap-4">

                      {/* Contenido de subtema */}
                      <p className="w-full text-sm md:text-base"
                      style={{
                        color: '#ffffff',
                        textAlign: 'center'
                      }}>
                        Contenido de la BD
                        <br />
                        { contextSubtopic?.content }
                      </p>

                      {subtemaActual < totalSubtopics - 1 && (
                        <Button
                        onClick={handleSiguiente}
                        disabled={isAdvancing}
                        variant="outline"
                        className="md:ml-auto md:w-auto w-full text-sm md:text-base"
                        style={{
                          background: 'rgba(0, 163, 226, 0.1)',
                          borderColor: '#00A3E2',
                          color: '#ffffff'
                        }}
                      >
                        {isAdvancing ? 'Guardando...' : 'Siguiente subtema'}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                      )}
                    </div>
                  )}

                </div>
              </CardContent>
            </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="mb-3 md:mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                <h2 className="text-xl md:text-2xl" style={{ color: '#ffffff' }}>
                  {flatSubtopics[subtemaActual]?.title || 'Subtema'}
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