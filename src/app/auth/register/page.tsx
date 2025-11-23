'use client';

import { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaArrowRight, FaHome } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'client' as 'client' | 'owner',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    await register(formData);

    // Redirection selon le rôle
    setTimeout(() => {
      if (formData.role === 'owner') {
        router.push('/dashboard/owner/properties');
      } else {
        router.push('/');
      }
    }, 1000);
  };

  return (
    <div className="flex justify-center items-center bg-gradient-to-br from-secondary-50 to-primary-50 px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="w-full max-w-2xl">
        <Card className="p-8 sm:p-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-block bg-gradient-fluid mb-4 p-4 rounded-full">
              <FaHome className="text-white text-2xl" />
            </div>
            <h1 className="mb-2 font-bold text-slate-900 text-3xl">Créer votre compte</h1>
            <p className="text-slate-600">Rejoignez HabitatsConnect et commencez l&apos;aventure</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {/* Name Row */}
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName" className="flex items-center mb-2 text-slate-700">
                  <FaUser className="inline mr-2" /> Prénom
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Jean"
                  className="h-11"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="mb-2 text-slate-700">
                  Nom
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Dupont"
                  className="h-11"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="flex items-center mb-2 text-slate-700">
                <FaEnvelope className="inline mr-2" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                className="h-11"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="flex items-center mb-2 text-slate-700">
                <FaPhone className="inline mr-2" /> Téléphone
              </Label>
              <Input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+33 6 12 34 56 78"
                className="h-11"
              />
            </div>

            {/* Password Row */}
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
              <div>
                <Label htmlFor="password" className="flex items-center mb-2 text-slate-700">
                  <FaLock className="inline mr-2" /> Mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="h-11"
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="mb-2 text-slate-700">
                  Confirmer mot de passe
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="h-11"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block mb-2 font-semibold text-slate-700 text-sm">Je suis...</label>
              <div className="gap-4 grid grid-cols-2">
                <Button
                  type="button"
                  variant={formData.role === 'client' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, role: 'client' })}
                  className={
                    formData.role === 'client'
                      ? 'bg-primary-100 text-primary-700 border-2 border-primary-500 h-11'
                      : 'h-11'
                  }
                >
                  Client
                </Button>
                <Button
                  type="button"
                  variant={formData.role === 'owner' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, role: 'owner' })}
                  className={
                    formData.role === 'owner'
                      ? 'bg-secondary-100 text-secondary-700 border-2 border-secondary-500 h-11'
                      : 'h-11'
                  }
                >
                  Propriétaire
                </Button>
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 rounded w-4 h-4"
              />
              <span className="text-sm">
                J&apos;accepte les{' '}
                <Link
                  href="/terms"
                  className="font-semibold text-primary-600 hover:text-primary-700"
                >
                  conditions d&apos;utilisation
                </Link>{' '}
                et la{' '}
                <Link
                  href="/privacy"
                  className="font-semibold text-primary-600 hover:text-primary-700"
                >
                  politique de confidentialité
                </Link>
              </span>
            </label>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="gradient"
              disabled={!agreeTerms || isLoading}
              className="w-full h-11"
            >
              {isLoading ? 'Inscription...' : 'Créer mon compte'} <FaArrowRight className="ml-2" />
            </Button>
          </form>

          {/* Footer */}
          <p className="text-slate-600 text-center">
            Vous avez déjà un compte?{' '}
            <Link
              href="/auth/login"
              className="font-semibold text-primary-600 hover:text-primary-700"
            >
              Se connecter
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
