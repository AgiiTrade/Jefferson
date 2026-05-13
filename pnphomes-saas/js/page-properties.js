// page-properties.js — PNP Homes Portal
document.getElementById('nav-toggle').addEventListener('click', function () {
  document.getElementById('sidebar').classList.toggle('open');
});
document.getElementById('logout-btn').addEventListener('click', pnpLogout);

let currentUnits = [];
let editingId    = null;

function genUnitId() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 4); }

function renderUnitRow(unit) {
  const div = document.createElement('div');
  div.className = 'form-row mb-4';
  div.dataset.unitId = unit.id;
  div.innerHTML =
    '<div class="form-group"><label class="form-label">Unit Name</label>' +
    '<input class="form-control unit-name" type="text" value="' + (unit.name || '') + '" placeholder="Unit 101" required></div>' +
    '<div class="form-group"><label class="form-label">Beds</label>' +
    '<input class="form-control unit-beds" type="number" min="0" max="10" value="' + (unit.beds || 1) + '"></div>' +
    '<div class="form-group"><label class="form-label">Baths</label>' +
    '<input class="form-control unit-baths" type="number" min="0" max="10" step="0.5" value="' + (unit.baths || 1) + '"></div>' +
    '<div class="form-group"><label class="form-label">Rent (CAD)</label>' +
    '<input class="form-control unit-rent" type="number" min="0" value="' + (unit.rent || '') + '" placeholder="2000"></div>';
  const rm = document.createElement('button');
  rm.type = 'button';
  rm.className = 'btn btn-danger btn-sm mt-4';
  rm.textContent = '✕';
  rm.style.alignSelf = 'flex-end';
  rm.addEventListener('click', function () {
    currentUnits = currentUnits.filter(u => u.id !== unit.id);
    div.remove();
  });
  div.appendChild(rm);
  return div;
}

function collectUnits() {
  const rows = document.querySelectorAll('#units-list [data-unit-id]');
  return Array.from(rows).map(row => ({
    id:    row.dataset.unitId,
    name:  row.querySelector('.unit-name').value.trim(),
    beds:  Number(row.querySelector('.unit-beds').value) || 0,
    baths: Number(row.querySelector('.unit-baths').value) || 0,
    rent:  Number(row.querySelector('.unit-rent').value)  || 0
  })).filter(u => u.name);
}

function openModal(prop) {
  editingId = prop ? prop.id : null;
  currentUnits = prop ? (prop.units || []).map(u => ({ ...u })) : [];
  document.getElementById('prop-modal-title').textContent = prop ? 'Edit Property' : 'Add Property';
  document.getElementById('prop-id').value      = prop ? prop.id : '';
  document.getElementById('prop-name').value    = prop ? prop.name : '';
  document.getElementById('prop-type').value    = prop ? prop.type : 'apartment';
  document.getElementById('prop-address').value = prop ? prop.address : '';
  document.getElementById('prop-error').classList.remove('visible');
  const unitsList = document.getElementById('units-list');
  unitsList.innerHTML = '';
  currentUnits.forEach(u => unitsList.appendChild(renderUnitRow(u)));
  document.getElementById('property-modal').classList.add('open');
}

function closeModal() { document.getElementById('property-modal').classList.remove('open'); }

document.getElementById('btn-add-property').addEventListener('click', () => openModal(null));
document.getElementById('btn-add-unit').addEventListener('click', function () {
  const unit = { id: genUnitId(), name: '', beds: 1, baths: 1, rent: 0 };
  currentUnits.push(unit);
  document.getElementById('units-list').appendChild(renderUnitRow(unit));
});
document.getElementById('prop-modal-close').addEventListener('click', closeModal);
document.getElementById('prop-cancel').addEventListener('click', closeModal);

