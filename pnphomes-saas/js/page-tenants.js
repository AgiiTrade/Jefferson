// page-tenants.js — PNP Homes Portal
document.getElementById('nav-toggle').addEventListener('click', function () {
  document.getElementById('sidebar').classList.toggle('open');
});
document.getElementById('logout-btn').addEventListener('click', pnpLogout);

let allProperties = [];
let editingTenantId = null;
let existingLeaseId = null;

function closeModal() { document.getElementById('tenant-modal').classList.remove('open'); }

function populatePropertyDropdown(selectedPropId) {
  const sel = document.getElementById('tenant-property');
  sel.innerHTML = '<option value="">— Select property —</option>' +
    allProperties.map(p => '<option value="' + p.id + '"' + (p.id === selectedPropId ? ' selected' : '') + '>' + p.name + '</option>').join('');
  populateUnitDropdown(selectedPropId, null);
}

function populateUnitDropdown(propId, selectedUnitId) {
  const sel  = document.getElementById('tenant-unit');
  const prop = allProperties.find(p => p.id === propId);
  const units = prop ? (prop.units || []) : [];
  sel.innerHTML = '<option value="">— Select unit —</option>' +
    units.map(u => '<option value="' + u.id + '"' + (u.id === selectedUnitId ? ' selected' : '') + '>' + u.name + ' (' + FS.formatCurrency(u.rent) + '/mo)</option>').join('');
  if (units.length === 0) sel.innerHTML = '<option value="">No units on property</option>';
}

document.getElementById('tenant-property').addEventListener('change', function () {
  populateUnitDropdown(this.value, null);
  const prop = allProperties.find(p => p.id === this.value);
  const unit = prop && prop.units && prop.units[0];
  if (unit) document.getElementById('lease-rent').value = unit.rent || '';
});

document.getElementById('tenant-unit').addEventListener('change', function () {
  const propId = document.getElementById('tenant-property').value;
  const prop = allProperties.find(p => p.id === propId);
  const unit = prop && prop.units && prop.units.find(u => u.id === this.value);
  if (unit) document.getElementById('lease-rent').value = unit.rent || '';
});

async function openModal(tenant, leases) {
  editingTenantId = tenant ? tenant.id : null;
  existingLeaseId = null;

  document.getElementById('tenant-modal-title').textContent = tenant ? 'Edit Tenant' : 'Add Tenant';
  document.getElementById('tenant-id').value      = tenant ? tenant.id : '';
  document.getElementById('tenant-first').value   = tenant ? tenant.firstName : '';
  document.getElementById('tenant-last').value    = tenant ? tenant.lastName  : '';
  document.getElementById('tenant-email').value   = tenant ? (tenant.email || '') : '';
  document.getElementById('tenant-phone').value   = tenant ? (tenant.phone || '') : '';
  document.getElementById('tenant-error').classList.remove('visible');

  populatePropertyDropdown(tenant ? tenant.propertyId : null);
  if (tenant && tenant.propertyId) {
    populateUnitDropdown(tenant.propertyId, tenant.unitId);
  }

  // Pre-fill lease if exists
  if (tenant && leases) {
    const lease = leases.find(l => l.tenantId === tenant.id && l.status === 'active');
    if (lease) {
      existingLeaseId = lease.id;
      document.getElementById('lease-start').value = lease.startDate || '';
      document.getElementById('lease-end').value   = lease.endDate   || '';
      document.getElementById('lease-rent').value  = lease.rentAmount || '';
    }
  }

  document.getElementById('tenant-modal').classList.add('open');
}

document.getElementById('btn-add-tenant').addEventListener('click', () => openModal(null, null));
document.getElementById('tenant-modal-close').addEventListener('click', closeModal);
document.getElementById('tenant-cancel').addEventListener('click', closeModal);
document.getElementById('tenant-modal').addEventListener('click', function (e) { if (e.target === this) closeModal(); });

