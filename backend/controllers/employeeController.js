import { User } from '../models/User.js';
import { getDbStatus } from '../config/db.js';
import {
  getInMemoryUsers,
  addInMemoryUser,
  updateInMemoryUser,
  deleteInMemoryUser,
  hashPassword,
} from './authController.js';

/**
 * Get all employees belonging to the company's tenant
 */
export const getEmployees = async (req, res) => {
  try {
    const isPlatformAdmin = req.user?.role === 'superadmin';
    const targetTenantId = (isPlatformAdmin && req.query.tenantId)
      ? req.query.tenantId
      : (req.tenantId || req.user?.tenantId || 'tenant-retail');

    let employees = [];

    if (getDbStatus().connected) {
      employees = await User.find({ tenantId: targetTenantId }).select('-password').sort({ createdAt: -1 });
    }

    if (!employees || employees.length === 0) {
      const allMemoryUsers = getInMemoryUsers();
      employees = allMemoryUsers
        .filter((u) => u.tenantId === targetTenantId)
        .map((u) => {
          const { password, ...safeUser } = u;
          return safeUser;
        });
    }

    const total = employees.length;
    const staffCount = employees.filter((e) => e.role === 'staff').length;
    const auditorCount = employees.filter((e) => e.role === 'auditor').length;
    const managerCount = employees.filter((e) => e.role === 'manager').length;
    const adminCount = employees.filter((e) => e.role === 'admin').length;
    const activeCount = employees.filter((e) => e.status !== 'inactive').length;
    const departments = [...new Set(employees.map((e) => e.department).filter(Boolean))];

    return res.json({
      success: true,
      count: employees.length,
      tenantId: targetTenantId,
      companyName: req.tenant?.name || req.user?.companyName || 'Company',
      metrics: {
        total,
        staffCount,
        auditorCount,
        managerCount,
        adminCount,
        activeCount,
        departments,
      },
      data: employees,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Add a new employee to the company
 */
export const createEmployee = async (req, res) => {
  try {
    const isPlatformAdmin = req.user?.role === 'superadmin';
    const targetTenantId = (isPlatformAdmin && req.query.tenantId)
      ? req.query.tenantId
      : (req.tenantId || req.user?.tenantId || 'tenant-retail');

    const { name, email, role = 'staff', department = 'Operations', password = 'password123', bio = '', avatar = '' } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Employee full name and email are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    // Validate role permissions
    const allowedRoles = ['admin', 'manager', 'staff', 'auditor'];
    if (isPlatformAdmin) allowedRoles.push('superadmin');

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role '${role}'. Permitted roles for company employees: [${allowedRoles.join(', ')}]`,
      });
    }

    // Check duplicate email within tenant
    const memoryUsers = getInMemoryUsers();
    const duplicateInMemory = memoryUsers.find(
      (u) => u.tenantId === targetTenantId && u.email.toLowerCase() === cleanEmail
    );

    if (duplicateInMemory) {
      return res.status(409).json({
        success: false,
        message: `An employee with email '${cleanEmail}' already exists in your company.`,
      });
    }

    if (getDbStatus().connected) {
      const duplicateInDb = await User.findOne({ tenantId: targetTenantId, email: cleanEmail });
      if (duplicateInDb) {
        return res.status(409).json({
          success: false,
          message: `An employee with email '${cleanEmail}' already exists in your company.`,
        });
      }
    }

    const hashedPassword = await hashPassword(password || 'password123');

    const newEmployee = {
      id: `user-emp-${Date.now()}`,
      tenantId: targetTenantId,
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role,
      companyName: req.tenant?.name || req.user?.companyName || 'Company',
      companyType: req.tenant?.vertical || req.user?.companyType || 'shop',
      department: department.trim() || 'General Operations',
      avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
      bio: bio.trim() || `${role.toUpperCase()} in ${department}`,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    if (getDbStatus().connected) {
      const created = await User.create(newEmployee);
      newEmployee._id = created._id;
    }

    addInMemoryUser(newEmployee);

    const { password: _, ...safeEmployee } = newEmployee;

    return res.status(201).json({
      success: true,
      message: `Employee '${cleanName}' registered successfully with role [${role.toUpperCase()}].`,
      data: safeEmployee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update existing employee (role, department, status, name, bio)
 */
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const isPlatformAdmin = req.user?.role === 'superadmin';
    const targetTenantId = (isPlatformAdmin && req.query.tenantId)
      ? req.query.tenantId
      : (req.tenantId || req.user?.tenantId || 'tenant-retail');

    const { name, role, department, status, bio } = req.body;

    const allowedRoles = ['admin', 'manager', 'staff', 'auditor'];
    if (isPlatformAdmin) allowedRoles.push('superadmin');

    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role '${role}'. Permitted roles: [${allowedRoles.join(', ')}]`,
      });
    }

    const updates = {};
    if (name) updates.name = name.trim();
    if (role) updates.role = role;
    if (department) updates.department = department.trim();
    if (status) updates.status = status;
    if (bio !== undefined) updates.bio = bio.trim();
    if (req.body.password) {
      updates.password = await hashPassword(req.body.password);
    }

    // Guard: Prevent deactivating self if admin
    const currentUserId = req.user?.userId || req.user?.id;
    if (currentUserId === id && status === 'inactive') {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own administrator account.',
      });
    }

    let updated = null;

    if (getDbStatus().connected) {
      updated = await User.findOneAndUpdate(
        { $or: [{ _id: id }, { id }], tenantId: targetTenantId },
        { $set: updates },
        { new: true }
      ).select('-password');
    }

    const memoryUpdated = updateInMemoryUser(id, updates);
    if (!updated && memoryUpdated) {
      const { password: _, ...safeMemory } = memoryUpdated;
      updated = safeMemory;
    }

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Employee with ID '${id}' not found in your organization.`,
      });
    }

    return res.json({
      success: true,
      message: `Employee '${updated.name}' updated successfully.`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Remove / Delete an employee from the company
 */
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const isPlatformAdmin = req.user?.role === 'superadmin';
    const targetTenantId = (isPlatformAdmin && req.query.tenantId)
      ? req.query.tenantId
      : (req.tenantId || req.user?.tenantId || 'tenant-retail');

    const currentUserId = req.user?.userId || req.user?.id;
    if (currentUserId === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove your own administrator account from the company.',
      });
    }

    let deleted = false;

    if (getDbStatus().connected) {
      const dbRes = await User.findOneAndDelete({
        $or: [{ _id: id }, { id }],
        tenantId: targetTenantId,
      });
      if (dbRes) deleted = true;
    }

    const memoryDeleted = deleteInMemoryUser(id);
    if (memoryDeleted) deleted = true;

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Employee with ID '${id}' not found in your organization.`,
      });
    }

    return res.json({
      success: true,
      message: 'Employee record successfully removed from company workforce.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
