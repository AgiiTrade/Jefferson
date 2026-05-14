// ===== FIRESTORE DATA STORE — PNP Homes Portal =====
// All reads/writes require Firebase Auth. Every query filters by userId.
// No localStorage, no base64, no client-side "encryption".

const FS = {

  _uid() {
    const u = auth.currentUser;
    if (!u) throw new Error('Not authenticated');
    return u.uid;
  },

  _ts() { return firebase.firestore.FieldValue.serverTimestamp(); },

  // ── Formatting ──
  formatCurrency(n) {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n || 0);
  },
  formatDate(d) {
    if (!d) return '—';
    const date = (d && typeof d.toDate === 'function') ? d.toDate() : new Date(d);
    return date.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
  },
  daysUntil(dateStr) {
    return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  },

  // ── Properties ──
  _sortByCreatedDesc(rows) {
    return rows.sort((a, b) => {
      const av = (a.createdAt && a.createdAt.toMillis) ? a.createdAt.toMillis() : 0;
      const bv = (b.createdAt && b.createdAt.toMillis) ? b.createdAt.toMillis() : 0;
      return bv - av;
    });
  },

  async getProperties() {
    const snap = await db.collection('properties')
      .where('userId', '==', this._uid())
      .get();
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return this._sortByCreatedDesc(rows);
  },

  async saveProperty(prop) {
    const uid = this._uid();
    const data = { ...prop, userId: uid, updatedAt: this._ts() };
    if (data.id) {
      const id = data.id; delete data.id;
      await db.collection('properties').doc(id).update(data);
      return { id, ...data };
    }
    data.createdAt = this._ts();
    const ref = await db.collection('properties').add(data);
    return { id: ref.id, ...data };
  },

  async deleteProperty(id) {
    const uid = this._uid();
    const doc = await db.collection('properties').doc(id).get();
    if (!doc.exists || doc.data().userId !== uid) throw new Error('Forbidden');
    const batch = db.batch();
    batch.delete(db.collection('properties').doc(id));
    for (const col of ['tenants', 'leases', 'transactions', 'maintenance']) {
      const snap = await db.collection(col)
        .where('userId', '==', uid)
        .get();
      snap.docs
        .filter(d => d.data().propertyId === id)
        .forEach(d => batch.delete(d.ref));
    }
    await batch.commit();
  },

  // ── Tenants ──
  async getTenants(propertyId) {
    const snap = await db.collection('tenants')
      .where('userId', '==', this._uid())
      .get();
    let rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (propertyId) rows = rows.filter(r => r.propertyId === propertyId);
    return this._sortByCreatedDesc(rows);
  },

  async saveTenant(tenant) {
    const uid = this._uid();
    const data = { ...tenant, userId: uid, updatedAt: this._ts() };
    if (data.id) {
      const id = data.id; delete data.id;
      await db.collection('tenants').doc(id).update(data);
      return { id, ...data };
    }
    data.createdAt = this._ts();
    const ref = await db.collection('tenants').add(data);
    return { id: ref.id, ...data };
  },

  async deleteTenant(id) {
    const uid = this._uid();
    const doc = await db.collection('tenants').doc(id).get();
    if (!doc.exists || doc.data().userId !== uid) throw new Error('Forbidden');
    await db.collection('tenants').doc(id).delete();
  },

  // ── Leases ──
  async getLeases(propertyId) {
    const snap = await db.collection('leases')
      .where('userId', '==', this._uid())
      .get();
    let rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (propertyId) rows = rows.filter(r => r.propertyId === propertyId);
    return rows.sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
  },

  async getActiveLeases() {
    const today = new Date().toISOString().split('T')[0];
    const snap = await db.collection('leases')
      .where('userId', '==', this._uid())
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(l => l.status === 'active' && l.endDate >= today);
  },

  async saveLease(lease) {
    const uid = this._uid();
    const data = { ...lease, userId: uid, updatedAt: this._ts() };
    if (data.id) {
      const id = data.id; delete data.id;
      await db.collection('leases').doc(id).update(data);
      return { id, ...data };
    }
    data.createdAt = this._ts();
    const ref = await db.collection('leases').add(data);
    return { id: ref.id, ...data };
  },

  async deleteLease(id) {
    const uid = this._uid();
    const doc = await db.collection('leases').doc(id).get();
    if (!doc.exists || doc.data().userId !== uid) throw new Error('Forbidden');
    await db.collection('leases').doc(id).delete();
  },

  // ── Transactions (rent payments + expenses) ──
  async getTransactions(filters) {
    filters = filters || {};
    const snap = await db.collection('transactions')
      .where('userId', '==', this._uid())
      .get();
    let rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (filters.propertyId) rows = rows.filter(r => r.propertyId === filters.propertyId);
    if (filters.type)       rows = rows.filter(r => r.type === filters.type);
    return rows.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  },

  async saveTransaction(tx) {
    const uid = this._uid();
    const data = { ...tx, userId: uid, createdAt: this._ts() };
    if (data.id) {
      const id = data.id; delete data.id;
      await db.collection('transactions').doc(id).update(data);
      return { id, ...data };
    }
    const ref = await db.collection('transactions').add(data);
    return { id: ref.id, ...data };
  },

  async deleteTransaction(id) {
    const uid = this._uid();
    const doc = await db.collection('transactions').doc(id).get();
    if (!doc.exists || doc.data().userId !== uid) throw new Error('Forbidden');
    await db.collection('transactions').doc(id).delete();
  },

  // ── Maintenance ──
  async getMaintenance(propertyId) {
    const snap = await db.collection('maintenance')
      .where('userId', '==', this._uid())
      .get();
    let rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (propertyId) rows = rows.filter(r => r.propertyId === propertyId);
    return this._sortByCreatedDesc(rows);
  },

  async saveMaintenance(req) {
    const uid = this._uid();
    const data = { ...req, userId: uid, updatedAt: this._ts() };
    if (!data.status) data.status = 'open';
    if (data.id) {
      const id = data.id; delete data.id;
      await db.collection('maintenance').doc(id).update(data);
      return { id, ...data };
    }
    data.createdAt = this._ts();
    const ref = await db.collection('maintenance').add(data);
    return { id: ref.id, ...data };
  },

  async deleteMaintenance(id) {
    const uid = this._uid();
    const doc = await db.collection('maintenance').doc(id).get();
    if (!doc.exists || doc.data().userId !== uid) throw new Error('Forbidden');
    await db.collection('maintenance').doc(id).delete();
  },

  // ── User Profile ──
  async saveUserProfile(data) {
    const uid = this._uid();
    await db.collection('users').doc(uid).set(
      { ...data, uid, updatedAt: this._ts() },
      { merge: true }
    );
  },

  async getUserProfile() {
    const uid = this._uid();
    const doc = await db.collection('users').doc(uid).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  // ── Financial helpers ──
  sumByType(transactions, types) {
    return transactions
      .filter(t => types.includes(t.type))
      .reduce((s, t) => s + (Number(t.amount) || 0), 0);
  },

  calcHST(amount) {
    return Math.round(amount * 0.13 * 100) / 100;
  },

  // ── Backup export ──
  async exportData() {
    const [properties, tenants, leases, transactions, maintenance] = await Promise.all([
      this.getProperties(),
      this.getTenants(),
      this.getLeases(),
      this.getTransactions(),
      this.getMaintenance()
    ]);
    const blob = new Blob(
      [JSON.stringify({ properties, tenants, leases, transactions, maintenance, exportedAt: new Date().toISOString() }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: `pnphomes-backup-${new Date().toISOString().split('T')[0]}.json`
    });
    a.click();
    URL.revokeObjectURL(url);
  }
};
