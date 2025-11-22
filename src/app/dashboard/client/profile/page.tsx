'use client';

import { useState, useEffect } from 'react';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaCamera,
} from 'react-icons/fa';
import { useAuthStore } from '@/store/authStore';

export default function ClientProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (user) {
      updateUser({
        ...user,
        ...formData,
      });
      setIsEditing(false);
      alert('Profil mis à jour avec succès!');
    }
  };

  if (!user) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Mon Profil</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
        >
          <FaEdit /> {isEditing ? 'Annuler' : 'Modifier'}
        </button>
      </div>

      {/* Profile Picture Section */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-fluid flex items-center justify-center text-white text-4xl">
              <FaUser />
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition">
                <FaCamera />
              </button>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-slate-600 capitalize">
              {user.role === 'client' ? 'Client' : 'Propriétaire'}
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl shadow-md p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Informations Personnelles</h3>

        <div className="space-y-4">
          {/* Name */}
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50 focus:ring-2 focus:ring-primary-500 outline-none transition"
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50 focus:ring-2 focus:ring-primary-500 outline-none transition"
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
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50 focus:ring-2 focus:ring-primary-500 outline-none transition"
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
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50 focus:ring-2 focus:ring-primary-500 outline-none transition"
            />
          </div>

          {/* Account Info */}
          <div className="pt-6 border-t border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-3">Informations du Compte</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-600">Rôle</p>
                <p className="font-semibold text-slate-900 capitalize">
                  {user.role === 'client' ? 'Client' : 'Propriétaire'}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Membre depuis</p>
                <p className="font-semibold text-slate-900">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
            >
              Enregistrer les modifications
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-semibold"
            >
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
