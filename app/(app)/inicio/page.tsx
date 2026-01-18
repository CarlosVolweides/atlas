"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { CrearCursoModal } from '@/components/CrearCursoModal';
import { ChargeModal } from '@/components/ChargeModal';
import { CursoCard } from '@/components/CursoCard';
import { CursoCardI } from '@/types/course';
import { useCourses, useCreateCourse } from '@/hooks/useCourse';
import { TemaryModal } from '@/components/TemaryModal';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Header } from '@/components/Header';


export default function InicioScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [isTemaryModalOpen, setIsTemaryModalOpen] = useState(false);
  const [createdCourseId, setCreatedCourseId] = useState<number | null>(null);
  const [cursos, setCursos] = useState<CursoCardI[]>([]);
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 9;
  const router = useRouter();
  const { data: cursosData } = useCourses(currentPage, limit);
  console.log("CursoData",cursosData)
  const createCourseMutation = useCreateCourse();
  
  const totalPages = cursosData ? Math.ceil(cursosData.total / limit) : 1;
  
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSettingsClick = () => {
    console.log("si hay cursos:", cursosData);
  };

  // Calcular porcentaje basado en subtemas completados
  const calcularPorcentaje = (curso: CursoCardI): number => {
    if (curso.subtemas.length === 0) return 0;
    const completados = curso.subtemas.filter(s => s.completado).length;
    return Math.round((completados / curso.subtemas.length) * 100);
  };

  const handleCrearCurso = (datos: { 
    tecnologiaPrincipal: string;
    razonCurso: string;
    indispensables?: string[] | undefined;
    conocimientosPrevios?: string[] | undefined;
    tecnologiasFueraAlcance?: string[] | undefined;
    dificultad: string;
  }) => {
    setIsChargeModalOpen(true);
    createCourseMutation.mutate({
      tecnologiaPrincipal: datos.tecnologiaPrincipal,
      dificultad: datos.dificultad,
      razonCurso: datos.razonCurso,
      requiredTools: datos.indispensables,
      priorKnowledge: datos.conocimientosPrevios,
      outOfScope: datos.tecnologiasFueraAlcance,
    }, {
      onSuccess: (data: any) => {
        setIsChargeModalOpen(false);
        const courseId = data?.courseId || data?.id;
        if (courseId) {
          setCreatedCourseId(courseId);
          setIsTemaryModalOpen(true);
          setCurrentPage(1); // Reset to first page to see the new course
        }
      },
      onError: () => {
        setIsChargeModalOpen(false);
        setCreatedCourseId(null);
      },
    });
    console.log('Nuevo curso creado:', datos);
  };

  const handleEditarCurso = (index: number) => {
    setEditandoIndex(index);
    setIsEditModalOpen(true);
  };

  const handleGuardarNombre = (nuevoNombre: string) => {
    if (editandoIndex !== null) {
      const cursosActualizados = [...cursos];
      cursosActualizados[editandoIndex] = {
        ...cursosActualizados[editandoIndex],
        nombre: nuevoNombre
      };
      setCursos(cursosActualizados);
    }
  };

  const handleEliminarCurso = (index: number) => {
    const cursosActualizados = cursos.filter((_, i) => i !== index);
    setCursos(cursosActualizados);
  };

  return (
    <div 
      className="min-h-screen max-h-screen flex flex-col overflow-hidden" 
      style={{ background: 'linear-gradient(135deg, #001a33 0%, #004d66 50%, #00A3E2 100%)' }}
    >
      <Header 
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onSettingsClick={handleSettingsClick}
      />

      {/* Contenido principal */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="mb-6 text-3xl flex items-center gap-3" style={{ color: '#ffffff' }}>
            Mis Cursos
            {cursosData && (
              <span 
                className="text-lg px-3 py-1 rounded-full"
                style={{ 
                  background: 'rgba(0, 163, 226, 0.2)', 
                  border: '1px solid rgba(0, 163, 226, 0.5)',
                  color: '#00A3E2'
                }}
              >
                {cursosData.total}
              </span>
            )}
          </h2>
          
          {/* Card de Crear Curso */}
          <Card 
            className="mb-6 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
            onClick={() => setIsModalOpen(true)}
            style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderColor: '#00A3E2',
              borderWidth: '2px',
              borderStyle: 'dashed',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="flex items-center justify-center gap-3 py-6">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #00A3E2 0%, #006b9a 100%)' }}
              >
                <Plus className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl" style={{ color: '#ffffff' }}>
                Crear curso
              </span>
            </div>
          </Card>
          
          {/* Grid de 3 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cursosData?.courses?.map((curso, index) => (
              <div key={curso.id} onClick={() => router.push(`/detalle/${curso.id}`)}>
                <CursoCard                  
                  nombre={curso.tecnologia}
                  porcentaje={curso.progreso}
                  tecnologias={curso.herramientasRequeridas}
                  dificultad={curso.dificultad}
                  created_at={curso.created_at}
                  onEdit={() => handleEditarCurso(index)}
                  onDelete={() => handleEliminarCurso(index)}
                />
              </div>
            ))}
          </div>
          
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) {
                          handlePageChange(currentPage - 1);
                        }
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {(() => {
                    const pages: (number | string)[] = [];
                    const showEllipsis = totalPages > 7;
                    
                    if (!showEllipsis) {
                      // Show all pages if 7 or fewer
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Always show first page
                      pages.push(1);
                      
                      if (currentPage <= 4) {
                        // Near the start: 1 2 3 4 5 ... last
                        for (let i = 2; i <= 5; i++) {
                          pages.push(i);
                        }
                        pages.push('ellipsis');
                        pages.push(totalPages);
                      } else if (currentPage >= totalPages - 3) {
                        // Near the end: 1 ... (n-4) (n-3) (n-2) (n-1) n
                        pages.push('ellipsis');
                        for (let i = totalPages - 4; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        // In the middle: 1 ... (current-1) current (current+1) ... last
                        pages.push('ellipsis');
                        pages.push(currentPage - 1);
                        pages.push(currentPage);
                        pages.push(currentPage + 1);
                        pages.push('ellipsis');
                        pages.push(totalPages);
                      }
                    }
                    
                    return pages.map((page, index) => {
                      if (page === 'ellipsis') {
                        return (
                          <PaginationItem key={`ellipsis-${index}`}>
                            <span className="px-2">...</span>
                          </PaginationItem>
                        );
                      }
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page as number);
                            }}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    });
                  })()}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) {
                          handlePageChange(currentPage + 1);
                        }
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
      <CrearCursoModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCrearCurso={handleCrearCurso}
      />
      <ChargeModal 
        open={isChargeModalOpen}
        onOpenChange={setIsChargeModalOpen}
      />

      <TemaryModal 
        open={isTemaryModalOpen}
        onOpenChange={setIsTemaryModalOpen}
        temaryid={createdCourseId || null}
      />

    </div>
  );
}