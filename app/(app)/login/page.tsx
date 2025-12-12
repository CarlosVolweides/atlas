'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { BookOpen, AlertCircle, Mail } from 'lucide-react';
import { useSignIn } from '@/hooks/useAccount';
import { useSignUp } from '@/hooks/useAccount';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => boolean;
}

const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Correo electrónico inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida'),
});

const signUpSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Correo electrónico inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(9, 'La contraseña debe tener más de 8 caracteres')
    .refine((value) => {
      const uppercaseCount = (value.match(/[A-Z]/g) || []).length;
      return uppercaseCount > 0;
    }, 'La contraseña debe tener más de 1 mayúscula')
    .refine((value) => {
      const lowercaseCount = (value.match(/[a-z]/g) || []).length;
      return lowercaseCount > 0;
    }, 'La contraseña debe tener más de 1 minúscula')
    .refine((value) => {
      const numberCount = (value.match(/[0-9]/g) || []).length;
      return numberCount > 0;
    }, 'La contraseña debe tener más de 1 número')
    .refine((value) => {
      const symbolCount = (value.match(/[^A-Za-z0-9]/g) || []).length;
      return symbolCount > 0;
    }, 'La contraseña debe tener más de 1 símbolo'),
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const router = useRouter();
  const { mutate: signIn } = useSignIn();
  const { mutate: signUp } = useSignUp();

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = async (data: SignInFormData) => {
    signIn(
      { email: data.email, password: data.password },
      {
        onSuccess: (response) => {
          console.log('Login exitoso:', response);
          router.push('/');
        }
      }
    );
  };

  const handleRegister = async (data: SignUpFormData) => {
    signUp({ email: data.email, password: data.password });
    resetForms();
    setActiveTab('signin');
  };

  const resetForms = () => {
    signInForm.reset();
    signUpForm.reset();
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
          <div className="flex items-center gap-2 mb-6 sm:mb-8 md:mb-8"> {/*Cambiar margin bottom a menor*/}
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
                resetForms();
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
                resetForms();
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
            <Form {...signInForm}>
              <form onSubmit={signInForm.handleSubmit(handleLogin)} className="space-y-4 sm:space-y-5 flex-1">
                <FormField
                  control={signInForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm" style={{ color: '#ffffff' }}>
                        Correo Electrónico
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#cccccc' }} />
                          <Input
                            {...field}
                            type="email"
                            placeholder="Ingresa tu correo"
                            disabled={signInForm.formState.isSubmitting}
                            className="pl-10 h-11 sm:h-12 text-sm sm:text-base"
                            style={{ 
                              background: 'rgba(255, 255, 255, 0.1)', 
                              borderColor: '#00A3E2',
                              color: '#ffffff'
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signInForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm" style={{ color: '#ffffff' }}>
                        Contraseña
                      </FormLabel>
                      <FormMessage />
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Ingresa tu contraseña"
                          disabled={signInForm.formState.isSubmitting}
                          className="h-11 sm:h-12 text-sm sm:text-base"
                          style={{ 
                            background: 'rgba(255, 255, 255, 0.1)', 
                            borderColor: '#00A3E2',
                            color: '#ffffff'
                          }}
                        />
                      </FormControl>
                      
                    </FormItem>
                  )}
                />

                {signInForm.formState.errors.root && (
                  <Alert variant="destructive" className="py-2 sm:py-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs sm:text-sm">
                      {signInForm.formState.errors.root.message}
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-11 sm:h-12 text-sm rounded-lg" 
                  disabled={signInForm.formState.isSubmitting}
                  style={{ background: '#00A3E2', color: '#ffffff' }}
                >
                  {signInForm.formState.isSubmitting ? 'Iniciando sesión...' : 'Continuar'}
                </Button>
              </form>
            </Form>
          )}

          {/* Sign Up Form */}
          {activeTab === 'signup' && (
            <Form {...signUpForm}>
              <form onSubmit={signUpForm.handleSubmit(handleRegister)} className="space-y-4 sm:space-y-5 flex-1">
                <FormField
                  control={signUpForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm" style={{ color: '#ffffff' }}>
                        Correo Electrónico
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#cccccc' }} />
                          <Input
                            {...field}
                            type="email"
                            placeholder="Ingresa tu correo"
                            disabled={signUpForm.formState.isSubmitting}
                            className="pl-10 h-11 sm:h-12 text-sm sm:text-base"
                            style={{ 
                              background: 'rgba(255, 255, 255, 0.1)', 
                              borderColor: '#00A3E2',
                              color: '#ffffff'
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signUpForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm" style={{ color: '#ffffff' }}>
                        Contraseña
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Crea una contraseña"
                          disabled={signUpForm.formState.isSubmitting}
                          className="h-11 sm:h-12 text-sm sm:text-base"
                          style={{ 
                            background: 'rgba(255, 255, 255, 0.1)', 
                            borderColor: '#00A3E2',
                            color: '#ffffff'
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {success && (
                  <Alert className="py-2 sm:py-3" style={{ background: '#e8f5e9', borderColor: '#4caf50', color: '#2e7d32' }}>
                    <AlertDescription className="text-xs sm:text-sm">{success}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-11 sm:h-12 text-sm rounded-lg" 
                  disabled={signUpForm.formState.isSubmitting}
                  style={{ background: '#00A3E2', color: '#ffffff' }}
                >
                  {signUpForm.formState.isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
                </Button>
              </form>
            </Form>
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