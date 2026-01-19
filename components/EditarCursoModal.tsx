"use client";
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Edit2, BookOpen } from 'lucide-react';
import { iconMapping } from '@/lib/utils/iconMapping';

const editarCursoSchema = z.object({
  titulo: z.string().min(1, 'El título es requerido'),
  image: z.number().nullable().optional(),
});

type EditarCursoFormData = z.infer<typeof editarCursoSchema>;

interface EditarCursoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: number;
  initialTitle: string;
  initialImage: number | null;
  onUpdate?: (datos: { 
    courseId: number;
    titulo: string;
    image: number | null;
  }) => void;
}

export function EditarCursoModal({ 
  open, 
  onOpenChange, 
  courseId,
  initialTitle, 
  initialImage,
  onUpdate 
}: EditarCursoModalProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(initialImage);
  
  const form = useForm<EditarCursoFormData>({
    resolver: zodResolver(editarCursoSchema),
    defaultValues: {
      titulo: initialTitle,
      image: initialImage,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        titulo: initialTitle,
        image: initialImage,
      });
      setSelectedImage(initialImage);
    }
  }, [open, initialTitle, initialImage, form]);

  const handleImageSelect = (imageId: number) => {
    if (selectedImage === imageId) {
      // Deseleccionar si se hace click en el icono actual
      setSelectedImage(null);
      form.setValue('image', null);
    } else {
      setSelectedImage(imageId);
      form.setValue('image', imageId);
    }
  };

  const handleSubmit = (data: EditarCursoFormData) => {
    onUpdate?.({
      courseId,
      titulo: data.titulo,
      image: selectedImage,
    });
    
    form.reset();
    onOpenChange(false);
  };

  const handleCancel = () => {
    form.reset({
      titulo: initialTitle,
      image: initialImage,
    });
    setSelectedImage(initialImage);
    onOpenChange(false);
  };

  // Get all icon IDs from iconMapping (1-32)
  const iconIds = Object.keys(iconMapping).map(Number).sort((a, b) => a - b);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
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
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00A3E2 0%, #006b9a 100%)' }}
            >
              <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl" style={{ color: '#ffffff' }}>
              Editar Curso
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm" style={{ color: '#cccccc' }}>
            Actualiza el título y selecciona un icono para tu curso.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
            {/* Campo Título */}
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm" style={{ color: '#ffffff' }}>
                    Título del Curso
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Ej: React Avanzado, Python para Data Science, etc."
                      className="h-10 sm:h-11 text-sm sm:text-base"
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.1)', 
                        borderColor: '#00A3E2',
                        color: '#ffffff'
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selector de Iconos */}
            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm" style={{ color: '#ffffff' }}>
                    Icono del Curso (Opcional)
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      {/* Icono actual seleccionado */}
                      {selectedImage && (
                        <div className="flex items-center gap-2 p-3 rounded-lg" style={{ 
                          background: 'rgba(0, 163, 226, 0.2)',
                          border: '1px solid #00A3E2'
                        }}>
                          <span className="text-xs sm:text-sm" style={{ color: '#ffffff' }}>
                            Icono seleccionado:
                          </span>
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #00A3E2 0%, #006b9a 100%)' }}
                          >
                            {(() => {
                              const Icon = iconMapping[selectedImage];
                              return Icon ? <Icon className="w-5 h-5 text-white" /> : null;
                            })()}
                          </div>
                        </div>
                      )}
                      
                      {/* Grid de iconos */}
                      <div 
                        className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 p-3 rounded-lg"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(0, 163, 226, 0.3)'
                        }}
                      >
                        {iconIds.map((iconId) => {
                          const Icon = iconMapping[iconId];
                          const isSelected = selectedImage === iconId;
                          
                          return (
                            <button
                              key={iconId}
                              type="button"
                              onClick={() => handleImageSelect(iconId)}
                              className={`
                                w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center
                                transition-all hover:scale-110
                                ${isSelected ? 'ring-2 ring-[#00A3E2] ring-offset-2 ring-offset-[#262422]' : ''}
                              `}
                              style={{
                                background: isSelected 
                                  ? 'linear-gradient(135deg, #00A3E2 0%, #006b9a 100%)'
                                  : 'rgba(255, 255, 255, 0.1)',
                                border: isSelected ? '2px solid #00A3E2' : '1px solid rgba(0, 163, 226, 0.3)'
                              }}
                            >
                              {Icon && <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />}
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Opción sin icono */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          form.setValue('image', null);
                        }}
                        className={`
                          w-full flex items-center gap-3 p-3 rounded-lg transition-all
                          ${selectedImage === null ? 'ring-2 ring-[#00A3E2] ring-offset-2 ring-offset-[#262422]' : ''}
                        `}
                        style={{
                          background: selectedImage === null
                            ? 'rgba(0, 163, 226, 0.2)'
                            : 'rgba(255, 255, 255, 0.05)',
                          border: selectedImage === null 
                            ? '2px solid #00A3E2' 
                            : '1px solid rgba(0, 163, 226, 0.3)'
                        }}
                      >
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                        >
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs sm:text-sm" style={{ color: '#ffffff' }}>
                          Sin icono (usar predeterminado)
                        </span>
                      </button>
                    </div>
                  </FormControl>
                  <p className="text-xs" style={{ color: '#999999' }}>
                    Haz click en un icono para seleccionarlo. Haz click nuevamente para deseleccionarlo.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 flex-col sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="w-full sm:w-auto text-sm sm:text-base"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  borderColor: '#00A3E2',
                  color: '#ffffff'
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!form.watch('titulo')}
                className="w-full sm:w-auto text-sm sm:text-base"
                style={{ 
                  background: form.watch('titulo') ? '#00A3E2' : 'rgba(0, 163, 226, 0.5)', 
                  color: '#ffffff',
                  cursor: !form.watch('titulo') ? 'not-allowed' : 'pointer'
                }}
              >
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
