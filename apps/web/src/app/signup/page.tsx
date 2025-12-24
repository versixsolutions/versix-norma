'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não conferem.');
      return;
    }

    setLoading(true);

    // TODO: Integrar com Supabase Auth
    setTimeout(() => {
      setLoading(false);
      router.push('/onboarding');
    }, 1000);
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden relative font-sans">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          alt="Building"
          className="w-full h-full object-cover filter brightness-[0.4] contrast-125"
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
          fill
          priority
        />
        <div className="absolute inset-0 bg-primary/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent opacity-90" />
      </div>

      {/* Content */}
      <div
        className={`relative z-10 flex flex-col h-full transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Header */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 pb-4 overflow-y-auto">
          <div className="text-center mb-6 mt-8">
            <h1 className="text-3xl font-display font-bold text-white tracking-widest mb-2">
              NORMA
            </h1>
            <p className="text-blue-200 text-xs uppercase tracking-[0.2em]">
              Criar Conta
            </p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="w-full max-w-sm space-y-3">
            {/* Name */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400 text-xl">person</span>
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-none text-gray-700 dark:text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-secondary shadow-lg transition-all text-sm"
                placeholder="Nome completo"
                required
              />
            </div>

            {/* Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400 text-xl">mail</span>
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-none text-gray-700 dark:text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-secondary shadow-lg transition-all text-sm"
                placeholder="E-mail"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400 text-xl">lock</span>
              </div>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-none text-gray-700 dark:text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-secondary shadow-lg transition-all text-sm"
                placeholder="Senha"
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400 text-xl">lock</span>
              </div>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-none text-gray-700 dark:text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-secondary shadow-lg transition-all text-sm"
                placeholder="Confirmar senha"
                required
              />
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
                required
              />
              <label htmlFor="terms" className="text-xs text-blue-100 leading-relaxed">
                Li e aceito os{' '}
                <span className="text-white font-bold hover:underline cursor-pointer">
                  Termos de Uso
                </span>{' '}
                e{' '}
                <span className="text-white font-bold hover:underline cursor-pointer">
                  Política de Privacidade
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-secondary text-white font-bold shadow-lg hover:bg-secondary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  Criar Conta
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-white dark:bg-card-dark rounded-t-[2.5rem] p-6 shadow-2xl">
          <p className="text-center text-sm text-text-sub">
            Já tem conta?{' '}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
