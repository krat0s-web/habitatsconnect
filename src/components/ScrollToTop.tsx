'use client';

import { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import { useIsMobile } from '@/hooks';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // N'afficher que sur mobile et seulement si visible
  if (!isMobile || !isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      aria-label="Retour en haut"
    >
      <FaArrowUp className="text-lg" />
    </button>
  );
}