document.getElementById('prop-save').addEventListener('click', async function () {
  const errEl = document.getElementById('prop-error');
  errEl.classList.remove('visible');
  const name    = document.getElementById('prop-name').value.trim();
  const address = document.getElementById('prop-address').value.trim();
  if (!name || !address) { errEl.textContent = 'Name and address are required.'; errEl.classList.add('visible'); return; }

  this.disabled    = true;
  this.textContent = 'Saving…';
  try {
    const prop = {
      id:      editingId || undefined,
      name,
      address,
      type:    document.getElementById('prop-type').value,
      units:   collectUnits()
    };
    if (!editingId) delete prop.id;
    await FS.saveProperty(prop);
    closeModal();
    loadProperties();
  } catch (err) {
    errEl.textContent = 'Save failed: ' + err.message;
    errEl.classList.add('visible');
  }
  this.disabled    = false;
  this.textContent = 'Save Property';
});

document.getElementById('property-modal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

async function loadProperties() {
  const list = document.getElementById('props-list');
  try {
    const [properties, leases, tenants] = await Promise.all([
      FS.getProperties(),
      FS.getActiveLeases(),
      FS.getTenants()
    ]);

    const tenantMap = Object.fromEntries(tenants.map(t => [t.id, t]));
    const leaseByUnit = Object.fromEntries(leases.map(l => [l.propertyId + '_' + l.unitId, l]));

    if (properties.length === 0) {
      list.innerHTML = '<div class="empty-state"><div class="empty-icon">🏠</div><h4>No properties yet</h4><p>Click "Add Property" to get started.</p></div>';
      return;
    }

    list.innerHTML = properties.map(prop => {
      const units = prop.units || [];
      const occupied = units.filter(u => leaseByUnit[prop.id + '_' + u.id]).length;
      const unitsHtml = units.length === 0
        ? '<p class="text-muted text-small">No units defined.</p>'
        : '<table><thead><tr><th>Unit</th><th>Beds/Baths</th><th>Rent</th><th>Tenant</th><th>Status</th></tr></thead><tbody>' +
          units.map(u => {
            const lease  = leaseByUnit[prop.id + '_' + u.id];
            const tenant = lease ? (tenantMap[lease.tenantId] || {}) : null;
            const status = lease
              ? '<span class="badge badge-success">Occupied</span>'
              : '<span class="badge badge-warning">Vacant</span>';
            return '<tr>' +
              '<td>' + u.name + '</td>' +
              '<td>' + u.beds + 'bd / ' + u.baths + 'ba</td>' +
              '<td>' + FS.formatCurrency(u.rent) + '</td>' +
              '<td>' + (tenant ? tenant.firstName + ' ' + tenant.lastName : '—') + '</td>' +
              '<td>' + status + '</td></tr>';
          }).join('') +
          '</tbody></table>';

      return '<div class="card mb-6">' +
        '<div class="card-header">' +
        '<div><h3 style="margin-bottom:2px">' + prop.name + '</h3>' +
        '<span class="text-muted text-small">' + prop.address + ' · ' +
        '<span class="badge badge-neutral" style="text-transform:capitalize">' + (prop.type || 'property') + '</span></span></div>' +
        '<div class="gap-2">' +
        '<span class="text-small text-muted">' + occupied + '/' + units.length + ' occupied</span>' +
        '<button class="btn btn-outline btn-sm" data-edit="' + prop.id + '">Edit</button>' +
        '<button class="btn btn-danger btn-sm" data-delete="' + prop.id + '">Delete</button>' +
        '</div></div>' +
        '<div class="card-body">' + unitsHtml + '</div></div>';
    }).join('');

    list.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', function () {
        const prop = properties.find(p => p.id === this.dataset.edit);
        if (prop) openModal(prop);
      });
    });
    list.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', async function () {
        const prop = properties.find(p => p.id === this.dataset.delete);
        if (!prop) return;
        if (!confirm('Delete "' + prop.name + '" and all its tenants, leases, and records? This cannot be undone.')) return;
        try {
          await FS.deleteProperty(this.dataset.delete);
          loadProperties();
        } catch (err) { alert('Delete failed: ' + err.message); }
      });
    });
  } catch (err) {
    list.innerHTML = '<div class="empty-state"><h4>Error loading properties</h4><p>' + err.message + '</p></div>';
  }
}

document.addEventListener('pnp:ready', loadProperties);
