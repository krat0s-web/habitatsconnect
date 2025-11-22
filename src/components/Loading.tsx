'use client';

import { FaSpinner } from 'react-icons/fa';

interface LoadingProps {
  message?: string;
}

export const Loading = ({ message = 'Chargement...' }: LoadingProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-fluid opacity-20 animate-pulse"></div>
        <FaSpinner className="w-24 h-24 text-primary-600 animate-spin" />
      </div>
      <p className="text-xl font-semibold text-slate-700">{message}</p>
    </div>
  );
};
