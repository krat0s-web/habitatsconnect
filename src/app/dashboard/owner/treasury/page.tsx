'use client';

import { useState, useEffect } from 'react';
import {
  FaWallet,
  FaEuroSign,
  FaCalendar,
  FaCheckCircle,
  FaClock,
  FaDownload,
  FaChartLine,
} from 'react-icons/fa';
import { useAuthStore, useTransactionStore } from '@/store';
import type { Transaction } from '@/types';
import { PRICE_SYMBOL } from '@/lib/static';

export default function TreasuryPage() {
  const { user } = useAuthStore();
  const { transactions, subscribeToTransactions, unsubscribeFromTransactions } =
    useTransactionStore();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  useEffect(() => {
    if (user?.id) {
      // Subscribe to real-time transactions for this owner
      subscribeToTransactions(user.id);
    }

    return () => {
      unsubscribeFromTransactions();
    };
  }, [user?.id, subscribeToTransactions, unsubscribeFromTransactions]);

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const totalIncome = transactions
    .filter((t) => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPending = transactions
    .filter((t) => t.type === 'income' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full font-semibold text-green-700 text-sm">
            <FaCheckCircle /> Complété
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full font-semibold text-yellow-700 text-sm">
            <FaClock /> En attente
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 px-3 py-1 rounded-full font-semibold text-red-700 text-sm">
            ✕ Annulé
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-slate-900 text-2xl">Trésorerie</h2>
        <button className="flex items-center gap-2 bg-primary-50 hover:bg-primary-100 px-6 py-3 rounded-lg font-semibold text-primary-600 transition">
          <FaDownload /> Télécharger Relevé
        </button>
      </div>

      {/* Stats Grid */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Income */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 shadow-md p-6 border-green-500 border-l-4 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-green-600 text-sm">Revenus Reçus</div>
              <div className="mt-2 font-bold text-green-900 text-3xl">
                {totalIncome.toLocaleString()}
                {PRICE_SYMBOL}
              </div>
            </div>
            <FaEuroSign className="text-green-200 text-5xl" />
          </div>
        </div>

        {/* Pending Income */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-md p-6 border-yellow-500 border-l-4 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-yellow-600 text-sm">En Attente</div>
              <div className="mt-2 font-bold text-yellow-900 text-3xl">
                {totalPending.toLocaleString()}
                {PRICE_SYMBOL}
              </div>
            </div>
            <FaClock className="text-yellow-200 text-5xl" />
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 shadow-md p-6 border-red-500 border-l-4 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-red-600 text-sm">Frais & Dépenses</div>
              <div className="mt-2 font-bold text-red-900 text-3xl">
                {totalExpense.toLocaleString()}
                {PRICE_SYMBOL}
              </div>
            </div>
            <FaWallet className="text-red-200 text-5xl" />
          </div>
        </div>

        {/* Net Balance */}
        <div className="bg-gradient-fluid shadow-md p-6 border-primary-600 border-l-4 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <div className="opacity-90 font-semibold text-white text-sm">Solde Net</div>
              <div className="mt-2 font-bold text-white text-3xl">
                {netBalance.toLocaleString()}
                {PRICE_SYMBOL}
              </div>
            </div>
            <FaChartLine className="opacity-30 text-white text-5xl" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        {(['all', 'income', 'expense'] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filter === filterType
                ? 'bg-primary-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {filterType === 'all' && 'Toutes'}
            {filterType === 'income' && 'Revenus'}
            {filterType === 'expense' && 'Dépenses'}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-slate-200 border-b">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-700 text-sm text-left">
                  <FaCalendar className="inline mr-2" /> Date
                </th>
                <th className="px-6 py-4 font-bold text-slate-700 text-sm text-left">
                  Description
                </th>
                <th className="px-6 py-4 font-bold text-slate-700 text-sm text-left">Statut</th>
                <th className="px-6 py-4 font-bold text-slate-700 text-sm text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {new Date(transaction.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 text-sm">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 text-sm">{getStatusBadge(transaction.status)}</td>
                  <td
                    className={`px-6 py-4 text-right text-sm font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {transaction.amount.toLocaleString()}
                    {PRICE_SYMBOL}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTransactions.length === 0 && (
        <div className="bg-white py-12 rounded-xl text-center">
          <FaWallet className="mx-auto mb-4 text-slate-300 text-6xl" />
          <p className="font-semibold text-slate-600 text-xl">Aucune transaction</p>
        </div>
      )}
    </div>
  );
}
