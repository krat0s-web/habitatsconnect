'use client';

import { useState } from 'react';
import { FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
        setError(authError || "Utilisateur non trouvé. Veuillez vous inscrire d'abord.");
      }
    }, 500);
  };

  return (
    <div className="flex justify-center items-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="w-full max-w-md">
        <Card className="p-8 sm:p-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 font-bold text-slate-900 text-3xl">Bienvenue</h1>
            <p className="text-slate-600">Connectez-vous à votre compte HabitatsConnect</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 p-3 border border-red-200 rounded-lg">
                <p className="font-semibold text-red-800 text-sm">{error}</p>
              </div>
            )}
            {/* Email */}
            <div>
              <Label htmlFor="email" className="flex items-center mb-2 text-slate-700">
                <FaEnvelope className="inline mr-2" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="h-11"
                required
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="flex items-center mb-2 text-slate-700">
                <FaLock className="inline mr-2" /> Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11"
                required
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block mb-2 font-semibold text-slate-700 text-sm">Je suis...</label>
              <div className="gap-3 grid grid-cols-2">
                <Button
                  type="button"
                  variant={role === 'client' ? 'default' : 'outline'}
                  onClick={() => setRole('client')}
                  className={
                    role === 'client'
                      ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                      : ''
                  }
                >
                  Client
                </Button>
                <Button
                  type="button"
                  variant={role === 'owner' ? 'default' : 'outline'}
                  onClick={() => setRole('owner')}
                  className={
                    role === 'owner'
                      ? 'bg-secondary-100 text-secondary-700 border-2 border-secondary-500'
                      : ''
                  }
                >
                  Propriétaire
                </Button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input type="checkbox" className="rounded w-4 h-4" />
                Se souvenir de moi
              </label>
              <Link
                href="/forgot-password"
                className="font-semibold text-primary-600 hover:text-primary-700"
              >
                Mot de passe oublié?
              </Link>
            </div>

            {/* Submit Button */}
            <Button type="submit" variant="gradient" disabled={isLoading} className="w-full h-11">
              {isLoading ? 'Connexion...' : 'Se connecter'} <FaArrowRight className="ml-2" />
            </Button>
          </form>

          {/* Footer */}
          <p className="text-slate-600 text-center">
            Pas de compte?{' '}
            <Link
              href="/auth/register"
              className="font-semibold text-primary-600 hover:text-primary-700"
            >
              S&apos;inscrire
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
