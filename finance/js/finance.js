// ===== FINANCE CORE ENGINE =====
const FinanceApp = {
    // Encryption
    encrypt(data) {
        return btoa(JSON.stringify(data));
    },
    decrypt(data) {
        try { return JSON.parse(atob(data)); } catch { return null; }
    },
    
    // Auth
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'h_' + Math.abs(hash).toString(36) + '_' + password.length;
    },
    
    currentUser() {
        return this.decrypt(localStorage.getItem('fin_user'));
    },
    
    login(email, password) {
        const users = this.decrypt(localStorage.getItem('fin_users')) || {};
        const hashed = this.hashPassword(password);
        if (users[email] && users[email].password === hashed) {
            const user = { email, name: users[email].name, role: users[email].role, loginTime: Date.now() };
            localStorage.setItem('fin_user', this.encrypt(user));
            this.logAction('login', email);
            return user;
        }
        return null;
    },
    
    signup(email, password, name) {
        const users = this.decrypt(localStorage.getItem('fin_users')) || {};
        if (users[email]) return null;
        users[email] = { password: this.hashPassword(password), name, role: 'admin', created: Date.now() };
        localStorage.setItem('fin_users', this.encrypt(users));
        const user = { email, name, role: 'admin', loginTime: Date.now() };
        localStorage.setItem('fin_user', this.encrypt(user));
        this.logAction('signup', email);
        return user;
    },
    
    logout() {
        localStorage.removeItem('fin_user');
        window.location.href = 'index.html';
    },
    
    // Family Management
    inviteMember(email, name, role) {
        const invites = this.decrypt(localStorage.getItem('fin_invites')) || [];
        invites.push({ email, name, role, invitedBy: this.currentUser()?.email, date: Date.now(), status: 'pending' });
        localStorage.setItem('fin_invites', this.encrypt(invites));
        this.logAction('invite', email);
        return true;
    },
    
    getFamilyMembers() {
        const users = this.decrypt(localStorage.getItem('fin_users')) || {};
        return Object.entries(users).map(([email, u]) => ({ email, name: u.name, role: u.role }));
    },
    
    // Transactions
    addTransaction(tx) {
        const txs = this.decrypt(localStorage.getItem('fin_transactions')) || [];
        tx.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        tx.addedBy = this.currentUser()?.email;
        tx.date = tx.date || new Date().toISOString().split('T')[0];
        txs.push(tx);
        localStorage.setItem('fin_transactions', this.encrypt(txs));
        this.logAction('addTransaction', tx.description);
        return tx;
    },
    
    getTransactions(filters = {}) {
        let txs = this.decrypt(localStorage.getItem('fin_transactions')) || [];
        if (filters.type) txs = txs.filter(t => t.type === filters.type);
        if (filters.category) txs = txs.filter(t => t.category === filters.category);
        if (filters.account) txs = txs.filter(t => t.account === filters.account);
        if (filters.startDate) txs = txs.filter(t => t.date >= filters.startDate);
        if (filters.endDate) txs = txs.filter(t => t.date <= filters.endDate);
        if (filters.entity) txs = txs.filter(t => t.entity === filters.entity);
        return txs.sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    
    deleteTransaction(id) {
        let txs = this.decrypt(localStorage.getItem('fin_transactions')) || [];
        txs = txs.filter(t => t.id !== id);
        localStorage.setItem('fin_transactions', this.encrypt(txs));
    },
    
    // Categories
    categories: {
        income: ['Salary', 'Business Revenue', 'Investment', 'Rental', 'Freelance', 'Dividend', 'Other Income'],
        expense: ['Housing', 'Transportation', 'Food', 'Utilities', 'Healthcare', 'Entertainment', 'Shopping', 'Education', 'Insurance', 'Subscriptions', 'Travel', 'Personal Care', 'Charity', 'Other'],
        business: ['Office', 'Software', 'Hardware', 'Travel', 'Marketing', 'Contractors', 'Professional Services', 'Insurance', 'Telecommunications', 'Vehicle', 'Meals & Entertainment', 'Other Business']
    },
    
    // Tax Calculator (Canadian 2026)
    calculateTax(income, province = 'ON') {
        const federalBrackets = [
            { min: 0, max: 55867, rate: 0.15 },
            { min: 55867, max: 111733, rate: 0.205 },
            { min: 111733, max: 154906, rate: 0.26 },
            { min: 154906, max: 220000, rate: 0.29 },
            { min: 220000, max: Infinity, rate: 0.33 }
        ];
        const ontarioBrackets = [
            { min: 0, max: 51446, rate: 0.0505 },
            { min: 51446, max: 102894, rate: 0.0915 },
            { min: 102894, max: 150000, rate: 0.1116 },
            { min: 150000, max: 220000, rate: 0.1216 },
            { min: 220000, max: Infinity, rate: 0.1316 }
        ];
        
        let federalTax = 0, provincialTax = 0;
        const basicPersonal = 16129;
        
        federalBrackets.forEach(b => {
            if (income > b.min) {
                federalTax += (Math.min(income, b.max) - b.min) * b.rate;
            }
        });
        federalTax -= basicPersonal * 0.15;
        
        ontarioBrackets.forEach(b => {
            if (income > b.min) {
                provincialTax += (Math.min(income, b.max) - b.min) * b.rate;
            }
        });
        
        const cpp = Math.min(income * 0.0595, 3867.50);
        const ei = Math.min(income * 0.0164, 1002.45);
        
        return {
            federal: Math.max(0, federalTax),
            provincial: Math.max(0, provincialTax),
            cpp, ei,
            total: Math.max(0, federalTax) + Math.max(0, provincialTax) + cpp + ei,
            afterTax: income - (Math.max(0, federalTax) + Math.max(0, provincialTax) + cpp + ei),
            effectiveRate: income > 0 ? ((federalTax + provincialTax) / income * 100).toFixed(1) : 0
        };
    },
    
    // Budget
    setBudget(category, amount, period = 'monthly') {
        const budgets = this.decrypt(localStorage.getItem('fin_budgets')) || {};
        budgets[category] = { amount, period, set: Date.now() };
        localStorage.setItem('fin_budgets', this.encrypt(budgets));
    },
    
    getBudgets() {
        return this.decrypt(localStorage.getItem('fin_budgets')) || {};
    },
    
    getBudgetStatus(category) {
        const budget = this.getBudgets()[category];
        if (!budget) return null;
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const spent = this.getTransactions({ category, startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] })
            .filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return { budget: budget.amount, spent, remaining: budget.amount - spent, percent: (spent / budget.amount * 100).toFixed(0) };
    },
    
    // Audit Log
    logAction(action, detail) {
        const log = this.decrypt(localStorage.getItem('fin_audit')) || [];
        log.push({ action, detail, user: this.currentUser()?.email, time: Date.now() });
        if (log.length > 500) log.shift();
        localStorage.setItem('fin_audit', this.encrypt(log));
    },
    
    getAuditLog() {
        return this.decrypt(localStorage.getItem('fin_audit')) || [];
    },
    
    // GST/HST
    calculateGST(amount, rate = 0.13) {
        return { amount, gst: amount * rate, total: amount * (1 + rate) };
    },
    
    // Reports
    getMonthlyReport(year, month) {
        const start = `${year}-${String(month).padStart(2, '0')}-01`;
        const end = `${year}-${String(month).padStart(2, '0')}-31`;
        const txs = this.getTransactions({ startDate: start, endDate: end });
        const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const byCategory = {};
        txs.filter(t => t.type === 'expense').forEach(t => {
            byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
        });
        return { income, expenses, profit: income - expenses, savingsRate: income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0, byCategory, transactionCount: txs.length };
    },
    
    // Plaid placeholder
    connectBank() {
        alert('Plaid integration ready! Add your API key to enable bank connections.');
    }
};

