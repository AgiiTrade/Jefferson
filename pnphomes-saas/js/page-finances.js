// page-finances.js — PNP Homes Portal
document.getElementById('nav-toggle').addEventListener('click', function () {
  document.getElementById('sidebar').classList.toggle('open');
});
document.getElementById('logout-btn').addEventListener('click', pnpLogout);

let allProperties = [];
let allTenants    = [];

const today = new Date().toISOString().split('T')[0];

function closePaymentModal()  { document.getElementById('payment-modal').classList.remove('open'); }
function closeExpenseModal()  { document.getElementById('expense-modal').classList.remove('open'); }

function propOptions(selectedId) {
  return '<option value="">— All properties —</option>' +
    allProperties.map(p => '<option value="' + p.id + '"' + (p.id === selectedId ? ' selected' : '') + '>' + p.name + '</option>').join('');
}

document.getElementById('btn-add-payment').addEventListener('click', function () {
  document.getElementById('pay-tenant').innerHTML   = '<option value="">— Select tenant —</option>' +
    allTenants.map(t => '<option value="' + t.id + '">' + t.firstName + ' ' + t.lastName + '</option>').join('');
  document.getElementById('pay-property').innerHTML = propOptions(null);
  document.getElementById('pay-date').value         = today;
  document.getElementById('pay-amount').value       = '';
  document.getElementById('pay-note').value         = '';
  document.getElementById('payment-error').classList.remove('visible');
  document.getElementById('payment-modal').classList.add('open');
});

document.getElementById('btn-add-expense').addEventListener('click', function () {
  document.getElementById('exp-property').innerHTML = propOptions(null);
  document.getElementById('exp-date').value         = today;
  document.getElementById('exp-amount').value       = '';
  document.getElementById('exp-desc').value         = '';
  document.getElementById('expense-error').classList.remove('visible');
  document.getElementById('expense-modal').classList.add('open');
});

document.getElementById('payment-modal-close').addEventListener('click', closePaymentModal);
document.getElementById('payment-cancel').addEventListener('click', closePaymentModal);
document.getElementById('payment-modal').addEventListener('click', function (e) { if (e.target === this) closePaymentModal(); });

document.getElementById('expense-modal-close').addEventListener('click', closeExpenseModal);
document.getElementById('expense-cancel').addEventListener('click', closeExpenseModal);
document.getElementById('expense-modal').addEventListener('click', function (e) { if (e.target === this) closeExpenseModal(); });

// Auto-fill rent amount when tenant selected
document.getElementById('pay-tenant').addEventListener('change', async function () {
  const tenantId = this.value;
  if (!tenantId) return;
  try {
    const leases = await FS.getLeases();
    const lease  = leases.find(l => l.tenantId === tenantId && l.status === 'active');
    if (lease) {
      document.getElementById('pay-amount').value   = lease.rentAmount || '';
      document.getElementById('pay-property').value = lease.propertyId || '';
    }
  } catch (_) {}
});

document.getElementById('payment-save').addEventListener('click', async function () {
  const errEl = document.getElementById('payment-error');
  errEl.classList.remove('visible');
  const tenantId = document.getElementById('pay-tenant').value;
  const amount   = Number(document.getElementById('pay-amount').value);
  const date     = document.getElementById('pay-date').value;
  if (!tenantId || !amount || !date) { errEl.textContent = 'Tenant, amount, and date are required.'; errEl.classList.add('visible'); return; }

  this.disabled    = true;
  this.textContent = 'Saving…';
  try {
    const tenant = allTenants.find(t => t.id === tenantId) || {};
    await FS.saveTransaction({
      type:       'rent',
      tenantId,
      propertyId: document.getElementById('pay-property').value || tenant.propertyId || '',
      amount,
      date,
      method:     document.getElementById('pay-method').value,
      note:       document.getElementById('pay-note').value.trim()
    });
    closePaymentModal();
    loadFinances();
  } catch (err) {
    errEl.textContent = 'Save failed: ' + err.message;
    errEl.classList.add('visible');
  }
  this.disabled    = false;
  this.textContent = 'Record Payment';
});

document.getElementById('expense-save').addEventListener('click', async function () {
  const errEl = document.getElementById('expense-error');
  errEl.classList.remove('visible');
  const amount = Number(document.getElementById('exp-amount').value);
  const date   = document.getElementById('exp-date').value;
  if (!amount || !date) { errEl.textContent = 'Amount and date are required.'; errEl.classList.add('visible'); return; }

  this.disabled    = true;
  this.textContent = 'Saving…';
  try {
    await FS.saveTransaction({
      type:        'expense',
      propertyId:  document.getElementById('exp-property').value || '',
      category:    document.getElementById('exp-category').value,
      description: document.getElementById('exp-desc').value.trim(),
      amount,
      date
    });
    closeExpenseModal();
    loadFinances();
  } catch (err) {
    errEl.textContent = 'Save failed: ' + err.message;
    errEl.classList.add('visible');
  }
  this.disabled    = false;
  this.textContent = 'Add Expense';
});

