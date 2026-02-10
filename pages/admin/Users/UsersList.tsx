import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Search, Plus, Edit, Trash2, Check, X, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    plan: string;
    status: 'active' | 'inactive';
    createdAt: string;
}

const UsersList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            toast.error('فشل تحميل المستخدمين');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

        try {
            await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            toast.success('تم حذف المستخدم بنجاح');
            fetchUsers();
        } catch (error) {
            toast.error('فشل حذف المستخدم');
        }
    };

    const handleToggleStatus = async (userId: string, currentStatus: string) => {
        try {
            await fetch(`/api/admin/users/${userId}/toggle-status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: currentStatus === 'active' ? 'inactive' : 'active' })
            });
            toast.success('تم تحديث حالة المستخدم');
            fetchUsers();
        } catch (error) {
            toast.error('فشل تحديث الحالة');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">إدارة المستخدمين</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            إجمالي المستخدمين: {users.length}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        إضافة مستخدم
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="ابحث عن مستخدم..."
                                className="w-full pr-12 pl-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                className="w-full pr-12 pl-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            >
                                <option value="all">جميع الحالات</option>
                                <option value="active">نشط</option>
                                <option value="inactive">غير نشط</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                                        المستخدم
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                                        البريد الإلكتروني
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                                        الهاتف
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                                        الباقة
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                                        الحالة
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                            جاري التحميل...
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                            لا توجد نتائج
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <span className="font-medium text-slate-900 dark:text-white">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.phone}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium">
                                                    {user.plan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleStatus(user.id, user.status)}
                                                    className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 ${user.status === 'active'
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                        : 'bg-red-500/10 text-red-600 dark:text-red-400'
                                                        }`}
                                                >
                                                    {user.status === 'active' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                                    {user.status === 'active' ? 'نشط' : 'غير نشط'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-colors">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default UsersList;
