// page-reports.js — PNP Homes Portal
document.getElementById('nav-toggle').addEventListener('click', function () {
  document.getElementById('sidebar').classList.toggle('open');
});
document.getElementById('logout-btn').addEventListener('click', pnpLogout);
document.getElementById('btn-export').addEventListener('click', function () { FS.exportData(); });
document.getElementById('btn-print').addEventListener('click', function () { window.print(); });

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Populate year selector
const yearSel = document.getElementById('report-year');
const thisYear = new Date().getFullYear();
for (let y = thisYear; y >= thisYear - 4; y--) {
  yearSel.innerHTML += '<option value="' + y + '">' + y + '</option>';
}
yearSel.value = thisYear;
yearSel.addEventListener('change', loadReports);

async function loadReports() {
  const year = Number(yearSel.value);
  try {
    const [properties, leases, transactions] = await Promise.all([
      FS.getProperties(),
      FS.getActiveLeases(),
      FS.getTransactions()
    ]);

    const yearTx = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === year;
    });

    // ── Occupancy ──
    const totalUnits    = properties.reduce((s, p) => s + (p.units || []).length, 0);
    const occupiedUnits = leases.length;
    const occRate       = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
    document.getElementById('occ-body').innerHTML =
      '<div style="max-width:400px">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:8px">' +
      '<span>Occupancy Rate</span><strong>' + occRate + '%</strong></div>' +
      '<div class="progress-bar"><div class="progress-fill" style="width:' + occRate + '%"></div></div>' +
      '<p class="text-small text-muted mt-4">' + occupiedUnits + ' of ' + totalUnits + ' units occupied across ' + properties.length + ' properties</p>' +
      '</div>';

    // ── Monthly breakdown ──
    let annualRev = 0, annualExp = 0;
    const monthlyRows = MONTHS.map((m, i) => {
      const month = i + 1;
      const mTx   = yearTx.filter(t => { const d = new Date(t.date); return d.getMonth() + 1 === month; });
      const rev   = FS.sumByType(mTx, ['rent', 'income']);
      const exp   = FS.sumByType(mTx, ['expense']);
      const net   = rev - exp;
      annualRev += rev;
      annualExp += exp;
      const highlight = rev > 0 || exp > 0 ? '' : ' class="text-muted"';
      return '<tr' + highlight + '>' +
        '<td>' + m + ' ' + year + '</td>' +
        '<td class="text-success">' + FS.formatCurrency(rev) + '</td>' +
        '<td class="text-danger">'  + FS.formatCurrency(exp) + '</td>' +
        '<td class="' + (net >= 0 ? 'text-success' : 'text-danger') + '"><strong>' + FS.formatCurrency(net) + '</strong></td>' +
        '<td>' + FS.formatCurrency(FS.calcHST(rev)) + '</td></tr>';
    });
    document.getElementById('monthly-tbody').innerHTML = monthlyRows.join('') +
      '<tr style="border-top:2px solid var(--border);font-weight:600">' +
      '<td>Total ' + year + '</td>' +
      '<td class="text-success">' + FS.formatCurrency(annualRev) + '</td>' +
      '<td class="text-danger">'  + FS.formatCurrency(annualExp) + '</td>' +
      '<td class="' + (annualRev - annualExp >= 0 ? 'text-success' : 'text-danger') + '">' + FS.formatCurrency(annualRev - annualExp) + '</td>' +
      '<td>' + FS.formatCurrency(FS.calcHST(annualRev)) + '</td></tr>';

    // ── Annual summary ──
    const annualNet = annualRev - annualExp;
    document.getElementById('annual-body').innerHTML =
      '<div class="stats-grid" style="margin-bottom:0">' +
      '<div class="stat-card success"><div class="stat-label">Total Revenue</div><div class="stat-value">' + FS.formatCurrency(annualRev) + '</div></div>' +
      '<div class="stat-card danger"><div class="stat-label">Total Expenses</div><div class="stat-value">' + FS.formatCurrency(annualExp) + '</div></div>' +
      '<div class="stat-card ' + (annualNet >= 0 ? 'success' : 'danger') + '"><div class="stat-label">Net Income</div><div class="stat-value">' + FS.formatCurrency(annualNet) + '</div></div>' +
      '<div class="stat-card gold"><div class="stat-label">Est. HST Collected</div><div class="stat-value">' + FS.formatCurrency(FS.calcHST(annualRev)) + '</div></div>' +
      '</div>';

    // ── Expense categories ──
    const expTx    = yearTx.filter(t => t.type === 'expense');
    const catTotals = {};
    expTx.forEach(t => {
      const cat = t.category || 'other';
      catTotals[cat] = (catTotals[cat] || 0) + (t.amount || 0);
    });
    const totalExp = Object.values(catTotals).reduce((s, v) => s + v, 0);
    const catRows  = Object.entries(catTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => {
        const pct = totalExp > 0 ? Math.round((amt / totalExp) * 100) : 0;
        return '<tr>' +
          '<td style="text-transform:capitalize">' + cat.replace('-', ' ') + '</td>' +
          '<td class="text-danger">' + FS.formatCurrency(amt) + '</td>' +
          '<td>' + pct + '%</td></tr>';
      });
    document.getElementById('exp-cat-tbody').innerHTML = catRows.length > 0
      ? catRows.join('')
      : '<tr><td colspan="3" style="text-align:center;padding:20px" class="text-muted">No expenses recorded</td></tr>';

  } catch (err) {
    console.error('Reports error:', err);
  }
}

document.addEventListener('pnp:ready', loadReports);
