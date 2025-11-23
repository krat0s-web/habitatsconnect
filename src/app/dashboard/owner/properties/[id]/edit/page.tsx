'use client';

import { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaImage } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore, usePropertyStore } from '@/store';
import { PRICE_SYMBOL } from '@/lib/static';
import type { Property } from '@/types';

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

export default function EditPropertyPage() {
  const params = useParams();
  const propertyId = params.id as string;

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
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imageError, setImageError] = useState('');
  const [property, setProperty] = useState<Property | null>(null);

  const { user } = useAuthStore();
  const { properties, updateProperty } = usePropertyStore();
  const router = useRouter();

  // Charger les données de la propriété
  useEffect(() => {
    const foundProperty = properties.find(p => p.id === propertyId);
    if (foundProperty) {
      setProperty(foundProperty);
      setFormData({
        title: foundProperty.title,
        description: foundProperty.description,
        type: foundProperty.type,
        price: foundProperty.price,
        location: foundProperty.location,
        address: foundProperty.address,
        bedrooms: foundProperty.bedrooms,
        bathrooms: foundProperty.bathrooms,
        area: foundProperty.area,
        amenities: foundProperty.amenities.join(', '),
      });
      setImages(foundProperty.images.map(img => img.url));
    }
  }, [propertyId, properties]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'price' || name === 'bedrooms' || name === 'bathrooms' || name === 'area'
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
        setImageError(
          "Cette URL n'est pas une image directe. Utilisez une URL d'image (jpg, png, webp, etc.)"
        );
        return;
      }

      setImages([...images, imageUrl]);
      setImageUrl('');
      setImageError('');
    } catch {
      setImageError("URL invalide. Assurez-vous que l'URL commence par http:// ou https://");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!user) {
        alert('Vous devez être connecté');
        return;
      }

      if (!property) {
        alert('Propriété non trouvée');
        return;
      }

      // Vérifier que l'utilisateur est le propriétaire
      if (property.ownerId !== user.id) {
        alert('Vous n\'avez pas les droits pour modifier cette propriété');
        return;
      }

      // Préparer les données pour l'API
      const propertyData = {
        ...formData,
        amenities: formData.amenities
          .split(',')
          .map((a) => a.trim())
          .filter((a) => a),
        images: (images.length > 0
          ? images
          : ['https://via.placeholder.com/500x300?text=Propriété']
        ).map((url, index) => ({
          url,
          alt: `Property image ${index + 1}`,
          order: index + 1,
        })),
      };

      // Utiliser la fonction updateProperty du store
      await updateProperty(propertyId, propertyData);

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/owner/properties');
      }, 1500);
    } catch (error: any) {
      console.error('Erreur:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement de la propriété...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <h2 className="mb-4 font-bold text-slate-900 text-2xl">Propriété non trouvée</h2>
          <p className="mb-6 text-slate-600">La propriété que vous cherchez n'existe pas ou a été supprimée.</p>
          <Link
            href="/dashboard/owner/properties"
            className="bg-primary-600 hover:bg-primary-700 px-6 py-3 rounded-lg font-semibold text-white transition"
          >
            Retour à mes annonces
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-bold text-slate-900 text-3xl">Modifier l'Annonce</h2>
        <Link
          href="/dashboard/owner/properties"
          className="flex items-center gap-2 hover:bg-slate-100 px-4 py-2 rounded-lg text-slate-600 transition"
        >
          <FaTimes /> Fermer
        </Link>
      </div>

      {success && (
        <div className="bg-green-50 mb-6 p-4 border border-green-200 rounded-lg">
          <p className="font-semibold text-green-800">✓ Annonce modifiée avec succès!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white shadow-md p-8 rounded-xl">
          <h3 className="mb-6 font-bold text-slate-900 text-xl">Informations Générales</h3>

          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-semibold text-slate-700 text-sm">
                Titre de l'annonce *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Bel appartement au centre-ville"
                required
                className="px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 w-full transition"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-slate-700 text-sm">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez votre propriété en détail..."
                required
                rows={4}
                className="px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 w-full transition"
              />
            </div>

            <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
              <div>
                <label className="block mb-2 font-semibold text-slate-700 text-sm">
                  Type de propriété *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 w-full transition"
                >
                  <option value="apartment">Appartement</option>
                  <option value="villa">Villa</option>
                  <option value="studio">Studio</option>
                  <option value="garage">Garage</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-slate-700 text-sm">
                  Prix par nuit ({PRICE_SYMBOL}) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  required
                  className="px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 w-full transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white shadow-md p-8 rounded-xl">
          <h3 className="mb-6 font-bold text-slate-900 text-xl">Localisation</h3>

          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-semibold text-slate-700 text-sm">
                Ville/Région *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ex: Paris 6ème"
                required
                className="px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 w-full transition"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-slate-700 text-sm">
                Adresse complète *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Ex: 123 Rue de la Paix"
                required
                className="px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 w-full transition"
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white shadow-md p-8 rounded-xl">
          <h3 className="mb-6 font-bold text-slate-900 text-xl">Détails de la Propriété</h3>

          <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
            <div>
              <label className="block mb-2 font-semibold text-slate-700 text-sm">Chambres *</label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                min="0"
                required
                className="px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 w-full transition"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-slate-700 text-sm">
                Salles de bain *
              </label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                min="0"
                required
                className="px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 w-full transition"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-slate-700 text-sm">
                Surface (m²) *
              </label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleChange}
                min="0"
                required
                className="px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 w-full transition"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block mb-2 font-semibold text-slate-700 text-sm">
              Équipements (séparés par des virgules)
            </label>
            <input
              type="text"
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              placeholder="Ex: WiFi, Parking, Piscine, Cuisine équipée"
              className="px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 w-full transition"
            />
          </div>
        </div>

        {/* Images */}
        <div className="bg-white shadow-md p-8 rounded-xl">
          <h3 className="flex items-center gap-2 mb-6 font-bold text-slate-900 text-xl">
            <FaImage /> Photos de la Propriété
          </h3>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Collez l'URL d'une image (https://...)"
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="bg-primary-500 hover:bg-primary-600 px-6 py-3 rounded-lg font-semibold text-white transition"
              >
                Ajouter
              </button>
            </div>

            {imageError && (
              <div className="bg-red-50 p-3 border border-red-200 rounded-lg">
                <p className="font-semibold text-red-700 text-sm">{imageError}</p>
              </div>
            )}

            {images.length > 0 && (
              <div className="gap-4 grid grid-cols-2 md:grid-cols-4">
                {images.map((image, index) => (
                  <div key={index} className="group relative">
                    <img
                      src={image}
                      alt={`Image ${index + 1}`}
                      className="rounded-lg w-full h-24 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="top-1 right-1 absolute bg-red-500 opacity-0 group-hover:opacity-100 p-1 rounded-full text-white transition"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-blue-50 p-4 border border-blue-200 rounded-lg">
              <p className="mb-2 font-semibold text-blue-800 text-sm">
                💡 Conseils pour les URLs d'images:
              </p>
              <ul className="space-y-1 ml-4 text-blue-700 text-sm">
                <li>• Utilisez des URLs d'images directes (jpg, png, webp, etc.)</li>
                <li>• Les URLs de recherche Google ne fonctionnent pas</li>
                <li>• Exemples de sources valides:</li>
                <li>&nbsp;&nbsp;- Unsplash: unsplash.com/photos/...</li>
                <li>&nbsp;&nbsp;- Pexels: pexels.com/photo/...</li>
                <li>&nbsp;&nbsp;- Votre serveur: exemple.com/images/photo.jpg</li>
              </ul>
            </div>

            <p className="text-slate-500 text-sm">
              Minimum 1 image recommandée. Les images de haute qualité attirent plus de clients.
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex flex-1 justify-center items-center gap-2 bg-gradient-fluid disabled:opacity-50 hover:shadow-lg px-6 py-4 rounded-lg font-bold text-white text-lg transition"
          >
            <FaSave /> {saving ? 'Modification en cours...' : "Modifier l'annonce"}
          </button>
          <Link
            href="/dashboard/owner/properties"
            className="flex justify-center items-center bg-slate-200 hover:bg-slate-300 px-6 py-4 rounded-lg font-bold text-slate-700 transition"
          >
            <FaTimes /> Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}