document.getElementById('tenant-save').addEventListener('click', async function () {
  const errEl = document.getElementById('tenant-error');
  errEl.classList.remove('visible');
  const first = document.getElementById('tenant-first').value.trim();
  const last  = document.getElementById('tenant-last').value.trim();
  if (!first || !last) { errEl.textContent = 'First and last name are required.'; errEl.classList.add('visible'); return; }

  this.disabled    = true;
  this.textContent = 'Saving…';
  try {
    const propId  = document.getElementById('tenant-property').value;
    const unitId  = document.getElementById('tenant-unit').value;
    const tenant  = {
      id:          editingTenantId || undefined,
      firstName:   first,
      lastName:    last,
      email:       document.getElementById('tenant-email').value.trim(),
      phone:       document.getElementById('tenant-phone').value.trim(),
      propertyId:  propId,
      unitId:      unitId
    };
    if (!editingTenantId) delete tenant.id;

    const saved = await FS.saveTenant(tenant);

    const leaseStart = document.getElementById('lease-start').value;
    const leaseEnd   = document.getElementById('lease-end').value;
    const leaseRent  = Number(document.getElementById('lease-rent').value);
    if (leaseStart && leaseEnd && leaseRent) {
      await FS.saveLease({
        id:          existingLeaseId || undefined,
        tenantId:    saved.id,
        propertyId:  propId,
        unitId:      unitId,
        startDate:   leaseStart,
        endDate:     leaseEnd,
        rentAmount:  leaseRent,
        status:      'active'
      });
    }

    closeModal();
    loadTenants();
  } catch (err) {
    errEl.textContent = 'Save failed: ' + err.message;
    errEl.classList.add('visible');
  }
  this.disabled    = false;
  this.textContent = 'Save Tenant';
});

async function loadTenants() {
  const tbody = document.getElementById('tenants-tbody');
  try {
    const [tenants, leases] = await Promise.all([FS.getTenants(), FS.getLeases()]);
    allProperties = await FS.getProperties();
    const propMap  = Object.fromEntries(allProperties.map(p => [p.id, p]));

    document.getElementById('tenant-count').textContent = tenants.length + ' tenant' + (tenants.length !== 1 ? 's' : '');

    if (tenants.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-muted text-small" style="text-align:center;padding:24px">No tenants yet. Click "Add Tenant" to get started.</td></tr>';
      return;
    }

    tbody.innerHTML = tenants.map(t => {
      const prop  = propMap[t.propertyId] || {};
      const unit  = (prop.units || []).find(u => u.id === t.unitId) || {};
      const lease = leases.find(l => l.tenantId === t.id && l.status === 'active');
      const leaseEndHtml = lease
        ? (FS.daysUntil(lease.endDate) < 60
            ? '<span class="badge badge-warning">' + FS.formatDate(lease.endDate) + '</span>'
            : FS.formatDate(lease.endDate))
        : '<span class="badge badge-neutral">No lease</span>';
      return '<tr>' +
        '<td><strong>' + t.firstName + ' ' + t.lastName + '</strong></td>' +
        '<td><div>' + (t.email || '—') + '</div><div class="text-muted text-small">' + (t.phone || '') + '</div></td>' +
        '<td>' + (prop.name || '—') + '<br><span class="text-muted text-small">' + (unit.name || '—') + '</span></td>' +
        '<td>' + leaseEndHtml + '</td>' +
        '<td>' + (lease ? FS.formatCurrency(lease.rentAmount) + '/mo' : '—') + '</td>' +
        '<td class="gap-2">' +
        '<button class="btn btn-outline btn-sm" data-edit="' + t.id + '">Edit</button>' +
        '<button class="btn btn-danger btn-sm" data-delete="' + t.id + '">Remove</button>' +
        '</td></tr>';
    }).join('');

    tbody.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', function () {
        const t = tenants.find(x => x.id === this.dataset.edit);
        if (t) openModal(t, leases);
      });
    });
    tbody.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', async function () {
        const t = tenants.find(x => x.id === this.dataset.delete);
        if (!t) return;
        if (!confirm('Remove ' + t.firstName + ' ' + t.lastName + ' and their records?')) return;
        try { await FS.deleteTenant(this.dataset.delete); loadTenants(); }
        catch (err) { alert('Delete failed: ' + err.message); }
      });
    });
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px" class="text-danger">' + err.message + '</td></tr>';
  }
}

document.addEventListener('pnp:ready', async function () {
  allProperties = await FS.getProperties();
  loadTenants();
});