// Auth guard
function requireAuth() {
    const user = FinanceApp.currentUser();
    if (!user) { window.location.href = 'index.html'; return null; }
    if (Date.now() - user.loginTime > 30 * 60 * 1000) {
        FinanceApp.logout();
        return null;
    }
    return user;
}

// UI Helpers
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }
function formatMoney(n) { return '$' + Number(n).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function formatDate(d) { return new Date(d).toLocaleDateString('en-CA'); }

// ===== ENTITY MANAGEMENT =====
FinanceApp.getEntities = function() {
    return this.decrypt(localStorage.getItem('fin_entities')) || {
        arfeen: { name: 'Arfeen Ahmad', type: 'personal', icon: '👤', created: Date.now() },
        wife: { name: 'Wife', type: 'personal', icon: '👩', created: Date.now() },
        agii: { name: 'Agii.ca', type: 'business', icon: '💼', created: Date.now() },
        property: { name: 'Property Management', type: 'business', icon: '🏠', created: Date.now() },
        consulting: { name: 'Consulting Business', type: 'business', icon: '📋', created: Date.now() }
    };
};

FinanceApp.saveEntities = function(entities) {
    localStorage.setItem('fin_entities', this.encrypt(entities));
};

FinanceApp.createEntity = function(name, type, icon) {
    const entities = this.getEntities();
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString(36);
    entities[id] = { name, type, icon: icon || (type === 'personal' ? '👤' : '🏢'), created: Date.now(), createdBy: this.currentUser()?.email };
    this.saveEntities(entities);
    this.logAction('createEntity', name + ' (' + type + ')');
    return id;
};

FinanceApp.deleteEntity = function(id) {
    const entities = this.getEntities();
    if (entities[id]) {
        this.logAction('deleteEntity', entities[id].name);
        delete entities[id];
        this.saveEntities(entities);
    }
};

// Investment tracking
FinanceApp.getInvestments = function() {
    return this.decrypt(localStorage.getItem('fin_investments')) || [];
};

FinanceApp.addInvestment = function(inv) {
    const invs = this.getInvestments();
    inv.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    inv.addedBy = this.currentUser()?.email;
    inv.date = inv.date || new Date().toISOString().split('T')[0];
    invs.push(inv);
    localStorage.setItem('fin_investments', this.encrypt(invs));
    this.logAction('addInvestment', inv.name + ' - $' + inv.amount);
    return inv;
};

FinanceApp.deleteInvestment = function(id) {
    let invs = this.getInvestments();
    invs = invs.filter(i => i.id !== id);
    localStorage.setItem('fin_investments', this.encrypt(invs));
};

// Format money
FinanceApp.formatMoney = function(n) {
    return '$' + Number(n).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
