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
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';

const displayFont = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });
const monoFont = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'] });

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

export default function LoginScreen() {
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
    <div
      className="relative min-h-screen overflow-hidden bg-[#04070f] px-4 py-8 sm:px-6 md:flex md:items-center md:justify-center"
      style={{
        backgroundImage:
          'radial-gradient(circle at 15% 20%, rgba(0, 184, 255, 0.18) 0%, transparent 35%), radial-gradient(circle at 85% 80%, rgba(0, 255, 198, 0.12) 0%, transparent 42%), linear-gradient(160deg, #03050d 0%, #050b1b 45%, #02040c 100%)'
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(100,120,170,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(100,120,170,0.12) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
          maskImage: 'radial-gradient(circle at center, black 35%, transparent 90%)'
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-cyan-300/30 bg-[#070d1d]/70 shadow-[0_0_60px_rgba(0,180,255,0.2)] backdrop-blur-xl md:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden border-r border-cyan-300/20 p-10 md:flex md:flex-col md:justify-between">
          <div>
            <div className={`inline-flex items-center gap-2 rounded-full border border-cyan-300/35 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-cyan-200/90 ${monoFont.className}`}>
              Atlas Protocol
            </div>
            <h2 className={`mt-6 max-w-xs text-4xl font-semibold leading-tight text-cyan-50 ${displayFont.className}`}>
              Accede a tu laboratorio de aprendizaje.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
              Disena rutas tecnicas personalizadas con IA, seguimiento por modulos y avance en tiempo real.
            </p>
          </div>

          <div className={`space-y-2 text-xs text-cyan-100/80 ${monoFont.className}`}>
            <p>&gt; adaptive-learning: online</p>
            <p>&gt; ai-tutor: synced</p>
            <p>&gt; progress-engine: stable</p>
          </div>

          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
        </div>

        <div className="relative p-6 sm:p-8 md:p-10">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200/60 bg-cyan-400/20">
              <BookOpen className="h-5 w-5 text-cyan-100" />
            </div>
            <div>
              <p className={`text-[11px] uppercase tracking-[0.25em] text-cyan-200/80 ${monoFont.className}`}>Nodo seguro</p>
              <p className={`text-xl font-semibold text-cyan-50 ${displayFont.className}`}>Atlas</p>
            </div>
          </div>

          <div className="mb-6">
            <h1 className={`text-3xl font-semibold tracking-tight text-white sm:text-4xl ${displayFont.className}`}>
              {activeTab === 'signin' ? 'Bienvenido de vuelta' : 'Crear acceso'}
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              {activeTab === 'signin'
                ? 'Ingresa tus credenciales para continuar con tu progreso.'
                : 'Registra tu cuenta para iniciar tu ruta personalizada.'}
            </p>
          </div>

          <div className="mb-7 grid grid-cols-2 rounded-xl border border-cyan-300/25 bg-cyan-950/40 p-1">
            <button
              onClick={() => {
                setActiveTab('signin');
                resetForms();
              }}
              className={`rounded-lg px-3 py-2 text-sm transition-all ${displayFont.className}`}
              style={{
                background:
                  activeTab === 'signin'
                    ? 'linear-gradient(120deg, rgba(94,234,212,0.95) 0%, rgba(6,182,212,0.9) 100%)'
                    : 'transparent',
                color: activeTab === 'signin' ? '#03121A' : '#cbd5e1',
                boxShadow: activeTab === 'signin' ? '0 0 20px rgba(34, 211, 238, 0.35)' : 'none'
              }}
            >
              Iniciar sesion
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                resetForms();
              }}
              className={`rounded-lg px-3 py-2 text-sm transition-all ${displayFont.className}`}
              style={{
                background:
                  activeTab === 'signup'
                    ? 'linear-gradient(120deg, rgba(94,234,212,0.95) 0%, rgba(6,182,212,0.9) 100%)'
                    : 'transparent',
                color: activeTab === 'signup' ? '#03121A' : '#cbd5e1',
                boxShadow: activeTab === 'signup' ? '0 0 20px rgba(34, 211, 238, 0.35)' : 'none'
              }}
            >
              Registrarse
            </button>
          </div>

          {/* Sign In Form */}
          {activeTab === 'signin' && (
            <Form {...signInForm}>
              <form onSubmit={signInForm.handleSubmit(handleLogin)} className="space-y-5">
                <FormField
                  control={signInForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`text-xs uppercase tracking-[0.18em] text-slate-300 ${monoFont.className}`}>
                        Correo Electrónico
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-200/90" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="Ingresa tu correo"
                            disabled={signInForm.formState.isSubmitting}
                            className={`h-11 border-cyan-300/30 bg-cyan-950/45 pl-10 text-sm text-cyan-50 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-300/70 ${displayFont.className}`}
                            style={{ 
                              boxShadow: 'inset 0 0 0 1px rgba(12, 74, 110, 0.45)'
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
                      <FormLabel className={`text-xs uppercase tracking-[0.18em] text-slate-300 ${monoFont.className}`}>
                        Contraseña
                      </FormLabel>
                      <FormMessage />
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Ingresa tu contraseña"
                          disabled={signInForm.formState.isSubmitting}
                          className={`h-11 border-cyan-300/30 bg-cyan-950/45 text-sm text-cyan-50 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-300/70 ${displayFont.className}`}
                          style={{ 
                            boxShadow: 'inset 0 0 0 1px rgba(12, 74, 110, 0.45)'
                          }}
                        />
                      </FormControl>
                      
                    </FormItem>
                  )}
                />

                {signInForm.formState.errors.root && (
                  <Alert variant="destructive" className="border-red-500/50 bg-red-900/30 py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs text-red-100">
                      {signInForm.formState.errors.root.message}
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className={`h-11 w-full rounded-lg text-sm font-medium transition-all hover:brightness-110 ${displayFont.className}`} 
                  disabled={signInForm.formState.isSubmitting}
                  style={{
                    background: 'linear-gradient(120deg, rgba(45,212,191,1) 0%, rgba(34,211,238,1) 100%)',
                    color: '#03121a',
                    boxShadow: '0 0 28px rgba(34, 211, 238, 0.45)'
                  }}
                >
                  {signInForm.formState.isSubmitting ? 'Iniciando sesión...' : 'Continuar'}
                </Button>
              </form>
            </Form>
          )}

          {/* Sign Up Form */}
          {activeTab === 'signup' && (
            <Form {...signUpForm}>
              <form onSubmit={signUpForm.handleSubmit(handleRegister)} className="space-y-5">
                <FormField
                  control={signUpForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`text-xs uppercase tracking-[0.18em] text-slate-300 ${monoFont.className}`}>
                        Correo Electrónico
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-200/90" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="Ingresa tu correo"
                            disabled={signUpForm.formState.isSubmitting}
                            className={`h-11 border-cyan-300/30 bg-cyan-950/45 pl-10 text-sm text-cyan-50 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-300/70 ${displayFont.className}`}
                            style={{ 
                              boxShadow: 'inset 0 0 0 1px rgba(12, 74, 110, 0.45)'
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
                      <FormLabel className={`text-xs uppercase tracking-[0.18em] text-slate-300 ${monoFont.className}`}>
                        Contraseña
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Crea una contraseña"
                          disabled={signUpForm.formState.isSubmitting}
                          className={`h-11 border-cyan-300/30 bg-cyan-950/45 text-sm text-cyan-50 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-300/70 ${displayFont.className}`}
                          style={{ 
                            boxShadow: 'inset 0 0 0 1px rgba(12, 74, 110, 0.45)'
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {success && (
                  <Alert className="border-emerald-300/40 bg-emerald-800/20 py-2 text-emerald-100">
                    <AlertDescription className="text-xs">{success}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className={`h-11 w-full rounded-lg text-sm font-medium transition-all hover:brightness-110 ${displayFont.className}`} 
                  disabled={signUpForm.formState.isSubmitting}
                  style={{
                    background: 'linear-gradient(120deg, rgba(45,212,191,1) 0%, rgba(34,211,238,1) 100%)',
                    color: '#03121a',
                    boxShadow: '0 0 28px rgba(34, 211, 238, 0.45)'
                  }}
                >
                  {signUpForm.formState.isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
                </Button>
              </form>
            </Form>
          )}

          <div className={`mt-7 text-center text-[11px] uppercase tracking-[0.18em] text-slate-400 ${monoFont.className}`}>
            Conexión cifrada · Atlas Learning Engine
          </div>
        </div>
      </div>
    </div>
  );
}