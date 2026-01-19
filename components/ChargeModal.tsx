"use client";
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface ChargeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChargeModal({ open, onOpenChange }: ChargeModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="!max-w-[320px] w-[calc(100%-2rem)] !p-8"
        style={{ 
          background: 'rgba(38, 36, 34, 0.95)', 
          backdropFilter: 'blur(20px)',
          borderColor: '#00A3E2',
          borderWidth: '1px'
        }}
      >
        <DialogTitle className="text-lg sm:text-xl text-center mb-8" style={{ color: '#ffffff' }}>  
          Creando curso...
        </DialogTitle>
        <div className="flex flex-col items-center justify-center py-2">
          <SkeletonTheme 
            baseColor="rgba(0, 163, 226, 0.2)" 
            highlightColor="rgba(0, 163, 226, 0.6)"
          >
            <div className="relative w-16 h-16">
              <Skeleton 
                circle 
                width={64} 
                height={64}
                className="absolute"
              />
              <div 
                className="absolute inset-0 rounded-full border-4 animate-spin"
                style={{
                  borderTopColor: '#00A3E2',
                  borderRightColor: 'rgba(0, 163, 226, 0.3)',
                  borderBottomColor: 'transparent',
                  borderLeftColor: 'transparent',
                }}
              />
            </div>
          </SkeletonTheme>
        </div>
      </DialogContent>
    </Dialog>
  );
}

