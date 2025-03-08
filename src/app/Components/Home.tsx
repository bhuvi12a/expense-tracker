'use client'
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiCalendar, FiClock, FiDollarSign, FiTrendingUp, FiPieChart } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface ExpenseData {
  _id?: string;
  description: string;
  amount: number;
  date: string;
}

// Add this interface for stats
interface ExpenseStats {
  daily: number;
  weekly: number;
  monthly: number;
  balance: number;
  spendingPercentage: number;
  otherIncome: number;
}

const MONTHLY_SALARY = 10000; // You can make this configurable later

const Home: React.FC = () => {
  const router = useRouter();
  const [expense, setExpense] = useState<ExpenseData>({
    description: '',
    amount: 0,
    date: '',
  });
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState<ExpenseStats>({
    daily: 0,
    weekly: 0,
    monthly: 0,
    balance: MONTHLY_SALARY,
    spendingPercentage: 0,
    otherIncome: 0
  });
  const [filterDate, setFilterDate] = useState<string>('');
  const [filteredExpenses, setFilteredExpenses] = useState<ExpenseData[]>([]);
  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [newSalary, setNewSalary] = useState(0);
  const [otherIncome, setOtherIncome] = useState(0);

  // Add this function to calculate stats
  const calculateStats = (expensesList: ExpenseData[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = expensesList.reduce(
      (acc, expense) => {
        const expenseDate = new Date(expense.date);
        const amount = Number(expense.amount);

        if (expenseDate >= today) {
          acc.daily += amount;
        }
        if (expenseDate >= oneWeekAgo) {
          acc.weekly += amount;
        }
        if (expenseDate >= currentMonthStart) {
          acc.monthly += amount;
        }

        return acc;
      },
      { daily: 0, weekly: 0, monthly: 0, balance: newSalary, spendingPercentage: 0, otherIncome: 0 }
    );

    // Calculate balance and percentage using newSalary
    stats.balance = newSalary - stats.monthly;
    stats.spendingPercentage = (stats.monthly / newSalary) * 100;

    setStats(stats);
  };

  // Modify the useEffect that fetches expenses
  useEffect(() => {
    fetchExpenses();
  }, []);

  // Add this useEffect to update stats when expenses change
  useEffect(() => {
    calculateStats(expenses);
  }, [expenses]);

  // Calculate total amount whenever expenses change
  useEffect(() => {
    const total = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    setTotalAmount(total);
  }, [expenses]);

  // Add this function to handle date filtering
  const handleDateFilter = (date: string) => {
    setFilterDate(date);
    if (date) {
      const filtered = expenses.filter(exp => exp.date === date);
      setFilteredExpenses(filtered);
    } else {
      setFilteredExpenses(expenses);
    }
  };

  // Update useEffect to set filtered expenses when expenses change
  useEffect(() => {
    setFilteredExpenses(expenses);
  }, [expenses]);

  const fetchExpenses = async () => {
    const user = checkAuth();
    if (!user) return;

    try {
      const response = await fetch('/api/expenses', {
        headers: {
          'user-id': user.id
        }
      });
      const data = await response.json();
      if (data.success) {
        setExpenses(data.expenses);
      }
    } catch (error) {
      toast.error('Failed to fetch expenses');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExpense(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (exp: ExpenseData) => {
    setExpense(exp);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    const user = checkAuth();
    if (!user) return;

    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        const response = await fetch(`/api/expenses/${id}`, {
          method: 'DELETE',
          headers: {
            'user-id': user.id
          }
        });

        if (response.ok) {
          toast.success('Expense deleted successfully');
          fetchExpenses();
        } else {
          throw new Error('Failed to delete expense');
        }
      } catch (error) {
        toast.error('Failed to delete expense');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = checkAuth();
    if (!user) return;

    setLoading(true);
    
    try {
      const url = isEditing && expense._id 
        ? `/api/expenses/${expense._id}` 
        : '/api/expenses';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'user-id': user.id
        },
        body: JSON.stringify(expense),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(isEditing ? 'Expense updated successfully!' : 'Expense added successfully!');
        setExpense({ description: '', amount: 0, date: '' });
        setIsEditing(false);
        fetchExpenses();
      }
    } catch (error) {
      toast.error(isEditing ? 'Failed to update expense' : 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  // Add this function to check authentication
  const checkAuth = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return null;
    }
    return JSON.parse(user);
  };

  // Modify the fetchSalary function
  const fetchSalary = async () => {
    const user = checkAuth();
    if (!user) return;

    try {
      const response = await fetch('/api/salary', {
        headers: {
          'user-id': user.id
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setNewSalary(data.salary);
        setStats(prev => ({
          ...prev,
          balance: data.salary - prev.monthly,
          spendingPercentage: (prev.monthly / data.salary) * 100
        }));
      }
    } catch (error) {
      console.error('Failed to fetch salary:', error);
      toast.error('Failed to fetch salary');
    }
  };

  // Modify the handleSalaryUpdate function
  const handleSalaryUpdate = async () => {
    const user = checkAuth();
    if (!user) return;

    if (newSalary >= 0) {
      try {
        const response = await fetch('/api/salary', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'user-id': user.id
          },
          body: JSON.stringify({ 
            salary: newSalary,
            otherIncome: otherIncome 
          })
        });

        if (response.ok) {
          const totalIncome = newSalary + otherIncome;
          setStats(prev => ({
            ...prev,
            balance: totalIncome - prev.monthly,
            spendingPercentage: (prev.monthly / totalIncome) * 100,
            otherIncome: otherIncome
          }));
          setIsEditingSalary(false);
          toast.success('Income updated successfully!');
        } else {
          throw new Error('Failed to update income');
        }
      } catch (error) {
        toast.error('Failed to update income');
      }
    } else {
      toast.error('Please enter valid amounts');
    }
  };

  // Add authentication check to useEffect
  useEffect(() => {
    const user = checkAuth();
    if (user) {
      fetchSalary();
      fetchExpenses();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Salary Overview Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 transform hover:scale-[1.01] transition-transform duration-300">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <FiPieChart className="text-blue-600" />
            Monthly Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-6 text-center transform hover:scale-[1.02] transition-all duration-300">
              <p className="text-gray-600 text-lg mb-2">Monthly Income</p>
              {isEditingSalary ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600">Salary</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        value={newSalary}
                        onChange={(e) => setNewSalary(Number(e.target.value))}
                        className="w-full pl-8 p-2 text-xl font-bold text-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="100"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600">Other Income</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        value={otherIncome}
                        onChange={(e) => setOtherIncome(Number(e.target.value))}
                        className="w-full pl-8 p-2 text-xl font-bold text-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="100"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={handleSalaryUpdate}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingSalary(false);
                        setNewSalary(stats.balance);
                        setOtherIncome(stats.otherIncome);
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Salary</p>
                      <p className="text-2xl font-bold text-gray-800">₹{newSalary.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Other Income</p>
                      <p className="text-2xl font-bold text-gray-800">₹{otherIncome.toFixed(2)}</p>
                    </div>
                    <div className="border-t pt-2">
                      <p className="text-sm text-gray-600">Total Income</p>
                      <p className="text-3xl font-bold text-gray-800">₹{(newSalary + otherIncome).toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditingSalary(true)}
                    className="absolute -top-2 -right-2 p-2 bg-blue-100 text-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiEdit2 size={16} />
                  </button>
                </div>
              )}
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center transform hover:scale-[1.02] transition-all duration-300">
              <p className="text-gray-600 text-lg mb-2">Spent This Month</p>
              <p className="text-4xl font-bold text-red-600">₹{stats.monthly.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-2">({stats.spendingPercentage.toFixed(1)}% of salary)</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center transform hover:scale-[1.02] transition-all duration-300">
              <p className="text-gray-600 text-lg mb-2">Remaining Balance</p>
              <p className="text-4xl font-bold text-green-600">₹{stats.balance.toFixed(2)}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-8">
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.spendingPercentage > 80 ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                  stats.spendingPercentage > 50 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 
                  'bg-gradient-to-r from-green-400 to-green-500'
                }`}
                style={{ width: `${Math.min(stats.spendingPercentage, 100)}%` }}
              >
                <div className="h-full flex items-center justify-center text-white text-sm font-bold">
                  {stats.spendingPercentage.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="mt-3 text-sm font-medium text-center">
              {stats.spendingPercentage > 80 ? (
                <span className="text-red-600">Warning: High spending!</span>
              ) : stats.spendingPercentage > 50 ? (
                <span className="text-yellow-600">Moderate spending</span>
              ) : (
                <span className="text-green-600">Healthy spending</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Today's Expenses", amount: stats.daily, icon: FiClock, color: "blue" },
            { title: "This Week", amount: stats.weekly, icon: FiCalendar, color: "green" },
            { title: "This Month", amount: stats.monthly, icon: FiTrendingUp, color: "purple" }
          ].map((stat, index) => (
            <div key={index} 
              className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-gray-600 text-lg flex items-center gap-2`}>
                    <stat.icon className={`text-${stat.color}-500 text-xl`} />
                    {stat.title}
                  </p>
                  <h3 className={`text-3xl font-bold text-${stat.color}-600 mt-2`}>
                    ₹{stat.amount.toFixed(2)}
                  </h3>
                </div>
                <div className={`bg-${stat.color}-50 p-4 rounded-full`}>
                  <FiDollarSign className={`text-${stat.color}-500 text-2xl`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form and List Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 transform hover:scale-[1.01] transition-transform duration-300">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {isEditing ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2">Description</label>
                <input
                  type="text"
                  name="description"
                  value={expense.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="amount"
                    value={expense.amount}
                    onChange={handleInputChange}
                    className="w-full pl-8 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={expense.date}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : isEditing ? 'Update Expense' : 'Add Expense'}
                </button>
                
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setExpense({ description: '', amount: 0, date: '' });
                      setIsEditing(false);
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Expenses List Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 transform hover:scale-[1.01] transition-transform duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Expenses List</h2>
              <div className="text-xl font-semibold text-green-600">
                Total: ₹{totalAmount.toFixed(2)}
              </div>
            </div>

            {/* Date Filter */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => handleDateFilter(e.target.value)}
                  className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                />
                {filterDate && (
                  <button
                    onClick={() => handleDateFilter('')}
                    className="px-4 py-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>

            {/* Filter Status */}
            {filterDate && (
              <div className="mb-4 p-4 bg-blue-50 rounded-xl text-blue-600 font-medium">
                Showing expenses for: {new Date(filterDate).toLocaleDateString()}
                <span className="ml-2 text-blue-500">
                  ({filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''})
                </span>
              </div>
            )}

            {/* Expenses List */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {filteredExpenses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {filterDate ? 'No expenses found for this date' : 'No expenses yet'}
                </div>
              ) : (
                filteredExpenses.map((exp) => (
                  <div
                    key={exp._id}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h3 className="font-medium text-gray-800">{exp.description}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(exp.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="font-medium text-blue-600 text-lg">
                          ₹{Number(exp.amount).toFixed(2)}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(exp)}
                            className="p-2 hover:bg-blue-100 rounded-full transition-all"
                          >
                            <FiEdit2 className="text-blue-600" size={18} />
                          </button>
                          <button
                            onClick={() => exp._id && handleDelete(exp._id)}
                            className="p-2 hover:bg-red-100 rounded-full transition-all"
                          >
                            <FiTrash2 className="text-red-600" size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
