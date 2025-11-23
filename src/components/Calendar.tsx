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
  const [reservedDates, setReservedDates] = useState<Set<string>>(new Set());

  // Debug: Log reservations
  useEffect(() => {
    console.log('=== CALENDAR DEBUG ===');
    console.log('Property ID:', propertyId);
    console.log('Total reservations received:', reservations.length);
    console.log('All reservations:', reservations);
    const filtered = reservations.filter(r => r.propertyId === propertyId);
    console.log('Filtered for this property:', filtered.length);
    console.log('Filtered reservations:', filtered);
    console.log('======================');
  }, [propertyId, reservations]);

  // Obtenir toutes les dates réservées pour cette propriété
  const getReservedDates = () => {
    const reserved = new Set<string>();
    const propertyReservations = reservations.filter((r) => r.propertyId === propertyId);

    console.log('Property reservations for calendar:', propertyReservations);

    propertyReservations.forEach((reservation) => {
      console.log('Processing reservation:', reservation.id, 'Status:', reservation.status);
      
      // Include confirmed, completed, AND pending reservations
      if (reservation.status === 'confirmed' || reservation.status === 'completed' || reservation.status === 'pending') {
        try {
          // Convert to Date - handle all possible formats
          let checkInDate: Date;
          let checkOutDate: Date;

          // CheckIn conversion
          if (reservation.checkIn instanceof Date) {
            checkInDate = new Date(reservation.checkIn);
          } else if (reservation.checkIn?.toDate && typeof reservation.checkIn.toDate === 'function') {
            checkInDate = reservation.checkIn.toDate();
          } else if (typeof reservation.checkIn === 'object' && reservation.checkIn !== null && 'seconds' in reservation.checkIn) {
            checkInDate = new Date((reservation.checkIn as any).seconds * 1000);
          } else if (typeof reservation.checkIn === 'string') {
            checkInDate = new Date(reservation.checkIn);
          } else {
            console.warn('Unknown checkIn format:', reservation.checkIn);
            return;
          }

          // CheckOut conversion
          if (reservation.checkOut instanceof Date) {
            checkOutDate = new Date(reservation.checkOut);
          } else if (reservation.checkOut?.toDate && typeof reservation.checkOut.toDate === 'function') {
            checkOutDate = reservation.checkOut.toDate();
          } else if (typeof reservation.checkOut === 'object' && reservation.checkOut !== null && 'seconds' in reservation.checkOut) {
            checkOutDate = new Date((reservation.checkOut as any).seconds * 1000);
          } else if (typeof reservation.checkOut === 'string') {
            checkOutDate = new Date(reservation.checkOut);
          } else {
            console.warn('Unknown checkOut format:', reservation.checkOut);
            return;
          }

          console.log('Converted dates - CheckIn:', checkInDate, 'CheckOut:', checkOutDate);

          // Validate dates
          if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
            console.error('Invalid dates after conversion:', { checkIn: checkInDate, checkOut: checkOutDate, original: reservation });
            return;
          }

          // Mark all dates in the range as reserved
          let currentDate = new Date(checkInDate);
          currentDate.setHours(0, 0, 0, 0); // Reset to midnight
          
          const endDate = new Date(checkOutDate);
          endDate.setHours(0, 0, 0, 0); // Reset to midnight

          while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            console.log('Marking date as reserved:', dateStr);
            reserved.add(dateStr);
            currentDate.setDate(currentDate.getDate() + 1);
          }
        } catch (error) {
          console.error('Error processing reservation dates:', error, reservation);
        }
      }
    });

    console.log('Total reserved dates:', Array.from(reserved));
    return reserved;
  };

  // Recalculate reserved dates when reservations change
  useEffect(() => {
    console.log('Recalculating reserved dates...');
    const newReservedDates = getReservedDates();
    setReservedDates(newReservedDates);
  }, [reservations, propertyId]);

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
    <div className="bg-white shadow-md p-6 border border-slate-200 rounded-xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-900 text-lg">Sélectionner vos dates</h3>
          {selectedRange.checkIn && (
            <button
              onClick={clearSelection}
              className="font-semibold text-red-600 hover:text-red-700 text-sm"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Selected Range Display */}
        {(selectedRange.checkIn || selectedRange.checkOut) && (
          <div className="bg-primary-50 p-4 border border-primary-200 rounded-xl">
            <p className="mb-2 text-slate-600 text-sm">
              <span className="font-semibold text-slate-900">Arrivée:</span>{' '}
              {selectedRange.checkIn?.toLocaleDateString('fr-FR')}
            </p>
            {selectedRange.checkOut && selectedRange.checkIn && (
              <>
                <p className="mb-2 text-slate-600 text-sm">
                  <span className="font-semibold text-slate-900">Départ:</span>{' '}
                  {selectedRange.checkOut?.toLocaleDateString('fr-FR')}
                </p>
                <p className="font-semibold text-primary-600 text-sm">
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
        <div className="gap-3 grid grid-cols-1 sm:grid-cols-3 bg-slate-50 p-4 border border-slate-200 rounded-xl text-sm">
          <div className="flex items-center gap-2">
            <div className="bg-white border-2 border-slate-300 shadow-sm rounded w-6 h-6"></div>
            <span className="font-medium text-slate-700">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-primary-100 border-2 border-primary-500 shadow-sm rounded w-6 h-6"></div>
            <span className="font-medium text-slate-700">Sélectionné</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-red-100 border-2 border-red-500 shadow-sm rounded w-6 h-6"></div>
            <span className="font-medium text-red-700">Réservé</span>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevMonth}
            className="hover:bg-slate-100 p-2 rounded-xl transition"
            title="Mois précédent"
          >
            <FaChevronLeft className="text-slate-600" />
          </button>
          <h4 className="flex-1 font-bold text-slate-900 text-center capitalize">{monthName}</h4>
          <button
            onClick={handleNextMonth}
            className="hover:bg-slate-100 p-2 rounded-xl transition"
            title="Mois suivant"
          >
            <FaChevronRight className="text-slate-600" />
          </button>
        </div>

        {/* Days Header */}
        <div className="gap-2 grid grid-cols-7">
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
            <div key={day} className="py-2 font-bold text-slate-600 text-sm text-center">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="gap-2 grid grid-cols-7">
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
                  aspect-square rounded-xl font-semibold text-sm transition
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
        <div className="text-slate-500 text-xs text-center">
          Les dates <span className="font-semibold text-red-600">en rouge</span> sont réservées. Les
          dates<span className="font-semibold text-slate-400"> grisées</span> sont passées.
        </div>
      </div>
    </div>
  );
}
