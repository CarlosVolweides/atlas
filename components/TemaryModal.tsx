import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { SubtopicTemaryI, TemaryInterface } from '@/types/course';
import { useTemary } from '@/hooks/useCourse';
import { ModuleTemaryI } from '@/types/course';

interface TemaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  temaryid: number | null;
  onConfirm?: () => void;
}

export function TemaryModal({ open, onOpenChange, temaryid, onConfirm }: TemaryModalProps) {
  const { data: temaryData } = useTemary(temaryid || 0, { enabled: !!temaryid });
  const totalSubtopics = temaryData ?.modules?.reduce((acc: number, module: ModuleTemaryI) => acc + (module.subtopics?.length || 0), 0) || 0;
  const hasData = temaryData && temaryData.modules && Array.isArray(temaryData.modules) && temaryData.modules.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="!max-w-[800px] w-[calc(100%-2rem)] max-h-[90vh] overflow-hidden flex flex-col"
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
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl sm:text-2xl" style={{ color: '#ffffff' }}>
                Temario del Curso
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm mt-1" style={{ color: '#cccccc' }}>
                {hasData ? `${temaryData.modules.length} módulos • ${totalSubtopics} subtemas` : 'Cargando temario...'}
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
          <div className="space-y-4">
            {hasData ? temaryData.modules.map((module: ModuleTemaryI) => (
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
                    <p className="text-xs mt-1" style={{ color: '#999999' }}>
                      {module.subtopics.length} subtemas
                    </p>
                  </div>
                </div>

                {/* Subtemas */}
                <div className="space-y-2 ml-11">
                  {module.subtopics?.map((subtopic: SubtopicTemaryI) => (
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
                      <span className="text-sm" style={{ color: '#cccccc' }}>
                        {subtopic.order}. {subtopic.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )) : (
              <div className="text-center py-8" style={{ color: '#cccccc' }}>
                <p>No hay datos del temario disponibles</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer con botón */}
        <div className="pt-4 border-t" style={{ borderColor: 'rgba(0, 163, 226, 0.3)' }}>
          <Button
            onClick={() => {
              onOpenChange(false);
              if (onConfirm) onConfirm();
            }}
            className="w-full"
            style={{ 
              background: '#00A3E2',
              color: '#ffffff'
            }}
          >
            Comenzar Curso
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}