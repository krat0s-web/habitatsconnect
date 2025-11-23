'use client';

import { FaSpinner } from 'react-icons/fa';

interface LoadingProps {
  message?: string;
}

export const Loading = ({ message = 'Chargement...' }: LoadingProps) => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="relative mb-6 w-24 h-24">
        <div className="absolute inset-0 bg-gradient-fluid opacity-20 rounded-full animate-pulse"></div>
        <FaSpinner className="w-24 h-24 text-primary-600 animate-spin" />
      </div>
      <p className="font-semibold text-slate-700 text-xl">{message}</p>
    </div>
  );
};
