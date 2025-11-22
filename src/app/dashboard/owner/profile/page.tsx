'use client';

import { useState, useEffect } from 'react';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaSave,
  FaEdit,
} from 'react-icons/fa';
import { useAuthStore } from '@/store/authStore';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    bio: 'Propriétaire expérimenté avec passion pour l\'hospitalité.',
    languages: 'Français, Anglais',
    responseTime: '1 heure',
    acceptanceRate: '95%',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Mon Profil</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-6 py-3 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition font-semibold"
        >
          <FaEdit /> {isEditing ? 'Annuler' : 'Modifier'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8 space-y-8">
        <div className="flex items-end gap-6">
          <div className="w-32 h-32 bg-gradient-fluid rounded-full flex items-center justify-center text-white">
            <FaUser className="text-5xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {formData.firstName} {formData.lastName}
            </h1>
            <p className="text-slate-600 mt-1">Propriétaire Vérifié</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-primary-50 p-6 rounded-lg">
            <div className="text-sm text-primary-600 font-semibold mb-2">Temps de réponse</div>
            <div className="text-2xl font-bold text-primary-900">
              {formData.responseTime}
            </div>
          </div>
          <div className="bg-accent-50 p-6 rounded-lg">
            <div className="text-sm text-accent-600 font-semibold mb-2">Taux d'acceptation</div>
            <div className="text-2xl font-bold text-accent-900">
              {formData.acceptanceRate}
            </div>
          </div>
          <div className="bg-secondary-50 p-6 rounded-lg">
            <div className="text-sm text-secondary-600 font-semibold mb-2">Langues</div>
            <div className="text-xl font-bold text-secondary-900">
              {formData.languages}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FaUser className="text-primary-600" /> Informations Personnelles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none transition"
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
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none transition"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FaEnvelope className="text-primary-600" /> Informations de Contact
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none transition"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FaMapMarkerAlt className="text-primary-600" /> Adresse
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none transition"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Code Postal
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Pays
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none transition"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FaUser className="text-primary-600" /> À Propos de Vous
            </h3>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={!isEditing}
              rows={5}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none transition"
            />
          </div>

          {isEditing && (
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-fluid text-white rounded-lg hover:shadow-lg transition font-semibold"
            >
              <FaSave /> Enregistrer les modifications
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
