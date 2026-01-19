"use client";
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { BookOpen, Plus, X } from 'lucide-react';

const crearCursoSchema = z.object({
  tecnologiaPrincipal: z.string().min(1, 'La tecnología principal es requerida'),
  dificultad: z.enum(['basico', 'intermedio', 'avanzado'], {
    message: 'El nivel de dificultad es requerido',
  }),
  razonCurso: z.string().min(1, 'Debes explicar para qué deseas hacer este curso'),
  indispensables: z.array(z.string()).optional(),
  conocimientosPrevios: z.array(z.string()).optional(),
  tecnologiasFueraAlcance: z.array(z.string()).optional(),
});

type CrearCursoFormData = z.infer<typeof crearCursoSchema>;

interface CrearCursoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCrearCurso?: (datos: {
    tecnologiaPrincipal: string;
    dificultad: string;
    razonCurso: string;
    indispensables?: string[];
    conocimientosPrevios?: string[];
    tecnologiasFueraAlcance?: string[];
  }) => void;
}

export function CrearCursoModal({ open, onOpenChange, onCrearCurso }: CrearCursoModalProps) {
  const [configuracionAvanzada, setConfiguracionAvanzada] = useState(false);

  const form = useForm<CrearCursoFormData>({
    resolver: zodResolver(crearCursoSchema),
    defaultValues: {
      tecnologiaPrincipal: '',
      dificultad: undefined as any,
      razonCurso: '',
      indispensables: [],
      conocimientosPrevios: [],
      tecnologiasFueraAlcance: [],
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
      setConfiguracionAvanzada(false);
    }
  }, [open, form]);

  const handleConfiguracionAvanzadaChange = (checked: boolean) => {
    setConfiguracionAvanzada(checked);
    if (!checked) {
      form.setValue('indispensables', []);
      form.setValue('conocimientosPrevios', []);
      form.setValue('tecnologiasFueraAlcance', []);
    }
  };

  const handleSubmit = (data: CrearCursoFormData) => {
    onCrearCurso?.({
      tecnologiaPrincipal: data.tecnologiaPrincipal,
      dificultad: data.dificultad,
      razonCurso: data.razonCurso,
      indispensables: data.indispensables && data.indispensables.length > 0 ? data.indispensables : undefined,
      conocimientosPrevios: data.conocimientosPrevios && data.conocimientosPrevios.length > 0 ? data.conocimientosPrevios : undefined,
      tecnologiasFueraAlcance: data.tecnologiasFueraAlcance && data.tecnologiasFueraAlcance.length > 0 ? data.tecnologiasFueraAlcance : undefined,
    });

    form.reset();
    onOpenChange(false);
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto"
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
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl" style={{ color: '#ffffff' }}>
              Crear Nuevo Curso
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm" style={{ color: '#cccccc' }}>
            Define la tecnología principal y opciones adicionales para que Atlas planifique tu curso personalizado.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 sm:space-y-4 py-2">
            {/* Campo Tecnología Principal */}
            <FormField
              control={form.control}
              name="tecnologiaPrincipal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm" style={{ color: '#ffffff' }}>
                    Tecnología Principal a Aprender
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Ej: React, Python, Next.js, Laravel, etc."
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

            {/* Campo Dificultad */}
            <FormField
              control={form.control}
              name="dificultad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm" style={{ color: '#ffffff' }}>
                    Nivel de Dificultad
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger
                        className="h-10 sm:h-11 text-sm sm:text-base"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderColor: '#00A3E2',
                          color: field.value ? '#ffffff' : '#999999'
                        }}
                      >
                        <SelectValue placeholder="Selecciona el nivel de dificultad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent
                      style={{
                        background: '#262422',
                        borderColor: '#00A3E2'
                      }}
                    >
                      <SelectItem
                        value="basico"
                        style={{ color: '#ffffff' }}
                      >
                        Básico
                      </SelectItem>
                      <SelectItem
                        value="intermedio"
                        style={{ color: '#ffffff' }}
                      >
                        Intermedio
                      </SelectItem>
                      <SelectItem
                        value="avanzado"
                        style={{ color: '#ffffff' }}
                      >
                        Avanzado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Razón del Curso */}
            <FormField
              control={form.control}
              name="razonCurso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm" style={{ color: '#ffffff' }}>
                    ¿Para qué deseas hacer este curso?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Quiero aprender React para desarrollar una aplicaciones web para la universidad y mejorar mis habilidades en el fronted"
                      rows={4}
                      className="text-sm sm:text-base"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderColor: '#00A3E2',
                        color: '#ffffff',
                        resize: 'none'
                      }}
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs" style={{ color: '#999999' }}>
                    Explica las razones y objetivos por los que deseas realizar este curso
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Checkbox Configuración Avanzada */}
            <div className="flex items-center space-x-2 py-2">
              <Checkbox
                id="configuracionAvanzada"
                checked={configuracionAvanzada}
                onCheckedChange={handleConfiguracionAvanzadaChange}
                style={{
                  borderColor: '#00A3E2',
                }}
              />
              <Label
                htmlFor="configuracionAvanzada"
                className="text-xs sm:text-sm cursor-pointer"
                style={{ color: '#ffffff' }}
              >
                Configuración avanzada
              </Label>
            </div>

            {/* Campos de Configuración Avanzada */}
            {configuracionAvanzada && (
              <>
                {/* Campo Herramientas Indispensables */}
                <FormField
                  control={form.control}
                  name="indispensables"
                  render={({ field }) => {
                    const [inputValue, setInputValue] = useState('');
                    const values = field.value || [];

                    const handleAdd = () => {
                      if (inputValue.trim()) {
                        field.onChange([...values, inputValue.trim()]);
                        setInputValue('');
                      }
                    };

                    const handleRemove = (index: number) => {
                      field.onChange(values.filter((_, i) => i !== index));
                    };

                    return (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm" style={{ color: '#ffffff' }}>
                          Indispensables para este Curso (Opcional)
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                type="text"
                                placeholder="Ej: Manejo de estados, API REST, CRUD, etc."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAdd();
                                  }
                                }}
                                className="text-sm sm:text-base"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  borderColor: '#00A3E2',
                                  color: '#ffffff'
                                }}
                              />
                              <Button
                                type="button"
                                onClick={handleAdd}
                                disabled={!inputValue.trim()}
                                className="px-3"
                                style={{
                                  background: inputValue.trim() ? '#00A3E2' : 'rgba(0, 163, 226, 0.5)',
                                  color: '#ffffff',
                                  border: 'none'
                                }}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            {values.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {values.map((value, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-1 px-2 py-1 rounded"
                                    style={{
                                      background: 'rgba(0, 163, 226, 0.2)',
                                      border: '1px solid #00A3E2'
                                    }}
                                  >
                                    <span className="text-xs sm:text-sm" style={{ color: '#ffffff' }}>
                                      {value}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemove(index)}
                                      className="ml-1 hover:opacity-70"
                                      style={{ color: '#ffffff' }}
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <p className="text-xs" style={{ color: '#999999' }}>
                          Lista las herramientas, frameworks o librerías que deben incluirse en el curso
                        </p>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Campo Conocimientos Previos */}
                <FormField
                  control={form.control}
                  name="conocimientosPrevios"
                  render={({ field }) => {
                    const [inputValue, setInputValue] = useState('');
                    const values = field.value || [];

                    const handleAdd = () => {
                      if (inputValue.trim()) {
                        field.onChange([...values, inputValue.trim()]);
                        setInputValue('');
                      }
                    };

                    const handleRemove = (index: number) => {
                      field.onChange(values.filter((_, i) => i !== index));
                    };

                    return (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm" style={{ color: '#ffffff' }}>
                          Conocimientos Previos del Usuario (Opcional)
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                type="text"
                                placeholder="Ej: HTML básico, CSS intermedio, JavaScript básico, etc."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAdd();
                                  }
                                }}
                                className="text-sm sm:text-base"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  borderColor: '#00A3E2',
                                  color: '#ffffff'
                                }}
                              />
                              <Button
                                type="button"
                                onClick={handleAdd}
                                disabled={!inputValue.trim()}
                                className="px-3"
                                style={{
                                  background: inputValue.trim() ? '#00A3E2' : 'rgba(0, 163, 226, 0.5)',
                                  color: '#ffffff',
                                  border: 'none'
                                }}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            {values.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {values.map((value, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-1 px-2 py-1 rounded"
                                    style={{
                                      background: 'rgba(0, 163, 226, 0.2)',
                                      border: '1px solid #00A3E2'
                                    }}
                                  >
                                    <span className="text-xs sm:text-sm" style={{ color: '#ffffff' }}>
                                      {value}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemove(index)}
                                      className="ml-1 hover:opacity-70"
                                      style={{ color: '#ffffff' }}
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <p className="text-xs" style={{ color: '#999999' }}>
                          Describe tu nivel de experiencia y qué conocimientos ya tienes sobre este tema
                        </p>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Campo Tecnologías Fuera del Alcance */}
                <FormField
                  control={form.control}
                  name="tecnologiasFueraAlcance"
                  render={({ field }) => {
                    const [inputValue, setInputValue] = useState('');
                    const values = field.value || [];

                    const handleAdd = () => {
                      if (inputValue.trim()) {
                        field.onChange([...values, inputValue.trim()]);
                        setInputValue('');
                      }
                    };

                    const handleRemove = (index: number) => {
                      field.onChange(values.filter((_, i) => i !== index));
                    };

                    return (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm" style={{ color: '#ffffff' }}>
                          Tecnologías Fuera del Alcance para este Curso (Opcional)
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                type="text"
                                placeholder="Ej: Pruebas unitarias, typescript, etc."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAdd();
                                  }
                                }}
                                className="text-sm sm:text-base"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  borderColor: '#00A3E2',
                                  color: '#ffffff'
                                }}
                              />
                              <Button
                                type="button"
                                onClick={handleAdd}
                                disabled={!inputValue.trim()}
                                className="px-3"
                                style={{
                                  background: inputValue.trim() ? '#00A3E2' : 'rgba(0, 163, 226, 0.5)',
                                  color: '#ffffff',
                                  border: 'none'
                                }}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            {values.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {values.map((value, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-1 px-2 py-1 rounded"
                                    style={{
                                      background: 'rgba(0, 163, 226, 0.2)',
                                      border: '1px solid #00A3E2'
                                    }}
                                  >
                                    <span className="text-xs sm:text-sm" style={{ color: '#ffffff' }}>
                                      {value}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemove(index)}
                                      className="ml-1 hover:opacity-70"
                                      style={{ color: '#ffffff' }}
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <p className="text-xs" style={{ color: '#999999' }}>
                          Especifica tecnologías, herramientas o conceptos que NO deben incluirse en el curso
                        </p>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </>
            )}

            <DialogFooter className="gap-2 flex-col sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="w-full sm:w-auto text-sm sm:text-base hover:!bg-cyan-800"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderColor: '#00A3E2',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!form.watch('tecnologiaPrincipal') || !form.watch('dificultad') || !form.watch('razonCurso')}
                className="w-full sm:w-auto text-sm sm:text-base hover:shadow-[0_0_20px_rgba(0,162,226,0.53)] bg-gradient-to-r from-cyan-500 to-blue-700 hover:from-cyan-900 hover:to-blue-700 border-[#00A3E2] transition-all duration-300"
                style={{
                  background: form.watch('tecnologiaPrincipal') && form.watch('dificultad') && form.watch('razonCurso') ? '#00A3E2' : 'rgba(0, 163, 226, 0.5)',
                  color: '#ffffff',
                  cursor: !form.watch('tecnologiaPrincipal') || !form.watch('dificultad') || !form.watch('razonCurso') ? 'not-allowed' : 'pointer'
                }}
              >
                Crear Curso
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}