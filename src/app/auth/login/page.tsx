'use client';

import { useState } from 'react';
import { FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'owner'>('client');
  const [error, setError] = useState('');
  const { login, isLoading, error: authError } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    await login(email, password, role);
    
    // Attendre un peu pour vérifier si le login a réussi
    setTimeout(() => {
      const { user } = useAuthStore.getState();
      if (user) {
        // Redirection selon le rôle
        if (role === 'owner') {
          router.push('/dashboard/owner/properties');
        } else {
          router.push('/');
        }
      } else {
        setError(authError || 'Utilisateur non trouvé. Veuillez vous inscrire d\'abord.');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Bienvenue
            </h1>
            <p className="text-slate-600">
              Connectez-vous à votre compte HabitatsConnect
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm font-semibold">{error}</p>
              </div>
            )}
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <FaEnvelope className="inline mr-2" /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <FaLock className="inline mr-2" /> Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Je suis...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`py-2 px-3 rounded-lg font-semibold text-sm transition ${
                    role === 'client'
                      ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                      : 'bg-slate-100 text-slate-700 border-2 border-transparent hover:bg-slate-200'
                  }`}
                >
                  Client
                </button>
                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`py-2 px-3 rounded-lg font-semibold text-sm transition ${
                    role === 'owner'
                      ? 'bg-secondary-100 text-secondary-700 border-2 border-secondary-500'
                      : 'bg-slate-100 text-slate-700 border-2 border-transparent hover:bg-slate-200'
                  }`}
                >
                  Propriétaire
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" />
                Se souvenir de moi
              </label>
              <Link
                href="/forgot-password"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Mot de passe oublié?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-fluid text-white font-bold rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}{' '}
              <FaArrowRight />
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-slate-600">
            Pas de compte?{' '}
            <Link
              href="/auth/register"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
