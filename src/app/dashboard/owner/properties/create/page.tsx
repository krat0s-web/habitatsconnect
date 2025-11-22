'use client';

import { useState } from 'react';
import { FaSave, FaTimes, FaImage } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore, usePropertyStore } from '@/store';

interface PropertyForm {
  title: string;
  description: string;
  type: 'villa' | 'apartment' | 'studio' | 'garage';
  price: number;
  location: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  amenities: string;
}

export default function CreatePropertyPage() {
  const [formData, setFormData] = useState<PropertyForm>({
    title: '',
    description: '',
    type: 'apartment',
    price: 0,
    location: '',
    address: '',
    bedrooms: 1,
    bathrooms: 1,
    area: 50,
    amenities: '',
  });

  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imageError, setImageError] = useState('');
  const { user } = useAuthStore();
  const { addProperty } = usePropertyStore();
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'bedrooms' || name === 'bathrooms' || name === 'area'
        ? parseFloat(value)
        : value,
    }));
  };

  const handleAddImage = () => {
    if (!imageUrl.trim()) {
      setImageError('Veuillez entrer une URL valide');
      return;
    }

    // Valider que c'est une URL d'image valide
    try {
      new URL(imageUrl);
      
      // Vérifier que l'URL ne contient pas les caractères d'une URL de recherche Google
      if (imageUrl.includes('/search?') || imageUrl.includes('q=')) {
        setImageError('Cette URL n\'est pas une image directe. Utilisez une URL d\'image (jpg, png, webp, etc.)');
        return;
      }

      setImages([...images, imageUrl]);
      setImageUrl('');
      setImageError('');
    } catch {
      setImageError('URL invalide. Assurez-vous que l\'URL commence par http:// ou https://');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        alert('Vous devez être connecté');
        return;
      }

      // Créer la nouvelle propriété avec l'objet complet
      const newProperty = {
        id: Math.random().toString(),
        ...formData,
        amenities: formData.amenities
          .split(',')
          .map((a) => a.trim())
          .filter((a) => a),
        images: (images.length > 0 ? images : ['https://via.placeholder.com/500x300?text=Propriété']).map(
          (url, index) => ({
            id: Math.random().toString(),
            url,
            alt: `Property image ${index + 1}`,
            order: index + 1,
          })
        ),
        owner: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        ownerId: user.id,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Ajouter au store Zustand (sauvegarde automatiquement dans localStorage)
      addProperty(newProperty);

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/owner/properties');
      }, 1500);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Créer une Annonce</h2>
        <Link
          href="/dashboard/owner/properties"
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
        >
          <FaTimes /> Fermer
        </Link>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-semibold">✓ Annonce créée avec succès!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Informations Générales</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Titre de l'annonce *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Bel appartement au centre-ville"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez votre propriété en détail..."
                required
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Type de propriété *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"
                >
                  <option value="apartment">Appartement</option>
                  <option value="villa">Villa</option>
                  <option value="studio">Studio</option>
                  <option value="garage">Garage</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Prix par nuit (€) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Localisation</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Ville/Région *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ex: Paris 6ème"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Adresse complète *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Ex: 123 Rue de la Paix"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Détails de la Propriété</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Chambres *
              </label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                min="0"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Salles de bain *
              </label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                min="0"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Surface (m²) *
              </label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleChange}
                min="0"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Équipements (séparés par des virgules)
            </label>
            <input
              type="text"
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              placeholder="Ex: WiFi, Parking, Piscine, Cuisine équipée"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"
            />
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <FaImage /> Photos de la Propriété
          </h3>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Collez l'URL d'une image (https://...)"
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-semibold"
              >
                Ajouter
              </button>
            </div>

            {imageError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-semibold">{imageError}</p>
              </div>
            )}

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-semibold mb-2">💡 Conseils pour les URLs d'images:</p>
              <ul className="text-sm text-blue-700 space-y-1 ml-4">
                <li>• Utilisez des URLs d'images directes (jpg, png, webp, etc.)</li>
                <li>• Les URLs de recherche Google ne fonctionnent pas</li>
                <li>• Exemples de sources valides:</li>
                <li>&nbsp;&nbsp;- Unsplash: unsplash.com/photos/...</li>
                <li>&nbsp;&nbsp;- Pexels: pexels.com/photo/...</li>
                <li>&nbsp;&nbsp;- Votre serveur: exemple.com/images/photo.jpg</li>
              </ul>
            </div>

            <p className="text-sm text-slate-500">
              Minimum 1 image recommandée. Les images de haute qualité attirent plus de clients.
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-fluid text-white rounded-lg hover:shadow-lg transition font-bold text-lg disabled:opacity-50"
          >
            <FaSave /> {loading ? 'Création en cours...' : 'Créer l\'annonce'}
          </button>
          <Link
            href="/dashboard/owner/properties"
            className="flex items-center justify-center px-6 py-4 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-bold"
          >
            <FaTimes /> Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
