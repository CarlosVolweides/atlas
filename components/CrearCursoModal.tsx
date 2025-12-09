"use client";
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BookOpen } from 'lucide-react';

interface CrearCursoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCrearCurso?: (datos: { tema: string; dificultad: string; conocimientosPrevios: string }) => void;
}

export function CrearCursoModal({ open, onOpenChange, onCrearCurso }: CrearCursoModalProps) {
  const [tema, setTema] = useState('');
  const [dificultad, setDificultad] = useState('');
  const [conocimientosPrevios, setConocimientosPrevios] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (tema && dificultad) {
      onCrearCurso?.({ tema, dificultad, conocimientosPrevios });
      
      // Resetear formulario
      setTema('');
      setDificultad('');
      setConocimientosPrevios('');
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setTema('');
    setDificultad('');
    setConocimientosPrevios('');
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
              Crear Nueva Lección
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm" style={{ color: '#cccccc' }}>
            Define el tema, dificultad y conocimientos previos para que el sistema planifique tu curso personalizado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 py-2">
          {/* Campo Tema */}
          <div className="space-y-2">
            <Label htmlFor="tema" className="text-xs sm:text-sm" style={{ color: '#ffffff' }}>
              Tema *
            </Label>
            <Input
              id="tema"
              type="text"
              placeholder="Ej: Fundamentos de React"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              required
              className="h-10 sm:h-11 text-sm sm:text-base"
              style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderColor: '#00A3E2',
                color: '#ffffff'
              }}
            />
          </div>

          {/* Campo Dificultad */}
          <div className="space-y-2">
            <Label htmlFor="dificultad" className="text-xs sm:text-sm" style={{ color: '#ffffff' }}>
              Dificultad *
            </Label>
            <Select value={dificultad} onValueChange={setDificultad} required>
              <SelectTrigger 
                className="h-10 sm:h-11 text-sm sm:text-base"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  borderColor: '#00A3E2',
                  color: dificultad ? '#ffffff' : '#999999'
                }}
              >
                <SelectValue placeholder="Selecciona el nivel de dificultad" />
              </SelectTrigger>
              <SelectContent 
                style={{ 
                  background: '#262422', 
                  borderColor: '#00A3E2'
                }}
              >
                <SelectItem 
                  value="principiante"
                  style={{ color: '#ffffff' }}
                >
                  Principiante
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
          </div>

          {/* Campo Conocimientos Previos */}
          <div className="space-y-2">
            <Label htmlFor="conocimientos" className="text-xs sm:text-sm" style={{ color: '#ffffff' }}>
              Conocimientos Previos (Opcional)
            </Label>
            <Textarea
              id="conocimientos"
              placeholder="Ej: Tengo experiencia básica con HTML y CSS, pero no he trabajado con JavaScript antes"
              value={conocimientosPrevios}
              onChange={(e) => setConocimientosPrevios(e.target.value)}
              rows={3}
              className="text-sm sm:text-base"
              style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderColor: '#00A3E2',
                color: '#ffffff',
                resize: 'none'
              }}
            />
            <p className="text-xs" style={{ color: '#999999' }}>
              Describe tu nivel de experiencia y qué conocimientos ya tienes sobre este tema
            </p>
          </div>

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
              disabled={!tema || !dificultad}
              className="w-full sm:w-auto text-sm sm:text-base"
              style={{ 
                background: tema && dificultad ? '#00A3E2' : 'rgba(0, 163, 226, 0.5)', 
                color: '#ffffff',
                cursor: !tema || !dificultad ? 'not-allowed' : 'pointer'
              }}
            >
              Crear Lección
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}