'use client';

import { useState, useEffect } from 'react';
import {
  FaChartLine,
  FaCalendarAlt,
  FaEuroSign,
  FaHome,
  FaUsers,
  FaStar,
  FaDownload,
} from 'react-icons/fa';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuthStore, useTransactionStore, useReservationStore, usePropertyStore } from '@/store';
import type { Transaction, Reservation, Property } from '@/types';
import { PRICE_SYMBOL } from '@/lib/static';

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const { transactions, subscribeToTransactions, unsubscribeFromTransactions } =
    useTransactionStore();
  const { reservations, subscribeToReservations, unsubscribeFromReservations } =
    useReservationStore();
  const { properties } = usePropertyStore();

  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    if (user?.id) {
      subscribeToTransactions(user.id);
      subscribeToReservations();
    }

    return () => {
      unsubscribeFromTransactions();
      unsubscribeFromReservations();
    };
  }, [user?.id, subscribeToTransactions, unsubscribeFromReservations, subscribeToReservations, unsubscribeFromTransactions]);

  // Filter owner's data
  const ownerTransactions = transactions.filter((t) => t.ownerId === user?.id);
  const ownerReservations = reservations.filter((r) => r.property?.ownerId === user?.id);
  const ownerProperties = properties.filter((p) => p.ownerId === user?.id);

  // Calculate metrics
  const totalRevenue = ownerTransactions
    .filter((t) => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReservations = ownerReservations.length;
  const confirmedReservations = ownerReservations.filter((r) => r.status === 'confirmed').length;
  const completedReservations = ownerReservations.filter((r) => r.status === 'completed').length;

  const averageRating = ownerProperties.length > 0
    ? ownerProperties.reduce((sum, p) => sum + ((p as any).rating || 0), 0) / ownerProperties.length
    : 0;

  // Revenue data for chart
  const getRevenueData = () => {
    const now = new Date();
    const data = [];
    const months = timeRange === 'month' ? 12 : timeRange === 'quarter' ? 4 : 1;

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

      const monthRevenue = ownerTransactions
        .filter((t) => {
          if (t.type !== 'income' || t.status !== 'completed') return false;
          const transactionDate = new Date(t.date);
          return transactionDate.getMonth() === date.getMonth() &&
                 transactionDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, t) => sum + t.amount, 0);

      data.push({
        name: monthName,
        revenue: monthRevenue,
      });
    }

    return data;
  };

  // Reservation status data for pie chart
  const reservationStatusData = [
    { name: 'Confirmées', value: confirmedReservations, color: '#10B981' },
    { name: 'Complétées', value: completedReservations, color: '#3B82F6' },
    { name: 'En attente', value: ownerReservations.filter(r => r.status === 'pending').length, color: '#F59E0B' },
    { name: 'Rejetées', value: ownerReservations.filter(r => r.status === 'rejected').length, color: '#EF4444' },
  ];

  // Top properties by revenue
  const getTopProperties = () => {
    const propertyRevenue = ownerProperties.map((property) => {
      const revenue = ownerTransactions
        .filter((t) => t.propertyId === property.id && t.type === 'income' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        name: property.title.length > 20 ? property.title.substring(0, 20) + '...' : property.title,
        revenue,
      };
    });

    return propertyRevenue.sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  };

  if (!user) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-600 text-lg">Veuillez vous connecter pour voir les analyses</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-slate-900 text-2xl">Analyses et Statistiques</h2>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'month' | 'quarter' | 'year')}
            className="px-4 py-2 border border-slate-300 rounded-lg"
          >
            <option value="month">12 derniers mois</option>
            <option value="quarter">4 derniers trimestres</option>
            <option value="year">Dernière année</option>
          </select>
          <button className="flex items-center gap-2 bg-primary-50 hover:bg-primary-100 px-6 py-3 rounded-lg font-semibold text-primary-600 transition">
            <FaDownload /> Exporter
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 shadow-md p-6 border-green-500 border-l-4 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-green-600 text-sm">Revenus Totaux</div>
              <div className="mt-2 font-bold text-green-900 text-3xl">
                {totalRevenue.toLocaleString()}
                {PRICE_SYMBOL}
              </div>
            </div>
            <FaEuroSign className="text-green-200 text-5xl" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 shadow-md p-6 border-blue-500 border-l-4 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-blue-600 text-sm">Total Réservations</div>
              <div className="mt-2 font-bold text-blue-900 text-3xl">
                {totalReservations}
              </div>
            </div>
            <FaCalendarAlt className="text-blue-200 text-5xl" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 shadow-md p-6 border-purple-500 border-l-4 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-purple-600 text-sm">Propriétés</div>
              <div className="mt-2 font-bold text-purple-900 text-3xl">
                {ownerProperties.length}
              </div>
            </div>
            <FaHome className="text-purple-200 text-5xl" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-md p-6 border-yellow-500 border-l-4 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-yellow-600 text-sm">Note Moyenne</div>
              <div className="mt-2 font-bold text-yellow-900 text-3xl">
                {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
              </div>
            </div>
            <FaStar className="text-yellow-200 text-5xl" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="bg-white shadow-md p-6 rounded-xl">
          <h3 className="mb-4 font-bold text-slate-900 text-lg">Évolution des Revenus</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getRevenueData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} ${PRICE_SYMBOL}`, 'Revenus']} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Reservation Status Pie Chart */}
        <div className="bg-white shadow-md p-6 rounded-xl">
          <h3 className="mb-4 font-bold text-slate-900 text-lg">Statut des Réservations</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reservationStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {reservationStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Properties */}
      <div className="bg-white shadow-md p-6 rounded-xl">
        <h3 className="mb-4 font-bold text-slate-900 text-lg">Top Propriétés par Revenus</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getTopProperties()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} ${PRICE_SYMBOL}`, 'Revenus']} />
            <Legend />
            <Bar dataKey="revenue" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Additional Stats */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
        <div className="bg-white shadow-md p-6 rounded-xl">
          <h4 className="mb-2 font-semibold text-slate-700">Taux de Confirmation</h4>
          <div className="text-3xl font-bold text-green-600">
            {totalReservations > 0 ? ((confirmedReservations / totalReservations) * 100).toFixed(1) : 0}%
          </div>
          <p className="text-slate-500 text-sm">Réservations confirmées sur total</p>
        </div>

        <div className="bg-white shadow-md p-6 rounded-xl">
          <h4 className="mb-2 font-semibold text-slate-700">Revenus Moyens par Réservation</h4>
          <div className="text-3xl font-bold text-blue-600">
            {completedReservations > 0 ? (totalRevenue / completedReservations).toFixed(0) : 0} {PRICE_SYMBOL}
          </div>
          <p className="text-slate-500 text-sm">Par réservation complétée</p>
        </div>

        <div className="bg-white shadow-md p-6 rounded-xl">
          <h4 className="mb-2 font-semibold text-slate-700">Taux d'Occupation</h4>
          <div className="text-3xl font-bold text-purple-600">
            {ownerProperties.length > 0 ? ((completedReservations / ownerProperties.length) * 100 / 12).toFixed(1) : 0}%
          </div>
          <p className="text-slate-500 text-sm">Moyen mensuel</p>
        </div>
      </div>
    </div>
  );
}