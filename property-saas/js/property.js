// RentBoss — Property Management Core Logic
const RentBoss = {
  // ─── Data Store ───
  getData(key) {
    return JSON.parse(localStorage.getItem(`rentboss_${key}`) || '[]');
  },
  setData(key, data) {
    localStorage.setItem(`rentboss_${key}`, JSON.stringify(data));
  },
  genId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },

  // ─── Properties CRUD ───
  getProperties() { return this.getData('properties'); },
  saveProperty(prop) {
    const props = this.getProperties();
    if (prop.id) {
      const idx = props.findIndex(p => p.id === prop.id);
      if (idx >= 0) props[idx] = { ...props[idx], ...prop };
      else props.push(prop);
    } else {
      prop.id = this.genId();
      prop.createdAt = new Date().toISOString();
      props.push(prop);
    }
    this.setData('properties', props);
    return prop;
  },
  deleteProperty(id) {
    this.setData('properties', this.getProperties().filter(p => p.id !== id));
    // Cascade delete tenants and leases tied to this property
    this.setData('tenants', this.getTenants().filter(t => t.propertyId !== id));
    this.setData('leases', this.getLeases().filter(l => l.propertyId !== id));
  },
  getProperty(id) {
    return this.getProperties().find(p => p.id === id);
  },

  // ─── Tenants CRUD ───
  getTenants() { return this.getData('tenants'); },
  saveTenant(tenant) {
    const tenants = this.getTenants();
    if (tenant.id) {
      const idx = tenants.findIndex(t => t.id === tenant.id);
      if (idx >= 0) tenants[idx] = { ...tenants[idx], ...tenant };
      else tenants.push(tenant);
    } else {
      tenant.id = this.genId();
      tenant.createdAt = new Date().toISOString();
      tenants.push(tenant);
    }
    this.setData('tenants', tenants);
    return tenant;
  },
  deleteTenant(id) {
    this.setData('tenants', this.getTenants().filter(t => t.id !== id));
  },
  getTenant(id) {
    return this.getTenants().find(t => t.id === id);
  },
  getTenantsByProperty(propertyId) {
    return this.getTenants().filter(t => t.propertyId === propertyId);
  },

  // ─── Leases CRUD ───
  getLeases() { return this.getData('leases'); },
  saveLease(lease) {
    const leases = this.getLeases();
    if (lease.id) {
      const idx = leases.findIndex(l => l.id === lease.id);
      if (idx >= 0) leases[idx] = { ...leases[idx], ...lease };
      else leases.push(lease);
    } else {
      lease.id = this.genId();
      lease.createdAt = new Date().toISOString();
      leases.push(lease);
    }
    this.setData('leases', leases);
    return lease;
  },
  deleteLease(id) {
    this.setData('leases', this.getLeases().filter(l => l.id !== id));
  },
  getActiveLease(propertyId, unitId) {
    return this.getLeases().find(l =>
      l.propertyId === propertyId &&
      l.unitId === unitId &&
      l.status === 'active' &&
      new Date(l.endDate) >= new Date()
    );
  },
  getUpcomingLeases(days = 30) {
    const now = new Date();
    const future = new Date(now.getTime() + days * 86400000);
    return this.getLeases().filter(l => {
      const end = new Date(l.endDate);
      return l.status === 'active' && end >= now && end <= future;
    });
  },

  // ─── Payments CRUD ───
  getPayments() { return this.getData('payments'); },
  savePayment(payment) {
    const payments = this.getPayments();
    if (!payment.id) {
      payment.id = this.genId();
      payment.createdAt = new Date().toISOString();
    }
    payments.push(payment);
    this.setData('payments', payments);
    return payment;
  },
  getPaymentsByTenant(tenantId) {
    return this.getPayments().filter(p => p.tenantId === tenantId).sort((a, b) => new Date(b.date) - new Date(a.date));
  },
  getPaymentsByProperty(propertyId) {
    return this.getPayments().filter(p => p.propertyId === propertyId);
  },
  getMonthlyPayments(year, month) {
    return this.getPayments().filter(p => {
      const d = new Date(p.date);
      return d.getFullYear() === year && d.getMonth() === month - 1;
    });
  },

  // ─── Expenses CRUD ───
  getExpenses() { return this.getData('expenses'); },
  saveExpense(expense) {
    const expenses = this.getExpenses();
    if (!expense.id) {
      expense.id = this.genId();
      expense.createdAt = new Date().toISOString();
    }
    expenses.push(expense);
    this.setData('expenses', expenses);
    return expense;
  },
  getExpensesByProperty(propertyId) {
    return this.getExpenses().filter(e => e.propertyId === propertyId);
  },

  // ─── Maintenance CRUD ───
  getMaintenance() { return this.getData('maintenance'); },
  saveMaintenance(req) {
    const maint = this.getMaintenance();
    if (req.id) {
      const idx = maint.findIndex(m => m.id === req.id);
      if (idx >= 0) maint[idx] = { ...maint[idx], ...req };
      else maint.push(req);
    } else {
      req.id = this.genId();
      req.createdAt = new Date().toISOString();
      req.status = req.status || 'open';
      maint.push(req);
    }
    this.setData('maintenance', maint);
    return req;
  },
  deleteMaintenance(id) {
    this.setData('maintenance', this.getMaintenance().filter(m => m.id !== id));
  },
  getMaintenanceByProperty(propertyId) {
    return this.getMaintenance().filter(m => m.propertyId === propertyId);
  },
  getOpenMaintenance() {
    return this.getMaintenance().filter(m => m.status !== 'completed');
  },

  // ─── Financial Calculations ───
  getPropertyRevenue(propertyId, year, month) {
    const payments = this.getPayments().filter(p => {
      const d = new Date(p.date);
      return p.propertyId === propertyId &&
        (!year || d.getFullYear() === year) &&
        (!month || d.getMonth() === month - 1);
    });
    return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  },
  getPropertyExpenses(propertyId, year, month) {
    const expenses = this.getExpenses().filter(e => {
      const d = new Date(e.date);
      return e.propertyId === propertyId &&
        (!year || d.getFullYear() === year) &&
        (!month || d.getMonth() === month - 1);
    });
    return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  },
  getProfitLoss(propertyId, year, month) {
    const revenue = this.getPropertyRevenue(propertyId, year, month);
    const expenses = this.getPropertyExpenses(propertyId, year, month);
    return { revenue, expenses, profit: revenue - expenses };
  },
  getTotalRevenue(year, month) {
    return this.getProperties().reduce((sum, p) =>
      sum + this.getPropertyRevenue(p.id, year, month), 0);
  },
  getTotalExpenses(year, month) {
    return this.getProperties().reduce((sum, p) =>
      sum + this.getPropertyExpenses(p.id, year, month), 0);
  },
  getGST(amount, rate = 0.13) {
    return Math.round(amount * rate * 100) / 100;
  },

  // ─── Occupancy Stats ───
  getOccupancyStats() {
    const props = this.getProperties();
    let totalUnits = 0, occupiedUnits = 0;
    props.forEach(p => {
      const units = p.units || [];
      totalUnits += units.length;
      units.forEach(u => {
        if (this.getActiveLease(p.id, u.id)) occupiedUnits++;
      });
    });
    return {
      totalUnits,
      occupiedUnits,
      vacantUnits: totalUnits - occupiedUnits,
      occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0
    };
  },

  // ─── Seed Demo Data ───
  seedDemoData() {
    if (this.getProperties().length > 0) return;

    const props = [
      { id: 'prop1', name: 'Maple Heights', address: '123 Maple St, Toronto, ON', type: 'apartment', units: [
        { id: 'u1', name: 'Unit 101', beds: 2, baths: 1, rent: 2200 },
        { id: 'u2', name: 'Unit 102', beds: 1, baths: 1, rent: 1800 },
        { id: 'u3', name: 'Unit 103', beds: 2, baths: 2, rent: 2500 },
      ]},
      { id: 'prop2', name: 'Oak Ridge Townhomes', address: '456 Oak Ave, Mississauga, ON', type: 'townhouse', units: [
        { id: 'u4', name: 'Townhome A', beds: 3, baths: 2, rent: 3200 },
        { id: 'u5', name: 'Townhome B', beds: 3, baths: 2, rent: 3200 },
      ]},
      { id: 'prop3', name: 'Cedar Court', address: '789 Cedar Blvd, Brampton, ON', type: 'condo', units: [
        { id: 'u6', name: 'Suite 201', beds: 1, baths: 1, rent: 1900 },
        { id: 'u7', name: 'Suite 301', beds: 2, baths: 1, rent: 2300 },
      ]},
    ];
    props.forEach(p => {
      p.createdAt = new Date().toISOString();
      this.setData('properties', [...this.getProperties(), p]);
    });

    const tenants = [
      { id: 't1', firstName: 'Sarah', lastName: 'Chen', email: 'sarah@email.com', phone: '416-555-0101', propertyId: 'prop1', unitId: 'u1' },
      { id: 't2', firstName: 'James', lastName: 'Okafor', email: 'james@email.com', phone: '416-555-0102', propertyId: 'prop1', unitId: 'u2' },
      { id: 't3', firstName: 'Priya', lastName: 'Sharma', email: 'priya@email.com', phone: '905-555-0103', propertyId: 'prop2', unitId: 'u4' },
      { id: 't4', firstName: 'Michael', lastName: 'Rossi', email: 'michael@email.com', phone: '905-555-0104', propertyId: 'prop3', unitId: 'u6' },
    ];
    tenants.forEach(t => {
      t.createdAt = new Date().toISOString();
      this.setData('tenants', [...this.getTenants(), t]);
    });

    const now = new Date();
    const leases = [
      { id: 'l1', tenantId: 't1', propertyId: 'prop1', unitId: 'u1', startDate: '2025-09-01', endDate: '2026-08-31', rentAmount: 2200, status: 'active' },
      { id: 'l2', tenantId: 't2', propertyId: 'prop1', unitId: 'u2', startDate: '2025-06-01', endDate: '2026-05-31', rentAmount: 1800, status: 'active' },
      { id: 'l3', tenantId: 't3', propertyId: 'prop2', unitId: 'u4', startDate: '2025-11-01', endDate: '2026-10-31', rentAmount: 3200, status: 'active' },
      { id: 'l4', tenantId: 't4', propertyId: 'prop3', unitId: 'u6', startDate: '2025-12-01', endDate: '2026-11-30', rentAmount: 1900, status: 'active' },
    ];
    leases.forEach(l => {
      l.createdAt = new Date().toISOString();
      this.setData('leases', [...this.getLeases(), l]);
    });

    const payments = [
      { id: 'p1', tenantId: 't1', propertyId: 'prop1', amount: 2200, date: '2026-03-01', type: 'rent', method: 'e-transfer' },
      { id: 'p2', tenantId: 't2', propertyId: 'prop1', amount: 1800, date: '2026-03-01', type: 'rent', method: 'e-transfer' },
      { id: 'p3', tenantId: 't3', propertyId: 'prop2', amount: 3200, date: '2026-03-02', type: 'rent', method: 'cheque' },
      { id: 'p4', tenantId: 't4', propertyId: 'prop3', amount: 1900, date: '2026-03-01', type: 'rent', method: 'e-transfer' },
      { id: 'p5', tenantId: 't1', propertyId: 'prop1', amount: 2200, date: '2026-02-01', type: 'rent', method: 'e-transfer' },
      { id: 'p6', tenantId: 't2', propertyId: 'prop1', amount: 1800, date: '2026-02-01', type: 'rent', method: 'e-transfer' },
      { id: 'p7', tenantId: 't3', propertyId: 'prop2', amount: 3200, date: '2026-02-01', type: 'rent', method: 'cheque' },
      { id: 'p8', tenantId: 't4', propertyId: 'prop3', amount: 1900, date: '2026-02-01', type: 'rent', method: 'e-transfer' },
    ];
    payments.forEach(p => {
      p.createdAt = new Date().toISOString();
      this.setData('payments', [...this.getPayments(), p]);
    });

    const expenses = [
      { id: 'e1', propertyId: 'prop1', amount: 450, date: '2026-03-15', category: 'plumbing', description: 'Fix leaky faucet Unit 102' },
      { id: 'e2', propertyId: 'prop1', amount: 1200, date: '2026-03-01', category: 'insurance', description: 'Monthly insurance premium' },
      { id: 'e3', propertyId: 'prop2', amount: 3500, date: '2026-02-20', category: 'hvac', description: 'HVAC maintenance' },
      { id: 'e4', propertyId: 'prop3', amount: 800, date: '2026-03-10', category: 'landscaping', description: 'Spring landscaping' },
    ];
    expenses.forEach(e => {
      e.createdAt = new Date().toISOString();
      this.setData('expenses', [...this.getExpenses(), e]);
    });

    const maintenance = [
      { id: 'm1', propertyId: 'prop1', unitId: 'u1', tenantId: 't1', title: 'Dishwasher not draining', description: 'Water pools at the bottom after each cycle', priority: 'medium', status: 'open', contractor: '', cost: 0 },
      { id: 'm2', propertyId: 'prop1', unitId: 'u3', tenantId: '', title: 'Window seal broken', description: 'Condensation between panes in living room', priority: 'low', status: 'open', contractor: '', cost: 0 },
      { id: 'm3', propertyId: 'prop2', unitId: 'u4', tenantId: 't3', title: 'Garage door opener faulty', description: 'Intermittent operation, makes grinding noise', priority: 'high', status: 'in_progress', contractor: 'QuickFix Doors', cost: 350 },
    ];
    maintenance.forEach(m => {
      m.createdAt = new Date().toISOString();
      this.setData('maintenance', [...this.getMaintenance(), m]);
    });
  },

  // ─── Formatting Helpers ───
  formatCurrency(n) {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n || 0);
  },
  formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
  },
  daysUntil(dateStr) {
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / 86400000);
  }
};

// Auto-seed on load
document.addEventListener('DOMContentLoaded', () => {
  RentBoss.seedDemoData();
});
