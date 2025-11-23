'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaStar,
  FaRegStar,
  FaUser,
  FaCheckCircle,
  FaThumbsUp,
  FaReply,
  FaEdit,
  FaTrash,
} from 'react-icons/fa';
import { useAuthStore } from '@/store';
import type { Review } from '@/types';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc, orderBy, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ReviewSectionProps {
  propertyId: string;
  ownerId: string;
}

interface ReviewWithUser extends Review {
  userName?: string;
  userRole?: string;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ propertyId, ownerId }) => {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load reviews
  useEffect(() => {
    loadReviews();
  }, [propertyId]);

  const loadReviews = async () => {
    try {
      console.log('Loading reviews for propertyId:', propertyId);
      
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('propertyId', '==', propertyId)
      );

      const snapshot = await getDocs(reviewsQuery);
      console.log('Found reviews:', snapshot.size);
      
      const reviewsData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          console.log('Review data:', data);
          
          const reviewData = { 
            id: docSnap.id, 
            ...data,
            // Convert Firestore Timestamp to Date
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
          } as ReviewWithUser;
          
          // Load user data
          try {
            const userDoc = await getDoc(doc(db, 'users', reviewData.clientId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              reviewData.userName = `${userData.firstName} ${userData.lastName}`;
              reviewData.userRole = userData.role;
            }
          } catch (error) {
            console.error('Error loading user:', error);
          }
          
          return reviewData;
        })
      );

      // Sort by date client-side
      reviewsData.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      console.log('Processed reviews:', reviewsData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Vous devez être connecté pour laisser un avis');
      return;
    }

    if (user.id === ownerId) {
      alert('Vous ne pouvez pas laisser un avis sur votre propre propriété');
      return;
    }

    if (rating === 0) {
      alert('Veuillez sélectionner une note');
      return;
    }

    if (comment.trim().length < 10) {
      alert('Votre commentaire doit contenir au moins 10 caractères');
      return;
    }

    setSubmitting(true);

    try {
      if (editingId) {
        // Update existing review
        await updateDoc(doc(db, 'reviews', editingId), {
          rating,
          comment: comment.trim(),
          updatedAt: new Date(),
        });
        setEditingId(null);
      } else {
        // Create new review
        await addDoc(collection(db, 'reviews'), {
          propertyId,
          clientId: user.id,
          rating,
          comment: comment.trim(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Reset form
      setRating(0);
      setComment('');
      
      // Reload reviews
      await loadReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Erreur lors de l\'envoi de l\'avis');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review: ReviewWithUser) => {
    setEditingId(review.id);
    setRating(review.rating);
    setComment(review.comment);
    
    // Scroll to review form
    setTimeout(() => {
      const reviewForm = document.getElementById('review-form');
      if (reviewForm) {
        reviewForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      await loadReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Erreur lors de la suppression de l\'avis');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setRating(0);
    setComment('');
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage: reviews.length > 0
      ? ((reviews.filter((r) => r.rating === star).length / reviews.length) * 100).toFixed(0)
      : '0',
  }));

  return (
    <div className="mt-12" id="review-section">
      <h2 className="mb-8 font-bold text-slate-900 text-3xl">
        Avis des voyageurs ({reviews.length})
      </h2>

      {/* Rating Overview */}
      <div className="gap-8 grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-primary-50 to-secondary-50 mb-8 p-8 border border-primary-200 rounded-3xl">
        {/* Average Rating */}
        <div className="flex md:flex-row flex-col justify-center items-center gap-6">
          <div className="text-center">
            <div className="mb-2 font-bold text-6xl text-primary-600">{averageRating}</div>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={`text-2xl ${
                    star <= Math.round(parseFloat(averageRating))
                      ? 'text-yellow-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-slate-600">Sur {reviews.length} avis</p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {ratingDistribution.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="font-semibold text-slate-700 text-sm w-12">
                {star} <FaStar className="inline text-yellow-400 text-xs" />
              </span>
              <div className="relative flex-1 bg-slate-200 rounded-full h-2">
                <motion.div
                  className="absolute top-0 left-0 bg-gradient-fluid rounded-full h-2"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
              <span className="font-semibold text-slate-600 text-sm w-12 text-right">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Form */}
      {user && user.id !== ownerId && (
        <motion.div
          id="review-form"
          className="bg-white shadow-lg mb-8 p-6 border border-slate-200 rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="mb-4 font-bold text-slate-900 text-xl">
            {editingId ? 'Modifier votre avis' : 'Laisser un avis'}
          </h3>
          
          <form onSubmit={handleSubmitReview}>
            {/* Star Rating */}
            <div className="mb-4">
              <label className="block mb-2 font-semibold text-slate-700">Votre note</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="focus:outline-none"
                  >
                    {star <= (hoverRating || rating) ? (
                      <FaStar className="text-4xl text-yellow-400" />
                    ) : (
                      <FaRegStar className="text-4xl text-slate-300" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-4">
              <label className="block mb-2 font-semibold text-slate-700">
                Votre commentaire
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez votre expérience avec cette propriété..."
                className="px-4 py-3 border border-slate-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 w-full min-h-32 resize-none"
                required
              />
              <p className="mt-1 text-slate-500 text-sm">
                Minimum 10 caractères ({comment.length}/500)
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || rating === 0 || comment.trim().length < 10}
                className="flex-1 bg-gradient-fluid hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-bold text-white transition"
              >
                {submitting ? 'Envoi...' : editingId ? 'Modifier l\'avis' : 'Publier l\'avis'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-slate-200 hover:bg-slate-300 px-6 py-3 rounded-xl font-bold text-slate-700 transition"
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </motion.div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-block border-primary-600 border-t-4 border-b-4 border-solid rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white py-12 rounded-xl text-center">
            <FaStar className="mx-auto mb-4 text-slate-300 text-6xl" />
            <p className="font-semibold text-slate-600 text-xl">Aucun avis pour le moment</p>
            <p className="text-slate-500">Soyez le premier à partager votre expérience !</p>
          </div>
        ) : (
          <AnimatePresence>
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                className="bg-white shadow-md hover:shadow-lg p-6 border border-slate-200 rounded-2xl transition"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex md:flex-row flex-col justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex justify-center items-center bg-gradient-fluid rounded-full w-12 h-12 text-white">
                      <FaUser />
                    </div>

                    {/* User Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900">
                          {review.userName || 'Utilisateur'}
                        </h4>
                        {review.userRole === 'client' && (
                          <FaCheckCircle className="text-green-500 text-sm" title="Client vérifié" />
                        )}
                      </div>
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            className={`text-sm ${
                              star <= review.rating ? 'text-yellow-400' : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-slate-500 text-sm">
                        {(() => {
                          try {
                            let date: Date;
                            if (review.createdAt instanceof Date) {
                              date = review.createdAt;
                            } else if (typeof review.createdAt === 'object' && review.createdAt && 'seconds' in review.createdAt) {
                              date = new Date((review.createdAt as any).seconds * 1000);
                            } else {
                              date = new Date(review.createdAt);
                            }
                            return date.toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            });
                          } catch (error) {
                            return 'Date inconnue';
                          }
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons (if owner of review) */}
                  {user && user.id === review.clientId && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg text-blue-600 text-sm transition"
                      >
                        <FaEdit /> Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="flex items-center gap-2 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg text-red-600 text-sm transition"
                      >
                        <FaTrash /> Supprimer
                      </button>
                    </div>
                  )}
                </div>

                {/* Comment */}
                <p className="text-slate-700 leading-relaxed">{review.comment}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
