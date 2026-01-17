"use client";
import { useRouter } from 'next/navigation';
import { BookOpen, Search, Settings, LogOut, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLogout } from '@/hooks/useAccount';

interface HeaderProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSettingsClick?: () => void;
}

export function Header({ searchValue, onSearchChange, onSettingsClick }: HeaderProps) {
  const router = useRouter();
  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout();
    setTimeout(() => {
      router.push('/');
    }, 1000);
  };

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick();
    }
  };

  return (
    <header 
      className="w-full px-8 py-4 flex items-center justify-between" 
      style={{ 
        background: 'rgba(0, 0, 0, 0.3)', 
        backdropFilter: 'blur(10px)', 
        borderBottom: '1px solid rgba(0, 163, 226, 0.2)' 
      }}
    >
      {/* Logo - Izquierda */}
      <div className="flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center" 
          style={{ background: 'linear-gradient(135deg, #00A3E2 0%, #006b9a 100%)' }}
        >
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl" style={{ color: '#ffffff' }}>Atlas</span>
      </div>

      {/* Barra de búsqueda - Centro */}
      <div className="flex-1 max-w-2xl mx-8">
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
            style={{ color: '#999999' }} 
          />
          <Input
            type="text"
            placeholder="Buscar temas, cursos o planes de estudio..."
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
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
            <User className="w-10 h-10 text-white" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-48" 
          style={{ background: '#262422', borderColor: '#00A3E2' }}
        >
          <DropdownMenuLabel 
            className="text-sm font-semibold text-center" 
            style={{ color: '#ffffff' }}
          >
            Usuario
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer" 
            style={{ color: '#ffffff' }}
            onClick={handleSettingsClick}
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
  );
}
