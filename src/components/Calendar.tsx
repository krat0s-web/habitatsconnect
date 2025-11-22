'use client';

import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import type { Reservation } from '@/types';

interface CalendarProps {
  propertyId: string;
  reservations: Reservation[];
  onDateRangeSelect: (checkIn: Date, checkOut: Date) => void;
  minDays?: number;
}

export default function Calendar({
  propertyId,
  reservations,
  onDateRangeSelect,
  minDays = 1,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<{
    checkIn: Date | null;
    checkOut: Date | null;
  }>({ checkIn: null, checkOut: null });

  // Obtenir toutes les dates réservées pour cette propriété
  const getReservedDates = () => {
    const reserved = new Set<string>();
    const propertyReservations = reservations.filter((r) => r.propertyId === propertyId);

    propertyReservations.forEach((reservation) => {
      if (reservation.status !== 'cancelled') {
        let currentDate = new Date(reservation.checkIn);
        const checkOutDate = new Date(reservation.checkOut);

        while (currentDate < checkOutDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          reserved.add(dateStr);
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    });

    return reserved;
  };

  const reservedDates = getReservedDates();

  const isDateReserved = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return reservedDates.has(dateStr);
  };

  const isDateInRange = (date: Date) => {
    if (!selectedRange.checkIn) return false;
    if (!selectedRange.checkOut) {
      return date.toDateString() === selectedRange.checkIn.toDateString();
    }

    return date >= selectedRange.checkIn && date <= selectedRange.checkOut;
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

    if (isDateReserved(clickedDate)) {
      return; // Ignorer les clics sur les dates réservées
    }

    if (!selectedRange.checkIn) {
      setSelectedRange({ checkIn: clickedDate, checkOut: null });
    } else if (!selectedRange.checkOut) {
      if (clickedDate < selectedRange.checkIn) {
        setSelectedRange({ checkIn: clickedDate, checkOut: null });
      } else {
        const daysDiff = Math.ceil(
          (clickedDate.getTime() - selectedRange.checkIn.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff >= minDays) {
          setSelectedRange({ ...selectedRange, checkOut: clickedDate });
          onDateRangeSelect(selectedRange.checkIn, clickedDate);
        }
      }
    } else {
      // Réinitialiser et commencer une nouvelle sélection
      setSelectedRange({ checkIn: clickedDate, checkOut: null });
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthDays: (number | null)[] = [];
  const firstDay = getFirstDayOfMonth(currentDate);
  const daysInMonth = getDaysInMonth(currentDate);

  // Ajouter les jours vides du mois précédent
  for (let i = 0; i < firstDay; i++) {
    monthDays.push(null);
  }

  // Ajouter les jours du mois
  for (let i = 1; i <= daysInMonth; i++) {
    monthDays.push(i);
  }

  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const clearSelection = () => {
    setSelectedRange({ checkIn: null, checkOut: null });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Sélectionner vos dates</h3>
          {selectedRange.checkIn && (
            <button
              onClick={clearSelection}
              className="text-sm text-red-600 hover:text-red-700 font-semibold"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Selected Range Display */}
        {(selectedRange.checkIn || selectedRange.checkOut) && (
          <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
            <p className="text-sm text-slate-600 mb-2">
              <span className="font-semibold text-slate-900">Arrivée:</span>{' '}
              {selectedRange.checkIn?.toLocaleDateString('fr-FR')}
            </p>
            {selectedRange.checkOut && selectedRange.checkIn && (
              <>
                <p className="text-sm text-slate-600 mb-2">
                  <span className="font-semibold text-slate-900">Départ:</span>{' '}
                  {selectedRange.checkOut?.toLocaleDateString('fr-FR')}
                </p>
                <p className="text-sm text-primary-600 font-semibold">
                  {Math.ceil(
                    (selectedRange.checkOut.getTime() - selectedRange.checkIn.getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{' '}
                  nuits
                </p>
              </>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border-2 border-primary-500 rounded"></div>
            <span className="text-slate-600">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary-100 border-2 border-primary-500 rounded"></div>
            <span className="text-slate-600">Sélectionné</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded"></div>
            <span className="text-slate-600">Réservé</span>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            title="Mois précédent"
          >
            <FaChevronLeft className="text-slate-600" />
          </button>
          <h4 className="text-center font-bold text-slate-900 capitalize flex-1">
            {monthName}
          </h4>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            title="Mois suivant"
          >
            <FaChevronRight className="text-slate-600" />
          </button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2">
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
            <div key={day} className="text-center text-sm font-bold text-slate-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {monthDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square"></div>;
            }

            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const reserved = isDateReserved(date);
            const inRange = isDateInRange(date);
            const isToday =
              date.toDateString() === new Date().toDateString() && day === new Date().getDate();
            const isPast = date < new Date() && !isToday;

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                disabled={reserved || isPast}
                className={`
                  aspect-square rounded-lg font-semibold text-sm transition
                  flex items-center justify-center
                  ${
                    reserved
                      ? 'bg-red-100 text-red-600 border-2 border-red-500 cursor-not-allowed opacity-50'
                      : isPast
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                        : inRange
                          ? 'bg-primary-100 text-primary-600 border-2 border-primary-500'
                          : isToday
                            ? 'bg-blue-100 text-blue-600 border-2 border-blue-500'
                            : 'bg-white text-slate-900 border-2 border-slate-200 hover:border-primary-500 hover:bg-primary-50 cursor-pointer'
                  }
                `}
                title={reserved ? 'Réservé' : isPast ? 'Date passée' : ''}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Info Text */}
        <div className="text-xs text-slate-500 text-center">
          Les dates <span className="font-semibold text-red-600">en rouge</span> sont réservées.
          Les dates<span className="font-semibold text-slate-400"> grisées</span> sont passées.
        </div>
      </div>
    </div>
  );
}
