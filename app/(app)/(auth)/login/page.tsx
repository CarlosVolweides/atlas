'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, AlertCircle, Mail } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => boolean;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const loginSuccess = onLogin(username, password);
      if (!loginSuccess) {
        setError('Correo o contraseña incorrectos');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    setTimeout(() => {
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        setIsLoading(false);
        return;
      }

      setSuccess('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
      setUsername('');
      setPassword('');
      setIsLoading(false);
      
      setTimeout(() => {
        setActiveTab('signin');
        setSuccess('');
      }, 2000);
    }, 500);
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen max-h-screen flex items-center justify-center overflow-hidden p-4" style={{ background: '#0a1929' }}>
      <div className="w-full max-w-6xl h-auto md:h-[600px] flex flex-col md:flex-row shadow-2xl rounded-3xl overflow-hidden">
        {/* Left Panel - Image */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center relative overflow-hidden" style={{ background: '#000000' }}>
          <div className="absolute inset-0 opacity-30" style={{ 
            background: 'radial-gradient(circle at 30% 50%, rgba(0, 163, 226, 0.3) 0%, transparent 70%)',
          }}></div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col" style={{ background: 'linear-gradient(135deg, rgba(0, 10, 20, 0.9) 0%, rgba(0, 30, 50, 0.85) 50%, rgba(0, 60, 90, 0.8) 100%)', backdropFilter: 'blur(20px)', borderLeft: '1px solid rgba(0, 163, 226, 0.2)' }}>
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6 sm:mb-8 md:mb-12">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00A3E2 0%, #006b9a 100%)' }}>
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl" style={{ color: '#ffffff' }}>Atlas</span>
          </div>

          {/* Welcome Message */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl mb-2" style={{ color: '#ffffff' }}>Bienvenido</h1>
            <p className="text-xs sm:text-sm" style={{ color: '#cccccc' }}>Por favor ingresa tus datos</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 sm:gap-4 mb-6 sm:mb-8">
            <button
              onClick={() => {
                setActiveTab('signin');
                resetForm();
              }}
              className="flex-1 py-2 px-3 sm:px-4 rounded-lg transition-all text-sm sm:text-base"
              style={{
                background: activeTab === 'signin' ? '#00A3E2' : 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff'
              }}
            >Iniciar
               Sesión
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                resetForm();
              }}
              className="flex-1 py-2 px-3 sm:px-4 rounded-lg transition-all text-sm sm:text-base"
              style={{
                background: activeTab === 'signup' ? '#00A3E2' : 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff'
              }}
            >
              Registrarse
            </button>
          </div>

          {/* Sign In Form */}
          {activeTab === 'signin' && (
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5 flex-1">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs sm:text-sm" style={{ color: '#ffffff' }}>Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#cccccc' }} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ingresa tu correo"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 h-11 sm:h-12 text-sm sm:text-base"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.1)', 
                      borderColor: '#00A3E2',
                      color: '#ffffff'
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs sm:text-sm" style={{ color: '#ffffff' }}>Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 sm:h-12 text-sm sm:text-base"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.1)', 
                    borderColor: '#00A3E2',
                    color: '#ffffff'
                  }}
                />
              </div>

              {error && (
                <Alert variant="destructive" className="py-2 sm:py-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 sm:h-12 text-sm rounded-lg" 
                disabled={isLoading}
                style={{ background: '#00A3E2', color: '#ffffff' }}
              >
                {isLoading ? 'Iniciando sesión...' : 'Continuar'}
              </Button>
            </form>
          )}

          {/* Sign Up Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5 flex-1">
              <div className="space-y-2">
                <Label htmlFor="email-register" className="text-xs sm:text-sm" style={{ color: '#ffffff' }}>Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#cccccc' }} />
                  <Input
                    id="email-register"
                    type="email"
                    placeholder="Ingresa tu correo"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 h-11 sm:h-12 text-sm sm:text-base"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.1)', 
                      borderColor: '#00A3E2',
                      color: '#ffffff'
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-register" className="text-xs sm:text-sm" style={{ color: '#ffffff' }}>Contraseña</Label>
                <Input
                  id="password-register"
                  type="password"
                  placeholder="Crea una contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 sm:h-12 text-sm sm:text-base"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.1)', 
                    borderColor: '#00A3E2',
                    color: '#ffffff'
                  }}
                />
              </div>

              {error && (
                <Alert variant="destructive" className="py-2 sm:py-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="py-2 sm:py-3" style={{ background: '#e8f5e9', borderColor: '#4caf50', color: '#2e7d32' }}>
                  <AlertDescription className="text-xs sm:text-sm">{success}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 sm:h-12 text-sm rounded-lg" 
                disabled={isLoading}
                style={{ background: '#00A3E2', color: '#ffffff' }}
              >
                {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>
            </form>
          )}

          {/* Footer Text */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-xs" style={{ color: '#cccccc' }}>
              Únete a Atlas para crear tu plan de estudio personalizado y acceder a tu panel de aprendizaje.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}