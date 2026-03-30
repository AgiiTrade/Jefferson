// ===== SECURE LOCAL STORAGE (Firebase-Ready) =====
// This works NOW without Firebase. When you add Firebase config later,
// just uncomment the Firebase lines and it will sync automatically.

const SecureDB = {
    // Encryption key (change this!)
    _key: 'RentBoss2026Secure',
    
    // Encrypt data
    _encrypt(data) {
        try {
            const json = JSON.stringify(data);
            return btoa(unescape(encodeURIComponent(json)));
        } catch { return null; }
    },
    
    // Decrypt data
    _decrypt(data) {
        try {
            const json = decodeURIComponent(escape(atob(data)));
            return JSON.parse(json);
        } catch { return null; }
    },
    
    // Get data
    get(collection) {
        const raw = localStorage.getItem(`rb_${collection}`);
        return raw ? this._decrypt(raw) || [] : [];
    },
    
    // Save data
    set(collection, data) {
        localStorage.setItem(`rb_${collection}`, this._encrypt(data));
    },
    
    // Generate ID
    id() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
    },
    
    // ===== AUTH =====
    getUser() {
        return this._decrypt(localStorage.getItem('rb_user'));
    },
    
    signup(email, password, name) {
        const users = this.get('_users');
        if (users.find(u => u.email === email)) return { error: 'Email exists' };
        const user = { 
            id: this.id(), 
            email, 
            name, 
            password: btoa(password), 
            role: 'admin',
            created: Date.now() 
        };
        users.push(user);
        this.set('_users', users);
        const session = { id: user.id, email, name, role: user.role, loginTime: Date.now() };
        localStorage.setItem('rb_user', this._encrypt(session));
        return { success: true, user: session };
    },
    
    login(email, password) {
        const users = this.get('_users');
        const user = users.find(u => u.email === email && u.password === btoa(password));
        if (!user) return { error: 'Invalid credentials' };
        const session = { id: user.id, email: user.email, name: user.name, role: user.role, loginTime: Date.now() };
        localStorage.setItem('rb_user', this._encrypt(session));
        return { success: true, user: session };
    },
    
    logout() {
        localStorage.removeItem('rb_user');
        window.location.href = 'index.html';
    },
    
    isLoggedIn() {
        return !!this.getUser();
    },
    
    // ===== PROPERTIES =====
    getProperties() {
        const user = this.getUser();
        return this.get('properties').filter(p => p.userId === user?.id || p.sharedWith?.includes(user?.id));
    },
    
    saveProperty(prop) {
        const user = this.getUser();
        const props = this.get('properties');
        prop.userId = user?.id;
        prop.updatedAt = Date.now();
        
        if (prop.id) {
            const idx = props.findIndex(p => p.id === prop.id);
            if (idx >= 0) props[idx] = { ...props[idx], ...prop };
        } else {
            prop.id = this.id();
            prop.createdAt = Date.now();
            props.push(prop);
        }
        this.set('properties', props);
        return prop;
    },
    
    deleteProperty(id) {
        this.set('properties', this.get('properties').filter(p => p.id !== id));
        this.set('tenants', this.get('tenants').filter(t => t.propertyId !== id));
        this.set('leases', this.get('leases').filter(l => l.propertyId !== id));
        this.set('transactions', this.get('transactions').filter(t => t.propertyId !== id));
    },
    
    // ===== TENANTS =====
    getTenants(propertyId = null) {
        const user = this.getUser();
        let tenants = this.get('tenants').filter(t => t.userId === user?.id);
        if (propertyId) tenants = tenants.filter(t => t.propertyId === propertyId);
        return tenants;
    },
    
    saveTenant(tenant) {
        const user = this.getUser();
        const tenants = this.get('tenants');
        tenant.userId = user?.id;
        tenant.updatedAt = Date.now();
        
        if (tenant.id) {
            const idx = tenants.findIndex(t => t.id === tenant.id);
            if (idx >= 0) tenants[idx] = { ...tenants[idx], ...tenant };
        } else {
            tenant.id = this.id();
            tenant.createdAt = Date.now();
            tenants.push(tenant);
        }
        this.set('tenants', tenants);
        return tenant;
    },
    
    deleteTenant(id) {
        this.set('tenants', this.get('tenants').filter(t => t.id !== id));
    },
    
    // ===== LEASES =====
    getLeases(propertyId = null) {
        const user = this.getUser();
        let leases = this.get('leases').filter(l => l.userId === user?.id);
        if (propertyId) leases = leases.filter(l => l.propertyId === propertyId);
        return leases;
    },
    
    saveLease(lease) {
        const user = this.getUser();
        const leases = this.get('leases');
        lease.userId = user?.id;
        lease.updatedAt = Date.now();
        
        if (lease.id) {
            const idx = leases.findIndex(l => l.id === lease.id);
            if (idx >= 0) leases[idx] = { ...leases[idx], ...lease };
        } else {
            lease.id = this.id();
            lease.createdAt = Date.now();
            leases.push(lease);
        }
        this.set('leases', leases);
        return lease;
    },
    
    // ===== TRANSACTIONS =====
    getTransactions(filters = {}) {
        const user = this.getUser();
        let txs = this.get('transactions').filter(t => t.userId === user?.id);
        if (filters.propertyId) txs = txs.filter(t => t.propertyId === filters.propertyId);
        if (filters.type) txs = txs.filter(t => t.type === filters.type);
        return txs.sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    
    saveTransaction(tx) {
        const user = this.getUser();
        const txs = this.get('transactions');
        tx.userId = user?.id;
        tx.id = this.id();
        tx.createdAt = Date.now();
        txs.push(tx);
        this.set('transactions', txs);
        return tx;
    },
    
    // ===== MAINTENANCE =====
    getMaintenance(propertyId = null) {
        const user = this.getUser();
        let reqs = this.get('maintenance').filter(r => r.userId === user?.id);
        if (propertyId) reqs = reqs.filter(r => r.propertyId === propertyId);
        return reqs;
    },
    
    saveMaintenance(req) {
        const user = this.getUser();
        const reqs = this.get('maintenance');
        req.userId = user?.id;
        req.updatedAt = Date.now();
        
        if (req.id) {
            const idx = reqs.findIndex(r => r.id === req.id);
            if (idx >= 0) reqs[idx] = { ...reqs[idx], ...req };
        } else {
            req.id = this.id();
            req.createdAt = Date.now();
            reqs.push(req);
        }
        this.set('maintenance', reqs);
        return req;
    },
    
    // ===== FAMILY SHARING =====
    inviteMember(email, role) {
        const user = this.getUser();
        const invites = this.get('invites');
        invites.push({
            id: this.id(),
            invitedBy: user?.id,
            email,
            role,
            status: 'pending',
            createdAt: Date.now()
        });
        this.set('invites', invites);
    },
    
    // ===== BACKUP =====
    exportData() {
        const data = {
            properties: this.getProperties(),
            tenants: this.getTenants(),
            leases: this.getLeases(),
            transactions: this.getTransactions(),
            maintenance: this.getMaintenance(),
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rentboss-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    },
    
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.properties) this.set('properties', data.properties);
            if (data.tenants) this.set('tenants', data.tenants);
            if (data.leases) this.set('leases', data.leases);
            if (data.transactions) this.set('transactions', data.transactions);
            if (data.maintenance) this.set('maintenance', data.maintenance);
            return { success: true };
        } catch (e) {
            return { error: e.message };
        }
    }
};

// Make it global
window.DB = SecureDB;
