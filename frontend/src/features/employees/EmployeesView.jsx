import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  UserCheck,
  Building2,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Trash2,
  Edit2,
  Lock,
  Mail,
  KeyRound,
  Briefcase,
  Layers,
  Sparkles,
  RefreshCw,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../core/contexts/AuthContext';
import { useBusinessProfile } from '../../core/contexts/BusinessProfileContext';
import { employeeService } from '../../core/services/employeeService';
import { Modal } from '../../shared/components/Modal';

const ROLE_DEFINITIONS = {
  admin: {
    label: 'Company Administrator',
    shortLabel: 'Admin',
    color: '#9A3412',
    bg: '#FEF3C7',
    border: '#FDE68A',
    description: 'Full corporate authority: manage workforce, POS registers, bills, inventory, and subscription payments.',
  },
  manager: {
    label: 'Operations Manager',
    shortLabel: 'Manager',
    color: '#B45309',
    bg: '#FFFBEB',
    border: '#FCD34D',
    description: 'Operational leadership: supervise inventory stock, approve invoices, and handle customer deals.',
  },
  staff: {
    label: 'Front Counter Cashier / POS Staff',
    shortLabel: 'Staff',
    color: '#047857',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    description: 'Counter & POS transactions: create retail sales, lookup inventory stock, and issue receipts.',
  },
  auditor: {
    label: 'Compliance Auditor',
    shortLabel: 'Auditor',
    color: '#4338CA',
    bg: '#EEF2FF',
    border: '#C7D2FE',
    description: 'Read-only financial governance: inspect general ledgers, sales analytics, and audit records.',
  },
};

const COMMON_DEPARTMENTS = [
  'Store Operations',
  'Front Counter Checkout',
  'Inventory & Warehouse',
  'Financial Compliance',
  'Customer Support',
  'Sales & Accounts',
];

