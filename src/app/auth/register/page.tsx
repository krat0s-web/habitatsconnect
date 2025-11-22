'use client';

import { useState } from 'react';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaArrowRight,
  FaHome,
} from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-fluid rounded-full mb-4">
              <FaHome className="text-2xl text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Créer votre compte
            </h1>
            <p className="text-slate-600">
              Rejoignez HabitatsConnect et commencez l&apos;aventure
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {/* Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <FaUser className="inline mr-2" /> Prénom
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Jean"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Dupont"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <FaEnvelope className="inline mr-2" /> Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <FaPhone className="inline mr-2" /> Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+33 6 12 34 56 78"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <FaLock className="inline mr-2" /> Mot de passe
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirmer mot de passe
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Je suis...
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'client' })}
                  className={`py-3 px-4 rounded-lg font-semibold transition ${
                    formData.role === 'client'
                      ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                      : 'bg-slate-100 text-slate-700 border-2 border-transparent hover:bg-slate-200'
                  }`}
                >
                  Client
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'owner' })}
                  className={`py-3 px-4 rounded-lg font-semibold transition ${
                    formData.role === 'owner'
                      ? 'bg-secondary-100 text-secondary-700 border-2 border-secondary-500'
                      : 'bg-slate-100 text-slate-700 border-2 border-transparent hover:bg-slate-200'
                  }`}
                >
                  Propriétaire
                </button>
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 mt-1 rounded"
              />
              <span className="text-sm">
                J&apos;accepte les{' '}
                <Link
                  href="/terms"
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  conditions d&apos;utilisation
                </Link>{' '}
                et la{' '}
                <Link
                  href="/privacy"
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  politique de confidentialité
                </Link>
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!agreeTerms || isLoading}
              className="w-full py-3 bg-gradient-fluid text-white font-bold rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? 'Inscription...' : 'Créer mon compte'}{' '}
              <FaArrowRight />
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-slate-600">
            Vous avez déjà un compte?{' '}
            <Link
              href="/auth/login"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
