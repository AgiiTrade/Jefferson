// page-maintenance.js — PNP Homes Portal
document.getElementById('nav-toggle').addEventListener('click', function () {
  document.getElementById('sidebar').classList.toggle('open');
});
document.getElementById('logout-btn').addEventListener('click', pnpLogout);

let allProperties = [];
let allRequests   = [];
let activeFilter  = 'all';
let editingId     = null;

function closeModal() { document.getElementById('maint-modal').classList.remove('open'); }

function propOptions(selectedId) {
  return '<option value="">— Select property —</option>' +
    allProperties.map(p => '<option value="' + p.id + '"' + (p.id === selectedId ? ' selected' : '') + '>' + p.name + '</option>').join('');
}

function openModal(req) {
  editingId = req ? req.id : null;
  document.getElementById('maint-modal-title').textContent = req ? 'Edit Request' : 'New Request';
  document.getElementById('maint-id').value          = req ? req.id : '';
  document.getElementById('maint-title').value       = req ? req.title : '';
  document.getElementById('maint-property').innerHTML= propOptions(req ? req.propertyId : null);
  document.getElementById('maint-priority').value    = req ? (req.priority || 'medium') : 'medium';
  document.getElementById('maint-desc').value        = req ? (req.description || '') : '';
  document.getElementById('maint-status').value      = req ? (req.status || 'open') : 'open';
  document.getElementById('maint-cost').value        = req ? (req.cost || 0) : 0;
  document.getElementById('maint-contractor').value  = req ? (req.contractor || '') : '';
  document.getElementById('maint-error').classList.remove('visible');
  document.getElementById('maint-modal').classList.add('open');
}

document.getElementById('btn-add-maint').addEventListener('click', () => openModal(null));
document.getElementById('maint-modal-close').addEventListener('click', closeModal);
document.getElementById('maint-cancel').addEventListener('click', closeModal);
document.getElementById('maint-modal').addEventListener('click', function (e) { if (e.target === this) closeModal(); });

document.getElementById('maint-save').addEventListener('click', async function () {
  const errEl = document.getElementById('maint-error');
  errEl.classList.remove('visible');
  const title = document.getElementById('maint-title').value.trim();
  if (!title) { errEl.textContent = 'Title is required.'; errEl.classList.add('visible'); return; }

  this.disabled    = true;
  this.textContent = 'Saving…';
  try {
    await FS.saveMaintenance({
      id:          editingId || undefined,
      title,
      propertyId:  document.getElementById('maint-property').value,
      priority:    document.getElementById('maint-priority').value,
      description: document.getElementById('maint-desc').value.trim(),
      status:      document.getElementById('maint-status').value,
      cost:        Number(document.getElementById('maint-cost').value) || 0,
      contractor:  document.getElementById('maint-contractor').value.trim()
    });
    closeModal();
    loadMaintenance();
  } catch (err) {
    errEl.textContent = 'Save failed: ' + err.message;
    errEl.classList.add('visible');
  }
  this.disabled    = false;
  this.textContent = 'Save Request';
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    activeFilter = this.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active', 'btn-primary'));
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.add('btn-outline'));
    this.classList.remove('btn-outline');
    this.classList.add('btn-primary', 'active');
    renderList();
  });
});

function statusBadge(s) {
  if (s === 'completed')  return '<span class="badge badge-success">Completed</span>';
  if (s === 'in_progress') return '<span class="badge badge-info">In Progress</span>';
  return '<span class="badge badge-warning">Open</span>';
}

function renderList() {
  const propMap = Object.fromEntries(allProperties.map(p => [p.id, p]));
  const list    = document.getElementById('maint-list');
  const filtered = activeFilter === 'all'
    ? allRequests
    : allRequests.filter(r => r.status === activeFilter);

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state"><div class="empty-icon">🔧</div>' +
      '<h4>' + (activeFilter === 'all' ? 'No maintenance requests yet' : 'No ' + activeFilter.replace('_', ' ') + ' requests') + '</h4>' +
      '<p>Click "New Request" to log one.</p></div>';
    return;
  }

  list.innerHTML = filtered.map(r => {
    const prop = propMap[r.propertyId] || {};
    return '<div class="card mb-4">' +
      '<div class="card-header">' +
      '<div>' +
      '<h3 style="font-size:0.95em;margin-bottom:3px">' + r.title + '</h3>' +
      '<span class="text-muted text-small">' + (prop.name || '—') + '</span>' +
      '</div>' +
      '<div class="gap-2">' +
      '<span class="priority-' + (r.priority || 'medium') + ' text-small">' + (r.priority || 'medium') + '</span>' +
      statusBadge(r.status) +
      '<button class="btn btn-outline btn-sm" data-edit="' + r.id + '">Edit</button>' +
      '<button class="btn btn-danger btn-sm" data-delete="' + r.id + '">Delete</button>' +
      '</div></div>' +
      (r.description ? '<div class="card-body" style="padding:14px 22px"><p class="text-small text-muted">' + r.description + '</p>' : '<div class="card-body" style="padding:14px 22px">') +
      (r.contractor  ? '<p class="text-small mt-4">Contractor: <strong>' + r.contractor + '</strong></p>' : '') +
      (r.cost        ? '<p class="text-small">Cost: <strong>' + FS.formatCurrency(r.cost) + '</strong></p>' : '') +
      '</div></div>';
  }).join('');

  list.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', function () {
      const req = allRequests.find(r => r.id === this.dataset.edit);
      if (req) openModal(req);
    });
  });
  list.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async function () {
      if (!confirm('Delete this maintenance request?')) return;
      try { await FS.deleteMaintenance(this.dataset.delete); loadMaintenance(); }
      catch (err) { alert('Delete failed: ' + err.message); }
    });
  });
}

async function loadMaintenance() {
  try {
    [allProperties, allRequests] = await Promise.all([FS.getProperties(), FS.getMaintenance()]);

    document.getElementById('m-total').textContent    = allRequests.length;
    document.getElementById('m-open').textContent     = allRequests.filter(r => r.status === 'open').length;
    document.getElementById('m-progress').textContent = allRequests.filter(r => r.status === 'in_progress').length;
    document.getElementById('m-done').textContent     = allRequests.filter(r => r.status === 'completed').length;

    renderList();
  } catch (err) {
    document.getElementById('maint-list').innerHTML =
      '<div class="empty-state"><h4>Error loading requests</h4><p>' + err.message + '</p></div>';
  }
}

document.addEventListener('pnp:ready', loadMaintenance);