export const EmployeesView = () => {
  const { user } = useAuth();
  const { activeProfile } = useBusinessProfile();

  const [employees, setEmployees] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    staffCount: 0,
    auditorCount: 0,
    managerCount: 0,
    adminCount: 0,
    activeCount: 0,
    departments: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff',
    department: 'Front Counter Checkout',
    password: 'password123',
    bio: '',
    status: 'active',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Load employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await employeeService.getEmployees(user?.tenantId);
      if (res && res.success) {
        setEmployees(res.data || []);
        if (res.metrics) {
          setMetrics(res.metrics);
        }
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [user?.tenantId]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole =
        roleFilter === 'all'
          ? true
          : roleFilter === 'managers'
          ? emp.role === 'admin' || emp.role === 'manager'
          : emp.role === roleFilter;

      const matchesDepartment =
        departmentFilter === 'all' ? true : emp.department === departmentFilter;

      return matchesSearch && matchesRole && matchesDepartment;
    });
  }, [employees, searchTerm, roleFilter, departmentFilter]);

  // Handle Add Employee submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Please provide both full name and work email.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await employeeService.createEmployee({
        ...formData,
        tenantId: user?.tenantId,
      });

      if (res.success) {
        setIsAddOpen(false);
        setFormData({
          name: '',
          email: '',
          role: 'staff',
          department: 'Front Counter Checkout',
          password: 'password123',
          bio: '',
          status: 'active',
        });
        showToast(res.message || 'Employee added successfully!');
        fetchEmployees();
      } else {
        setFormError(res.message || 'Failed to create employee record.');
      }
    } catch (err) {
      setFormError(err.message || 'Server error creating employee.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Employee submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Full name cannot be empty.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await employeeService.updateEmployee(selectedEmployee.id || selectedEmployee._id, {
        name: formData.name,
        role: formData.role,
        department: formData.department,
        status: formData.status,
        bio: formData.bio,
      });

      if (res.success) {
        setIsEditOpen(false);
        setSelectedEmployee(null);
        showToast(res.message || 'Employee details updated.');
        fetchEmployees();
      } else {
        setFormError(res.message || 'Failed to update employee.');
      }
    } catch (err) {
      setFormError(err.message || 'Server error updating employee.');
    } finally {
      setSubmitting(false);
    }
  };

  // Inline role changer
  const handleQuickRoleChange = async (emp, newRole) => {
    try {
      const res = await employeeService.updateEmployee(emp.id || emp._id, {
        role: newRole,
      });
      if (res.success) {
        showToast(`Role updated to ${newRole.toUpperCase()} for ${emp.name}`);
        fetchEmployees();
      } else {
        showToast(res.message || 'Failed to update role', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error updating role', 'error');
    }
  };

  // Handle Delete Employee
  const handleDeleteConfirm = async () => {
    if (!selectedEmployee) return;

    try {
      setSubmitting(true);
      const res = await employeeService.deleteEmployee(selectedEmployee.id || selectedEmployee._id);
      if (res.success) {
        setIsDeleteOpen(false);
        setSelectedEmployee(null);
        showToast(res.message || 'Employee removed from company workforce.');
        fetchEmployees();
      } else {
        showToast(res.message || 'Failed to remove employee.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Server error removing employee.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (emp) => {
    setSelectedEmployee(emp);
    setFormData({
      name: emp.name || '',
      email: emp.email || '',
      role: emp.role || 'staff',
      department: emp.department || 'Operations',
      password: '',
      bio: emp.bio || '',
      status: emp.status || 'active',
    });
    setFormError('');
    setIsEditOpen(true);
  };

  const openDeleteModal = (emp) => {
    setSelectedEmployee(emp);
    setIsDeleteOpen(true);
  };

  const currentUserId = user?.userId || user?.id;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-md transition-all ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-[#FEF3C7] border-[#FDE68A] text-[#9A3412]'
          }`}
        >
          <div className="flex items-center gap-3">
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#9A3412]" />
            )}
            <span className="text-sm font-semibold">{toastMessage.message}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs font-bold uppercase underline hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[var(--border-color)] rounded-2xl p-6 sm:p-7 shadow-[var(--shadow-card)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAF6EF] border border-[var(--border-color)] text-xs font-bold text-[#9A3412] uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5 text-[#9A3412]" />
                <span>{user?.companyName || 'Corporate Workforce'}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-bold text-emerald-800 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>ACTIVE TENANT: {user?.tenantId || 'tenant-retail'}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              Company Workforce & Staff Governance
            </h1>
            <p className="text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              Provision internal accounts, counter checkout cashiers, financial auditors, and departmental managers for{' '}
              <strong className="text-[var(--text-primary)]">{user?.companyName || 'your business'}</strong>. All accounts are isolated strictly to your corporate perimeter.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchEmployees}
              className="p-3 rounded-xl bg-[#FAF6EF] hover:bg-[#F3ECE0] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-xs"
              title="Refresh Employee List"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                setFormData({
                  name: '',
                  email: '',
                  role: 'staff',
                  department: 'Front Counter Checkout',
                  password: 'password123',
                  bio: '',
                  status: 'active',
                });
                setFormError('');
                setIsAddOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#9A3412] hover:bg-[#78350F] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Employee</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards (Zero Gradients, Solid Beige & Terracotta) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Workforce */}
        <div className="bg-[#FFFFFF] border border-[var(--border-color)] rounded-2xl p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Total Workforce
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] flex items-center justify-center text-[#9A3412]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--text-primary)] font-mono">
              {metrics.total || employees.length}
            </span>
            <span className="text-xs text-emerald-700 font-semibold font-mono">
              {metrics.activeCount || employees.filter((e) => e.status !== 'inactive').length} Active
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Company-wide registered employees</p>
        </div>

        {/* Counter & POS Staff */}
        <div className="bg-[#FFFFFF] border border-[var(--border-color)] rounded-2xl p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              POS & Counter Staff
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-emerald-800">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--text-primary)] font-mono">
              {metrics.staffCount || employees.filter((e) => e.role === 'staff').length}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold">POS Clearances</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Cashier registers & daily order entry</p>
        </div>

        {/* Compliance Auditors */}
        <div className="bg-[#FFFFFF] border border-[var(--border-color)] rounded-2xl p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Financial Auditors
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-indigo-800">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--text-primary)] font-mono">
              {metrics.auditorCount || employees.filter((e) => e.role === 'auditor').length}
            </span>
            <span className="text-[11px] text-indigo-700 font-semibold">Read-Only</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">P&L inspection, balance sheets & tax</p>
        </div>

        {/* Store Management */}
        <div className="bg-[#FFFFFF] border border-[var(--border-color)] rounded-2xl p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Store Management
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#9A3412]">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--text-primary)] font-mono">
              {(metrics.adminCount || 0) + (metrics.managerCount || 0) ||
                employees.filter((e) => e.role === 'admin' || e.role === 'manager').length}
            </span>
            <span className="text-[11px] text-[#9A3412] font-semibold">Proprietors</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Supervisory authority & operations</p>
        </div>
      </div>

      {/* Role Authority Guide (Solid Warm Beige Cards) */}
      <div className="bg-[#FAF6EF] border border-[var(--border-color)] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#9A3412]" />
            <span>Role Permissions & Departmental Clearances</span>
          </span>
          <span className="text-[11px] font-mono text-[var(--text-muted)]">Company Tier Scoped</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(ROLE_DEFINITIONS).map(([rKey, info]) => (
            <div
              key={rKey}
              className="bg-[#FFFFFF] border border-[var(--border-color)] rounded-xl p-3.5 space-y-1.5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-bold font-mono px-2 py-0.5 rounded uppercase"
                  style={{ backgroundColor: info.bg, color: info.color, border: `1px solid ${info.border}` }}
                >
                  {info.shortLabel}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{info.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFFFF] border border-[var(--border-color)] rounded-2xl p-4 shadow-[var(--shadow-card)] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by name, email, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF6EF] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#9A3412] transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Role Filter Pills */}
          <div className="inline-flex p-1 bg-[#FAF6EF] border border-[var(--border-color)] rounded-xl text-xs">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                roleFilter === 'all'
                  ? 'bg-[#9A3412] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setRoleFilter('staff')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                roleFilter === 'staff'
                  ? 'bg-[#9A3412] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Staff
            </button>
            <button
              onClick={() => setRoleFilter('auditor')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                roleFilter === 'auditor'
                  ? 'bg-[#9A3412] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Auditors
            </button>
            <button
              onClick={() => setRoleFilter('managers')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                roleFilter === 'managers'
                  ? 'bg-[#9A3412] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Admins
            </button>
          </div>

          {/* Department Select */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#FAF6EF] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] font-semibold focus:outline-none focus:border-[#9A3412]"
          >
            <option value="all">All Departments</option>
            {COMMON_DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employee Workforce Table */}
      <div className="bg-[#FFFFFF] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF6EF] border-b border-[var(--border-color)] text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">
                <th className="py-3.5 px-5">Employee / Persona</th>
                <th className="py-3.5 px-5">Department</th>
                <th className="py-3.5 px-5">Corporate Role</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-xs">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-[var(--text-muted)] font-mono">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#9A3412]" />
                      <span>Loading company workforce directory...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-[var(--text-muted)]">
                    <div className="max-w-sm mx-auto space-y-2">
                      <Users className="w-8 h-8 mx-auto text-[var(--text-muted)]" />
                      <p className="font-bold text-[var(--text-primary)]">No employees match this filter</p>
                      <p className="text-[11px]">Try adjusting your search query or role filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const empId = emp.id || emp._id;
                  const isSelf = currentUserId === empId;
                  const roleConfig = ROLE_DEFINITIONS[emp.role] || ROLE_DEFINITIONS.staff;

                  return (
                    <tr
                      key={empId}
                      className="hover:bg-[#FAF6EF]/60 transition-colors group"
                    >
                      {/* Name & Contact */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              emp.avatar ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(emp.name)}`
                            }
                            alt={emp.name}
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-[var(--border-color)] flex-shrink-0 bg-[#FAF6EF]"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[var(--text-primary)] truncate text-sm">
                                {emp.name}
                              </span>
                              {isSelf && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#FEF3C7] text-[#9A3412] border border-[#FDE68A]">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5 truncate">
                              <Mail className="w-3 h-3 flex-shrink-0" />
                              <span>{emp.email}</span>
                            </div>
                            {emp.bio && (
                              <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate max-w-xs">
                                {emp.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF6EF] border border-[var(--border-color)] text-[11px] font-semibold text-[var(--text-secondary)]">
                          <Briefcase className="w-3 h-3 text-[#9A3412]" />
                          <span>{emp.department || 'Operations'}</span>
                        </span>
                      </td>

                      {/* Role & Quick Role Switcher */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <select
                            value={emp.role}
                            onChange={(e) => handleQuickRoleChange(emp, e.target.value)}
                            disabled={isSelf && emp.role === 'admin'}
                            className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#9A3412]"
                            style={{
                              backgroundColor: roleConfig.bg,
                              color: roleConfig.color,
                              borderColor: roleConfig.border,
                            }}
                            title={isSelf ? 'Cannot change your own role' : 'Click to reassign employee role'}
                          >
                            <option value="staff">STAFF (Cashier/POS)</option>
                            <option value="auditor">AUDITOR (Read-Only)</option>
                            <option value="manager">MANAGER (Operations)</option>
                            <option value="admin">ADMIN (Store Proprietor)</option>
                          </select>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        {emp.status === 'inactive' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span>INACTIVE</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            <span>ACTIVE</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(emp)}
                            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[#9A3412] hover:bg-[#FAF6EF] transition-colors"
                            title="Edit Employee Information"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(emp)}
                            disabled={isSelf}
                            className={`p-2 rounded-lg transition-colors ${
                              isSelf
                                ? 'opacity-30 cursor-not-allowed text-[var(--text-muted)]'
                                : 'text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title={isSelf ? 'Cannot delete your own account' : 'Remove employee from company'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Employee */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Employee"
        subtitle={`Provision a new user account for ${user?.companyName || 'your business'}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Maya Lin"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-[#FAF6EF] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[#9A3412]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Corporate Work Email *
            </label>
            <input
              type="email"
              required
              placeholder="e.g. mlin@retailshop.io"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-[#FAF6EF] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[#9A3412]"
            />
            <p className="text-[10px] text-[var(--text-muted)] mt-1">Must be unique within your organization.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Assign Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] font-semibold focus:outline-none focus:border-[#9A3412]"
              >
                <option value="staff">Staff (Cashier / POS)</option>
                <option value="auditor">Auditor (Financial Read-Only)</option>
                <option value="manager">Manager (Operations)</option>
                <option value="admin">Admin (Store Proprietor)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Department
              </label>
              <input
                type="text"
                list="department-suggestions"
                placeholder="e.g. Front Counter Checkout"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-[#FAF6EF] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[#9A3412]"
              />
              <datalist id="department-suggestions">
                {COMMON_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Temporary Initial Password
            </label>
            <input
              type="text"
              placeholder="password123"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3.5 py-2 text-xs font-mono bg-[#FAF6EF] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[#9A3412]"
            />
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              The employee can use this credential to log into their store account.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Job Responsibilities / Bio
            </label>
            <textarea
              rows="2"
              placeholder="Brief summary of duties and counter terminal assignments..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-[#FAF6EF] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[#9A3412]"
            />
          </div>

          <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[#FAF6EF]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[#9A3412] hover:bg-[#78350F] text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Register Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Employee */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Employee Record"
        subtitle={`Update credentials and permissions for ${selectedEmployee?.name || 'Employee'}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-[#FAF6EF] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[#9A3412]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Work Email (Read Only)
            </label>
            <input
              type="email"
              disabled
              value={formData.email}
              className="w-full px-3.5 py-2 text-xs bg-[#FAF6EF]/60 border border-[var(--border-color)] rounded-xl text-[var(--text-muted)] cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Corporate Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                disabled={currentUserId === (selectedEmployee?.id || selectedEmployee?._id) && formData.role === 'admin'}
                className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] font-semibold focus:outline-none focus:border-[#9A3412]"
              >
                <option value="staff">Staff (Cashier / POS)</option>
                <option value="auditor">Auditor (Financial Read-Only)</option>
                <option value="manager">Manager (Operations)</option>
                <option value="admin">Admin (Store Proprietor)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Account Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                disabled={currentUserId === (selectedEmployee?.id || selectedEmployee?._id)}
                className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] font-semibold focus:outline-none focus:border-[#9A3412]"
              >
                <option value="active">Active (Permitted)</option>
                <option value="inactive">Inactive (Suspended)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Department
            </label>
            <input
              type="text"
              list="department-suggestions"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-[#FAF6EF] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[#9A3412]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Job Responsibilities / Bio
            </label>
            <textarea
              rows="2"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-[#FAF6EF] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[#9A3412]"
            />
          </div>

          <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[#FAF6EF]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[#9A3412] hover:bg-[#78350F] text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Delete */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Remove Employee"
        subtitle="This action will permanently revoke this user's access to the company."
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2">
            <p className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Are you sure you want to remove this employee?</span>
            </p>
            <p>
              Employee: <strong className="font-mono">{selectedEmployee?.name}</strong> ({selectedEmployee?.email})
            </p>
            <p className="text-[11px] text-rose-700">
              Their active login token will be revoked and they will no longer be able to log in or process transactions.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[#FAF6EF]"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50"
            >
              {submitting ? 'Removing...' : 'Confirm Remove'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeesView;
