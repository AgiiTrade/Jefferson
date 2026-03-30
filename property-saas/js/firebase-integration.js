// ===== FIREBASE INTEGRATION FOR RENTBOSS =====
// Replace these with your actual Firebase config
const FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase (add this to your HTML before other scripts):
// <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js"></script>

const FirebaseDB = {
    db: null,
    auth: null,
    currentUser: null,

    // Initialize
    init() {
        if (typeof firebase === 'undefined') {
            console.error('Firebase not loaded. Add Firebase SDK scripts.');
            return false;
        }
        firebase.initializeApp(FIREBASE_CONFIG);
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        
        // Listen for auth state
        this.auth.onAuthStateChanged(user => {
            this.currentUser = user;
            if (user) {
                console.log('Logged in:', user.email);
                localStorage.setItem('rentboss_user', JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName
                }));
            }
        });
        return true;
    },

    // ===== AUTH =====
    async signup(email, password, name) {
        try {
            const cred = await this.auth.createUserWithEmailAndPassword(email, password);
            await cred.user.updateProfile({ displayName: name });
            return { success: true, user: cred.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async login(email, password) {
        try {
            const cred = await this.auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: cred.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async logout() {
        await this.auth.signOut();
        localStorage.removeItem('rentboss_user');
        window.location.href = 'index.html';
    },

    getUser() {
        return this.currentUser || JSON.parse(localStorage.getItem('rentboss_user'));
    },

    isLoggedIn() {
        return !!this.currentUser || !!localStorage.getItem('rentboss_user');
    },

    // ===== PROPERTIES =====
    async getProperties() {
        if (!this.db) return [];
        const uid = this.currentUser?.uid;
        const snapshot = await this.db.collection('properties')
            .where('userId', '==', uid)
            .orderBy('createdAt', 'desc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async saveProperty(property) {
        if (!this.db) return null;
        const uid = this.currentUser?.uid;
        property.userId = uid;
        property.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        
        if (property.id) {
            await this.db.collection('properties').doc(property.id).update(property);
            return property;
        } else {
            property.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const doc = await this.db.collection('properties').add(property);
            return { ...property, id: doc.id };
        }
    },

    async deleteProperty(id) {
        if (!this.db) return;
        await this.db.collection('properties').doc(id).delete();
        // Cascade delete related data
        const tenants = await this.db.collection('tenants').where('propertyId', '==', id).get();
        tenants.forEach(doc => doc.ref.delete());
    },

    // ===== TENANTS =====
    async getTenants(propertyId = null) {
        if (!this.db) return [];
        const uid = this.currentUser?.uid;
        let query = this.db.collection('tenants').where('userId', '==', uid);
        if (propertyId) query = query.where('propertyId', '==', propertyId);
        const snapshot = await query.orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async saveTenant(tenant) {
        if (!this.db) return null;
        const uid = this.currentUser?.uid;
        tenant.userId = uid;
        tenant.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        
        if (tenant.id) {
            await this.db.collection('tenants').doc(tenant.id).update(tenant);
            return tenant;
        } else {
            tenant.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const doc = await this.db.collection('tenants').add(tenant);
            return { ...tenant, id: doc.id };
        }
    },

    async deleteTenant(id) {
        if (!this.db) return;
        await this.db.collection('tenants').doc(id).delete();
    },

    // ===== LEASES =====
    async getLeases(propertyId = null) {
        if (!this.db) return [];
        const uid = this.currentUser?.uid;
        let query = this.db.collection('leases').where('userId', '==', uid);
        if (propertyId) query = query.where('propertyId', '==', propertyId);
        const snapshot = await query.orderBy('startDate', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async saveLease(lease) {
        if (!this.db) return null;
        const uid = this.currentUser?.uid;
        lease.userId = uid;
        lease.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        
        if (lease.id) {
            await this.db.collection('leases').doc(lease.id).update(lease);
            return lease;
        } else {
            lease.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const doc = await this.db.collection('leases').add(lease);
            return { ...lease, id: doc.id };
        }
    },

    // ===== TRANSACTIONS =====
    async getTransactions(filters = {}) {
        if (!this.db) return [];
        const uid = this.currentUser?.uid;
        let query = this.db.collection('transactions').where('userId', '==', uid);
        if (filters.propertyId) query = query.where('propertyId', '==', filters.propertyId);
        if (filters.type) query = query.where('type', '==', filters.type);
        const snapshot = await query.orderBy('date', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async saveTransaction(tx) {
        if (!this.db) return null;
        const uid = this.currentUser?.uid;
        tx.userId = uid;
        tx.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        const doc = await this.db.collection('transactions').add(tx);
        return { ...tx, id: doc.id };
    },

    // ===== MAINTENANCE =====
    async getMaintenanceRequests(propertyId = null) {
        if (!this.db) return [];
        const uid = this.currentUser?.uid;
        let query = this.db.collection('maintenance').where('userId', '==', uid);
        if (propertyId) query = query.where('propertyId', '==', propertyId);
        const snapshot = await query.orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async saveMaintenance(request) {
        if (!this.db) return null;
        const uid = this.currentUser?.uid;
        request.userId = uid;
        request.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        
        if (request.id) {
            await this.db.collection('maintenance').doc(request.id).update(request);
            return request;
        } else {
            request.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const doc = await this.db.collection('maintenance').add(request);
            return { ...request, id: doc.id };
        }
    },

    // ===== FAMILY SHARING =====
    async inviteMember(email, role) {
        if (!this.db) return;
        const uid = this.currentUser?.uid;
        await this.db.collection('invites').add({
            invitedBy: uid,
            email: email,
            role: role,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    },

    async getFamilyMembers() {
        if (!this.db) return [];
        const uid = this.currentUser?.uid;
        const snapshot = await this.db.collection('invites')
            .where('invitedBy', '==', uid)
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // ===== BACKUP =====
    async exportData() {
        const data = {
            properties: await this.getProperties(),
            tenants: await this.getTenants(),
            leases: await this.getLeases(),
            transactions: await this.getTransactions(),
            maintenance: await this.getMaintenanceRequests(),
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rentboss-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    }
};

// Auto-initialize when script loads
if (typeof firebase !== 'undefined') {
    FirebaseDB.init();
}