async function loadFinances() {
  try {
    const now   = new Date();
    const year  = now.getFullYear();
    const month = now.getMonth() + 1;

    const [transactions, tenants, properties] = await Promise.all([
      FS.getTransactions(),
      FS.getTenants(),
      FS.getProperties()
    ]);

    allTenants    = tenants;
    allProperties = properties;
    const tenantMap = Object.fromEntries(tenants.map(t => [t.id, t]));
    const propMap   = Object.fromEntries(properties.map(p => [p.id, p]));

    const monthTx = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month - 1;
    });

    const revenue  = FS.sumByType(monthTx, ['rent', 'income']);
    const expenses = FS.sumByType(monthTx, ['expense']);

    document.getElementById('fin-revenue').textContent  = FS.formatCurrency(revenue);
    document.getElementById('fin-expenses').textContent = FS.formatCurrency(expenses);
    document.getElementById('fin-profit').textContent   = FS.formatCurrency(revenue - expenses);
    document.getElementById('fin-hst').textContent      = FS.formatCurrency(FS.calcHST(revenue));

    // Payments table
    const payments = transactions.filter(t => t.type === 'rent' || t.type === 'income');
    const payTbody = document.getElementById('payments-tbody');
    payTbody.innerHTML = payments.length === 0
      ? '<tr><td colspan="5" style="text-align:center;padding:20px" class="text-muted">No payments recorded</td></tr>'
      : payments.slice(0, 20).map(t => {
          const tenant = tenantMap[t.tenantId] || {};
          return '<tr>' +
            '<td>' + FS.formatDate(t.date) + '</td>' +
            '<td>' + (tenant.firstName ? tenant.firstName + ' ' + tenant.lastName : '—') + '</td>' +
            '<td class="text-success">' + FS.formatCurrency(t.amount) + '</td>' +
            '<td>' + (t.method || '—') + '</td>' +
            '<td><button class="btn btn-danger btn-sm" data-del-tx="' + t.id + '">✕</button></td></tr>';
        }).join('');

    // Expenses table
    const expList   = transactions.filter(t => t.type === 'expense');
    const expTbody  = document.getElementById('expenses-tbody');
    expTbody.innerHTML = expList.length === 0
      ? '<tr><td colspan="5" style="text-align:center;padding:20px" class="text-muted">No expenses recorded</td></tr>'
      : expList.slice(0, 20).map(t =>
          '<tr>' +
          '<td>' + FS.formatDate(t.date) + '</td>' +
          '<td><span class="badge badge-neutral" style="text-transform:capitalize">' + (t.category || '—') + '</span></td>' +
          '<td>' + (t.description || '—') + '</td>' +
          '<td class="text-danger">' + FS.formatCurrency(t.amount) + '</td>' +
          '<td><button class="btn btn-danger btn-sm" data-del-tx="' + t.id + '">✕</button></td></tr>'
        ).join('');

    // P&L by property
    const plTbody = document.getElementById('pl-tbody');
    if (properties.length === 0) {
      plTbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px" class="text-muted">No properties</td></tr>';
    } else {
      plTbody.innerHTML = properties.map(p => {
        const propTx  = monthTx.filter(t => t.propertyId === p.id);
        const rev     = FS.sumByType(propTx, ['rent', 'income']);
        const exp     = FS.sumByType(propTx, ['expense']);
        const net     = rev - exp;
        const margin  = rev > 0 ? Math.round((net / rev) * 100) : 0;
        return '<tr>' +
          '<td><strong>' + p.name + '</strong></td>' +
          '<td class="text-success">' + FS.formatCurrency(rev) + '</td>' +
          '<td class="text-danger">'  + FS.formatCurrency(exp) + '</td>' +
          '<td class="' + (net >= 0 ? 'text-success' : 'text-danger') + '"><strong>' + FS.formatCurrency(net) + '</strong></td>' +
          '<td>' + margin + '%</td></tr>';
      }).join('');
    }

    // Delete handlers
    document.querySelectorAll('[data-del-tx]').forEach(btn => {
      btn.addEventListener('click', async function () {
        if (!confirm('Delete this transaction?')) return;
        try { await FS.deleteTransaction(this.dataset.delTx); loadFinances(); }
        catch (err) { alert('Delete failed: ' + err.message); }
      });
    });

  } catch (err) {
    console.error('Finance load error:', err);
  }
}

document.addEventListener('pnp:ready', loadFinances);
