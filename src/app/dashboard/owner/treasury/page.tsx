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

export default function TreasuryPage() {
  const { user } = useAuthStore();
  const { transactions, loadTransactions, getTransactionsByOwnerId } = useTransactionStore();
  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  useEffect(() => {
    if (user?.id) {
      loadTransactions(user.id);
    }
  }, [user?.id, loadTransactions]);

  useEffect(() => {
    if (user?.id) {
      const ownerTransactions = getTransactionsByOwnerId(user.id);
      setDisplayedTransactions(ownerTransactions);
    }
  }, [user?.id, transactions, getTransactionsByOwnerId]);

  const filteredTransactions = displayedTransactions.filter((t) => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const totalIncome = displayedTransactions
    .filter((t) => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPending = displayedTransactions
    .filter((t) => t.type === 'income' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = displayedTransactions
    .filter((t) => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            <FaCheckCircle /> Complété
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
            <FaClock /> En attente
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
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
        <h2 className="text-2xl font-bold text-slate-900">Trésorerie</h2>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition font-semibold">
          <FaDownload /> Télécharger Relevé
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Income */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-green-600 font-semibold">Revenus Reçus</div>
              <div className="text-3xl font-bold text-green-900 mt-2">
                {totalIncome.toLocaleString()}€
              </div>
            </div>
            <FaEuroSign className="text-5xl text-green-200" />
          </div>
        </div>

        {/* Pending Income */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-yellow-600 font-semibold">En Attente</div>
              <div className="text-3xl font-bold text-yellow-900 mt-2">
                {totalPending.toLocaleString()}€
              </div>
            </div>
            <FaClock className="text-5xl text-yellow-200" />
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-red-600 font-semibold">Frais & Dépenses</div>
              <div className="text-3xl font-bold text-red-900 mt-2">
                {totalExpense.toLocaleString()}€
              </div>
            </div>
            <FaWallet className="text-5xl text-red-200" />
          </div>
        </div>

        {/* Net Balance */}
        <div className="bg-gradient-fluid rounded-xl shadow-md p-6 border-l-4 border-primary-600">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white font-semibold opacity-90">Solde Net</div>
              <div className="text-3xl font-bold text-white mt-2">
                {netBalance.toLocaleString()}€
              </div>
            </div>
            <FaChartLine className="text-5xl text-white opacity-30" />
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
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">
                  <FaCalendar className="inline mr-2" /> Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">
                  Statut
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">
                  Montant
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(transaction.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td
                    className={`px-6 py-4 text-right text-sm font-bold ${
                      transaction.type === 'income'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {transaction.amount.toLocaleString()}€
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <FaWallet className="text-6xl text-slate-300 mx-auto mb-4" />
          <p className="text-xl text-slate-600 font-semibold">Aucune transaction</p>
        </div>
      )}
    </div>
  );
}
