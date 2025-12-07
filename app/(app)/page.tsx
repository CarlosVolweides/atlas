'use client';
import React, { useState } from 'react';
import { redirect } from 'next/navigation';
import { Toaster } from 'sonner';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'inicio' | 'configuracion'>('inicio');
  const [userName, setUserName] = useState('Admin');
  const [userLanguage, setUserLanguage] = useState('es');

  const handleLogin = (username: string, password: string) => {
    if (username === 'admin@gmail.com' && password === 'admin') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen max-h-screen overflow-hidden">
      {!isAuthenticated ? (
        redirect('/login')
      ) : currentScreen === 'inicio' ? (
        <h1>Inicio</h1>
      ) : (
        <h1>Configuración</h1>
      )}
      <Toaster />
    </div>
  );
}