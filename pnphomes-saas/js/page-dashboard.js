// page-dashboard.js — PNP Homes Portal
document.getElementById('nav-toggle').addEventListener('click', function () {
  document.getElementById('sidebar').classList.toggle('open');
});
document.getElementById('logout-btn').addEventListener('click', pnpLogout);

document.addEventListener('pnp:ready', async function () {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;

  try {
    const [properties, leases, maintenance, transactions, tenants] = await Promise.all([
      FS.getProperties(),
      FS.getActiveLeases(),
      FS.getMaintenance(),
      FS.getTransactions(),
      FS.getTenants()
    ]);

    // Build lookup maps
    const propMap   = Object.fromEntries(properties.map(p => [p.id, p]));
    const tenantMap = Object.fromEntries(tenants.map(t => [t.id, t]));

    // ── Stats ──
    const totalUnits    = properties.reduce((s, p) => s + (p.units || []).length, 0);
    const occupiedUnits = leases.length;
    const occRate       = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
    const openMaint     = maintenance.filter(m => m.status !== 'completed').length;

    document.getElementById('stat-props').textContent   = properties.length;
    document.getElementById('stat-units').textContent   = totalUnits + ' total units';
    document.getElementById('stat-occ').textContent     = occRate + '%';
    document.getElementById('stat-occ-sub').textContent = occupiedUnits + ' of ' + totalUnits + ' units';
    document.getElementById('stat-maint').textContent   = openMaint;

    // ── Monthly financials ──
    const monthTx = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month - 1;
    });
    const income   = FS.sumByType(monthTx, ['rent', 'income']);
    const expenses = FS.sumByType(monthTx, ['expense']);
    const profit   = income - expenses;

    document.getElementById('stat-rev').textContent    = FS.formatCurrency(income);
    document.getElementById('stat-month').textContent  = now.toLocaleString('en-CA', { month: 'long', year: 'numeric' });
    document.getElementById('sum-income').textContent  = FS.formatCurrency(income);
    document.getElementById('sum-expenses').textContent= FS.formatCurrency(expenses);
    document.getElementById('sum-profit').textContent  = FS.formatCurrency(profit);
    document.getElementById('sum-hst').textContent     = FS.formatCurrency(FS.calcHST(income));

    // ── Active Leases table ──
    const leasesTbody = document.getElementById('leases-tbody');
    if (leases.length === 0) {
      leasesTbody.innerHTML = '<tr><td colspan="4" class="text-muted text-small" style="text-align:center;padding:20px">No active leases</td></tr>';
    } else {
      leasesTbody.innerHTML = leases.slice(0, 6).map(l => {
        const tenant = tenantMap[l.tenantId] || {};
        const prop   = propMap[l.propertyId] || {};
        const days   = FS.daysUntil(l.endDate);
        const expiry = days < 60
          ? '<span class="badge badge-warning">' + FS.formatDate(l.endDate) + '</span>'
          : FS.formatDate(l.endDate);
        return '<tr>' +
          '<td>' + (tenant.firstName || '') + ' ' + (tenant.lastName || '') + '</td>' +
          '<td>' + (prop.name || '—') + '</td>' +
          '<td>' + FS.formatCurrency(l.rentAmount) + '</td>' +
          '<td>' + expiry + '</td>' +
        '</tr>';
      }).join('');
    }

    // ── Open Maintenance table ──
    const maintTbody = document.getElementById('maint-tbody');
    const openReqs   = maintenance.filter(m => m.status !== 'completed');
    if (openReqs.length === 0) {
      maintTbody.innerHTML = '<tr><td colspan="3" class="text-muted text-small" style="text-align:center;padding:20px">No open requests</td></tr>';
    } else {
      maintTbody.innerHTML = openReqs.slice(0, 6).map(m => {
        const priClass = 'priority-' + (m.priority || 'medium');
        const statusBadge = m.status === 'in_progress'
          ? '<span class="badge badge-info">In Progress</span>'
          : '<span class="badge badge-warning">Open</span>';
        return '<tr>' +
          '<td>' + (m.title || '—') + '</td>' +
          '<td class="' + priClass + '">' + (m.priority || '—') + '</td>' +
          '<td>' + statusBadge + '</td>' +
        '</tr>';
      }).join('');
    }
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
});
