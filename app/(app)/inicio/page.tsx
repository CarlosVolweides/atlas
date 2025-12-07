"use client";
import { useState } from 'react';
import { redirect } from 'next/navigation';
import { BookOpen, Search, Settings, LogOut, Plus, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
//import { CrearLeccionModal } from '@/components/CrearLeccionModal';
//import { EditarNombreLeccionModal } from '@/components/EditarNombreLeccionModal';
//import { LeccionViewer } from '@/components/LeccionViewer';
import { LeccionCard } from '@/components/LeccionCard';
import { Leccion } from '@/types/leccion';
import { leccionesInicialesEjemplo, crearNuevaLeccion } from './mocks';
import { useLogout } from '@/hooks/useAccount';

export default function InicioScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lecciones, setLecciones] = useState<Leccion[]>(leccionesInicialesEjemplo);
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [leccionAbierta, setLeccionAbierta] = useState<number | null>(null);

  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout();
    redirect('/');
  };

  // Calcular porcentaje basado en subtemas completados
  const calcularPorcentaje = (leccion: Leccion): number => {
    if (leccion.subtemas.length === 0) return 0;
    const completados = leccion.subtemas.filter(s => s.completado).length;
    return Math.round((completados / leccion.subtemas.length) * 100);
  };

  const handleCrearLeccion = (datos: { tema: string; dificultad: string; conocimientosPrevios: string }) => {

    const nuevaLeccion = crearNuevaLeccion(datos);

    // Agregar la nueva lección al inicio de la lista
    setLecciones([nuevaLeccion, ...lecciones]);
    
    console.log('Nueva lección creada:', datos);
  };

  const handleEditarLeccion = (index: number) => {
    setEditandoIndex(index);
    setIsEditModalOpen(true);
  };

  const handleGuardarNombre = (nuevoNombre: string) => {
    if (editandoIndex !== null) {
      const leccionesActualizadas = [...lecciones];
      leccionesActualizadas[editandoIndex] = {
        ...leccionesActualizadas[editandoIndex],
        nombre: nuevoNombre
      };
      setLecciones(leccionesActualizadas);
    }
  };

  const handleEliminarLeccion = (index: number) => {
    const leccionesActualizadas = lecciones.filter((_, i) => i !== index);
    setLecciones(leccionesActualizadas);
  };

  // Si hay una lección abierta, mostrar el visor de lección
  if (leccionAbierta !== null && lecciones[leccionAbierta]) {
    return (
      redirect(`/leccion/${lecciones[leccionAbierta].nombre}`)
    );
  }

  return (
    <div 
      className="min-h-screen max-h-screen flex flex-col overflow-hidden" 
      style={{ background: 'linear-gradient(135deg, #001a33 0%, #004d66 50%, #00A3E2 100%)' }}
    >
      {/* Header */}
      <header className="w-full px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0, 163, 226, 0.2)' }}>
        {/* Logo - Izquierda */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00A3E2 0%, #006b9a 100%)' }}>
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl" style={{ color: '#ffffff' }}>Atlas</span>
        </div>

        {/* Barra de búsqueda - Centro */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#999999' }} />
            <Input
              type="text"
              placeholder="Buscar temas, cursos o planes de estudio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
              style={{ 
                background: '#23303F', 
                borderColor: '#00A3E2',
                color: '#ffffff'
              }}
            />
          </div>
        </div>

        {/* Avatar con dropdown - Derecha */}
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer ring-2 ring-cyan-400 hover:ring-cyan-300 transition-all">
              <User className="w-4 h-4 text-white" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48" style={{ background: '#262422', borderColor: '#00A3E2' }}>
            <DropdownMenuLabel className="text-sm font-semibold text-center" style={{ color: '#ffffff' }}>
              {'Usuario'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer" 
              style={{ color: '#ffffff' }}
              onClick={() => {}}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer" 
              style={{ color: '#ffffff' }}
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Contenido principal */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="mb-6 text-3xl" style={{ color: '#ffffff' }}>
            Mis Lecciones
          </h2>
          
          {/* Card de Crear Lección */}
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
                Crear lección
              </span>
            </div>
          </Card>
          
          {/* Grid de 3 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lecciones.map((leccion, index) => (
              <div key={index} onClick={() => setLeccionAbierta(index)}>
                <LeccionCard
                  nombre={leccion.nombre}
                  porcentaje={calcularPorcentaje(leccion)}
                  tecnologias={leccion.tecnologias}
                  onEdit={() => handleEditarLeccion(index)}
                  onDelete={() => handleEliminarLeccion(index)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
{/*
      <CrearLeccionModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCrearLeccion={handleCrearLeccion}
      />

      <EditarNombreLeccionModal 
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        nombreActual={editandoIndex !== null ? lecciones[editandoIndex]?.nombre : ''}
        onGuardar={handleGuardarNombre}
      />
      */}
    </div>
  );
}