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
  FaPlus,
  FaTimes,
} from 'react-icons/fa';
import { useAuthStore, useTransactionStore } from '@/store';
import type { Transaction } from '@/types';
import { PRICE_SYMBOL } from '@/lib/static';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function TreasuryPage() {
  const { user } = useAuthStore();
  const { transactions, subscribeToTransactions, unsubscribeFromTransactions, addTransaction } =
    useTransactionStore();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      // Subscribe to real-time transactions for this owner
      subscribeToTransactions(user.id);
    }

    return () => {
      unsubscribeFromTransactions();
    };
  }, [user?.id, subscribeToTransactions, unsubscribeFromTransactions]);

  // Dédupliquer les transactions par reservationId
  const uniqueTransactions = transactions.reduce((acc, transaction) => {
    if (transaction.reservationId) {
      // Si c'est une transaction liée à une réservation, garder seulement la première
      const existing = acc.find(t => t.reservationId === transaction.reservationId);
      if (!existing) {
        acc.push(transaction);
      }
    } else {
      // Si pas de reservationId, garder la transaction
      acc.push(transaction);
    }
    return acc;
  }, [] as Transaction[]);

  const filteredTransactions = uniqueTransactions.filter((t) => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const totalIncome = uniqueTransactions
    .filter((t) => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPending = uniqueTransactions
    .filter((t) => t.type === 'income' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = uniqueTransactions
    .filter((t) => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Relevé de Trésorerie', 20, 30);
    
    // Owner info
    doc.setFontSize(12);
    doc.text(`Propriétaire: ${user?.firstName} ${user?.lastName}`, 20, 50);
    doc.text(`Date de génération: ${new Date().toLocaleDateString('fr-FR')}`, 20, 60);
    
    // Summary
    doc.text(`Revenus reçus: ${totalIncome.toLocaleString()} ${PRICE_SYMBOL}`, 20, 80);
    doc.text(`En attente: ${totalPending.toLocaleString()} ${PRICE_SYMBOL}`, 20, 90);
    doc.text(`Dépenses: ${totalExpense.toLocaleString()} ${PRICE_SYMBOL}`, 20, 100);
    doc.text(`Solde net: ${netBalance.toLocaleString()} ${PRICE_SYMBOL}`, 20, 110);
    
    // Transactions table
    const tableData = filteredTransactions.map((transaction) => [
      transaction.date ? new Date(transaction.date).toLocaleDateString('fr-FR') : 'Date invalide',
      transaction.description,
      getStatusBadgeText(transaction.status),
      `${transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()} ${PRICE_SYMBOL}`,
    ]);
    
    autoTable(doc, {
      head: [['Date', 'Description', 'Statut', 'Montant']],
      body: tableData,
      startY: 120,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    });
    
    // Footer
    doc.setFontSize(8);
    doc.text('Généré par HabitatsConnect', 20, doc.internal.pageSize.height - 10);
    
    // Download
    doc.save(`releve-tresorerie-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleAddExpense = async () => {
    if (!user?.id || !expenseDescription.trim() || !expenseAmount) return;

    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Veuillez entrer un montant valide');
      return;
    }

    if (amount > netBalance) {
      alert('Le montant de la dépense ne peut pas dépasser le solde net');
      return;
    }

    setIsSubmitting(true);
    try {
      const newExpense: Omit<Transaction, 'id'> = {
        ownerId: user.id,
        date: new Date(),
        description: expenseDescription.trim(),
        amount,
        status: 'completed',
        type: 'expense',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addTransaction(newExpense as Transaction);

      // Reset form
      setExpenseDescription('');
      setExpenseAmount('');
      setShowExpenseForm(false);
      alert('Dépense ajoutée avec succès');
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Erreur lors de l\'ajout de la dépense');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const getStatusBadgeText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Complété';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-slate-900 text-2xl">Trésorerie</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowExpenseForm(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold text-white transition"
          >
            <FaPlus /> Ajouter Dépense
          </button>
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 bg-primary-50 hover:bg-primary-100 px-6 py-3 rounded-lg font-semibold text-primary-600 transition"
          >
            <FaDownload /> Télécharger Relevé
          </button>
        </div>
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
                    {transaction.date ? new Date(transaction.date).toLocaleDateString('fr-FR') : 'Date invalide'}
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

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900 text-xl">Ajouter une Dépense</h3>
              <button
                onClick={() => setShowExpenseForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold text-slate-700 text-sm">
                  Description de la dépense
                </label>
                <input
                  type="text"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  placeholder="Ex: Réparation, Fournitures, etc."
                  className="px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500 w-full"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-slate-700 text-sm">
                  Montant ({PRICE_SYMBOL})
                </label>
                <input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500 w-full"
                  disabled={isSubmitting}
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-slate-600 text-sm">
                  Solde disponible: <span className="font-bold text-slate-900">{netBalance.toLocaleString()} {PRICE_SYMBOL}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowExpenseForm(false)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 px-6 py-3 rounded-xl font-semibold text-slate-700 transition"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                onClick={handleAddExpense}
                disabled={isSubmitting || !expenseDescription.trim() || !expenseAmount}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 px-6 py-3 rounded-xl font-semibold text-white transition"
              >
                {isSubmitting ? 'Ajout...' : 'Ajouter Dépense'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
