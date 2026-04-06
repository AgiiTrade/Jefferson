// GroceryTrack Pro — Main Application
(function(){
"use strict";

// ── Storage Keys ─────────────────────────────────────────
const SK = {
  inv:    "gtp.inventory",
  sales:  "gtp.sales",
  cfg:    "gtp.config"
};

// ── State ────────────────────────────────────────────────
let inventory = JSON.parse(localStorage.getItem(SK.inv)) || DEFAULT_INVENTORY.map(i=>({...i}));
let sales     = JSON.parse(localStorage.getItem(SK.sales)) || [];
let config    = JSON.parse(localStorage.getItem(SK.cfg)) || { storeName:"My Grocery Store", currency:"$" };
let currentItem = null;
let editIndex   = null;

function save(){
  localStorage.setItem(SK.inv,   JSON.stringify(inventory));
  localStorage.setItem(SK.sales, JSON.stringify(sales));
  localStorage.setItem(SK.cfg,   JSON.stringify(config));
}

// ── Helpers ──────────────────────────────────────────────
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const fmt = n => config.currency + parseFloat(n).toFixed(2);
const esc = s => String(s).replace(/[<>"'&]/g,c=>({"<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","&":"&amp;"}[c]));

// ── Tabs ─────────────────────────────────────────────────
$$(".nav-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    $$(".nav-btn").forEach(b=>b.classList.remove("active"));
    $$(".tab").forEach(t=>t.classList.remove("active"));
    btn.classList.add("active");
    $("#tab-"+btn.dataset.tab).classList.add("active");
    if(btn.dataset.tab==="inventory") renderInventory();
    if(btn.dataset.tab==="sales")     renderSalesLog();
  });
});

// ── Scan / Lookup ────────────────────────────────────────
function lookupBarcode(){
  const val = $("#barcode-input").value.trim();
  if(!val) return;
  const item = inventory.find(i=>i.barcode===val);
  if(!item){ alert("Item not found for barcode: "+val); $("#scan-result").classList.add("hidden"); return; }
  currentItem = item;
  $("#item-name").textContent   = item.name;
  $("#item-category").textContent = item.category;
  $("#item-price").textContent  = fmt(item.price);
  $("#item-stock").textContent  = item.stock + " in stock";
  $("#sell-qty").value = 1;
  $("#sell-qty").max = item.stock;
  $("#scan-result").classList.remove("hidden");
}

$("#btn-lookup").addEventListener("click", lookupBarcode);
$("#barcode-input").addEventListener("keydown", e=>{ if(e.key==="Enter") lookupBarcode(); });

// ── Sell ─────────────────────────────────────────────────
function sellItem(){
  if(!currentItem) return;
  const qty = parseInt($("#sell-qty").value)||1;
  if(qty < 1 || qty > currentItem.stock){ alert("Invalid quantity. Stock: "+currentItem.stock); return; }
  const now = new Date().toISOString();
  const total = +(currentItem.price * qty).toFixed(2);
  sales.push({ id:Date.now(), timestamp:now, barcode:currentItem.barcode, name:currentItem.name, category:currentItem.category, qty, unitPrice:currentItem.price, total });
  currentItem.stock -= qty;
  save();
  renderRecentSales();
  $("#item-stock").textContent = currentItem.stock + " in stock";
  $("#sell-qty").max = currentItem.stock;
  $("#sell-qty").value = 1;
}
$("#btn-sell").addEventListener("click", sellItem);

// ── Recent Sales (Scan tab) ──────────────────────────────
function renderRecentSales(){
  const el = $("#recent-sales");
  const recent = sales.slice(-20).reverse();
  if(!recent.length){ el.innerHTML = '<p class="empty">No sales yet</p>'; return; }
  el.innerHTML = recent.map(s=>{
    const d = new Date(s.timestamp);
    const ts = d.toLocaleDateString() + " " + d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
    return `<div class="sale-item"><span>${ts}</span><span>${esc(s.name)} ×${s.qty}</span><span>${fmt(s.total)}</span></div>`;
  }).join("");
}

// ── Quick Items ──────────────────────────────────────────
function renderQuickItems(){
  const popular = inventory.slice(0, 12);
  $("#quick-items").innerHTML = popular.map((it,i)=>`<div class="quick-item" data-idx="${i}">${esc(it.name)}</div>`).join("");
  $$(".quick-item").forEach(el=>{
    el.addEventListener("click",()=>{
      const it = inventory[parseInt(el.dataset.idx)];
      if(!it) return;
      $("#barcode-input").value = it.barcode;
      lookupBarcode();
    });
  });
}

// ── Inventory Tab ────────────────────────────────────────
function renderInventory(filter){
  const list = filter ? inventory.filter(i=> i.name.toLowerCase().includes(filter) || i.barcode.includes(filter) || i.category.toLowerCase().includes(filter)) : inventory;
  $("#inv-count").textContent = inventory.length;
  $("#inv-table tbody").innerHTML = list.map((it,i)=>{
    const realIdx = inventory.indexOf(it);
    const lowStock = it.stock < 10 ? ' style="color:var(--danger)"' : '';
    return `<tr>
      <td>${esc(it.barcode)}</td><td>${esc(it.name)}</td><td>${esc(it.category)}</td>
      <td>${fmt(it.price)}</td><td${lowStock}>${it.stock}</td>
      <td><button class="btn-edit" data-idx="${realIdx}">✏️</button> <button class="btn-del" data-idx="${realIdx}">🗑️</button></td>
    </tr>`;
  }).join("");
  // Populate category datalist
  const cats = [...new Set(inventory.map(i=>i.category))].sort();
  $("#cat-list").innerHTML = cats.map(c=>`<option value="${esc(c)}">`).join("");
  // Bind edit/delete
  $$(".btn-edit").forEach(b=> b.addEventListener("click",()=> startEdit(parseInt(b.dataset.idx))));
  $$(".btn-del").forEach(b=> b.addEventListener("click",()=> deleteItem(parseInt(b.dataset.idx))));
}

$("#inv-search").addEventListener("input",()=> renderInventory($("#inv-search").value.toLowerCase()));

// ── Add / Edit Item ──────────────────────────────────────
function startEdit(idx){
  editIndex = idx;
  const it = inventory[idx];
  const f = $("#item-form");
  f.barcode.value = it.barcode; f.name.value = it.name; f.category.value = it.category;
  f.price.value = it.price; f.stock.value = it.stock;
  $("#btn-save-item").textContent = "Update Item";
  $("#btn-cancel-edit").classList.remove("hidden");
}
function cancelEdit(){
  editIndex = null; $("#item-form").reset();
  $("#btn-save-item").textContent = "Save Item";
  $("#btn-cancel-edit").classList.add("hidden");
}
$("#btn-cancel-edit").addEventListener("click", cancelEdit);

$("#item-form").addEventListener("submit", e=>{
  e.preventDefault();
  const f = e.target;
  const item = { barcode:f.barcode.value.trim(), name:f.name.value.trim(), category:f.category.value.trim(), price:parseFloat(f.price.value)||0, stock:parseInt(f.stock.value)||0 };
  if(editIndex !== null){ inventory[editIndex] = item; }
  else{
    if(inventory.find(i=>i.barcode===item.barcode)){ alert("Barcode already exists!"); return; }
    inventory.push(item);
  }
  save(); cancelEdit(); renderInventory();
});

function deleteItem(idx){
  if(!confirm("Delete "+inventory[idx].name+"?")) return;
  inventory.splice(idx,1); save(); renderInventory();
}

// ── CSV Import ───────────────────────────────────────────
$("#btn-import").addEventListener("click",()=>{
  const lines = $("#csv-import").value.trim().split("\n").filter(l=>l.trim());
  let added = 0;
  lines.forEach(line=>{
    const parts = line.split(",").map(p=>p.trim());
    if(parts.length < 5) return;
    const [barcode,name,category,price,stock] = parts;
    if(inventory.find(i=>i.barcode===barcode)) return;
    inventory.push({ barcode, name, category, price:parseFloat(price)||0, stock:parseInt(stock)||0 });
    added++;
  });
  save(); renderInventory(); $("#csv-import").value = "";
  alert("Imported "+added+" new items.");
});

// ── Sales Log Tab ────────────────────────────────────────
function renderSalesLog(from, to){
  $("#sales-count").textContent = sales.length;
  let filtered = sales;
  if(from) filtered = filtered.filter(s=> s.timestamp >= from);
  if(to)   filtered = filtered.filter(s=> s.timestamp <= to + "T23:59:59");
  const sorted = filtered.slice().reverse();
  $("#sales-table tbody").innerHTML = sorted.map(s=>{
    const d = new Date(s.timestamp);
    const ts = d.toLocaleDateString() + " " + d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
    return `<tr><td>${ts}</td><td>${esc(s.name)}</td><td>${s.qty}</td><td>${fmt(s.unitPrice)}</td><td>${fmt(s.total)}</td></tr>`;
  }).join("");
}
$("#btn-filter-sales").addEventListener("click",()=> renderSalesLog($("#sales-from").value, $("#sales-to").value));

// ── Reports ──────────────────────────────────────────────
$("#report-period").addEventListener("change",()=>{
  $("#custom-range").classList.toggle("hidden", $("#report-period").value !== "custom");
});

$("#btn-generate").addEventListener("click", generateReport);

function getPeriodRange(){
  const p = $("#report-period").value;
  const now = new Date();
  let from, to;
  if(p==="today"){ from = new Date(now.getFullYear(),now.getMonth(),now.getDate()); to = now; }
  else if(p==="week"){ const d=new Date(now); d.setDate(d.getDate()-7); from=d; to=now; }
  else if(p==="month"){ from=new Date(now.getFullYear(),now.getMonth(),1); to=now; }
  else if(p==="year"){ from=new Date(now.getFullYear(),0,1); to=now; }
  else if(p==="all"){ from=new Date(0); to=now; }
  else{ from=$("#report-from").value?new Date($("#report-from").value):new Date(0); to=$("#report-to").value?new Date($("#report-to").value+"T23:59:59"):now; }
  return { from:from.toISOString(), to:to.toISOString(), label:p };
}

function generateReport(){
  const {from,to,label} = getPeriodRange();
  const filtered = sales.filter(s=> s.timestamp >= from && s.timestamp <= to);
  const totalSales = filtered.length;
  const totalRevenue = filtered.reduce((a,s)=>a+s.total,0);
  const avgSale = totalSales ? totalRevenue/totalSales : 0;
  const itemsSold = filtered.reduce((a,s)=>a+s.qty,0);

  // Period label
  const fromD = new Date(from).toLocaleDateString();
  const toD   = new Date(to).toLocaleDateString();
  $("#report-period-label").textContent = `Period: ${fromD} — ${toD}`;

  // Summary
  $("#r-total-sales").textContent  = totalSales;
  $("#r-total-revenue").textContent = fmt(totalRevenue);
  $("#r-avg-sale").textContent = fmt(avgSale);
  $("#r-items-sold").textContent = itemsSold;

  // Top items
  const itemMap = {};
  filtered.forEach(s=>{
    if(!itemMap[s.name]) itemMap[s.name] = {qty:0,revenue:0};
    itemMap[s.name].qty += s.qty;
    itemMap[s.name].revenue += s.total;
  });
  const topItems = Object.entries(itemMap).sort((a,b)=>b[1].qty-a[1].qty).slice(0,15);
  $("#report-top-items table tbody").innerHTML = topItems.map(([name,d])=>`<tr><td>${esc(name)}</td><td>${d.qty}</td><td>${fmt(d.revenue)}</td></tr>`).join("") || '<tr><td colspan="3">No data</td></tr>';

  // Categories
  const catMap = {};
  filtered.forEach(s=>{
    const cat = s.category || "Other";
    if(!catMap[cat]) catMap[cat] = {items:0,revenue:0};
    catMap[cat].items += s.qty;
    catMap[cat].revenue += s.total;
  });
  const cats = Object.entries(catMap).sort((a,b)=>b[1].revenue-a[1].revenue);
  $("#report-categories table tbody").innerHTML = cats.map(([cat,d])=>{
    const pct = totalRevenue ? ((d.revenue/totalRevenue)*100).toFixed(1) : "0.0";
    return `<tr><td>${esc(cat)}</td><td>${d.items}</td><td>${fmt(d.revenue)}</td><td>${pct}%</td></tr>`;
  }).join("") || '<tr><td colspan="4">No data</td></tr>';

  // Hourly
  const hourMap = {};
  for(let h=0;h<24;h++) hourMap[h]={sales:0,revenue:0};
  filtered.forEach(s=>{
    const h = new Date(s.timestamp).getHours();
    hourMap[h].sales++; hourMap[h].revenue += s.total;
  });
  $("#report-hourly table tbody").innerHTML = Object.entries(hourMap).filter(([,d])=>d.sales).map(([h,d])=>`<tr><td>${h}:00</td><td>${d.sales}</td><td>${fmt(d.revenue)}</td></tr>`).join("") || '<tr><td colspan="3">No data</td></tr>';

  // Daily
  const dayMap = {};
  filtered.forEach(s=>{
    const day = s.timestamp.slice(0,10);
    if(!dayMap[day]) dayMap[day]={sales:0,revenue:0};
    dayMap[day].sales++; dayMap[day].revenue += s.total;
  });
  $("#report-daily table tbody").innerHTML = Object.entries(dayMap).sort().map(([d,vals])=>`<tr><td>${d}</td><td>${vals.sales}</td><td>${fmt(vals.revenue)}</td></tr>`).join("") || '<tr><td colspan="3">No data</td></tr>';

  // Full transactions
  $("#report-transactions table tbody").innerHTML = filtered.map(s=>{
    const ts = new Date(s.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    return `<tr><td>${ts}</td><td>${esc(s.name)}</td><td>${s.qty}</td><td>${fmt(s.total)}</td></tr>`;
  }).join("") || '<tr><td colspan="4">No transactions</td></tr>';

  $("#report-output").classList.remove("hidden");

  // Store for export
  window._reportData = filtered;
}

// ── CSV Export ────────────────────────────────────────────
$("#btn-export-csv").addEventListener("click",()=>{
  const data = window._reportData || [];
  if(!data.length){ alert("No data to export"); return; }
  const header = "Date,Time,Item,Category,Qty,Unit Price,Total\n";
  const rows = data.map(s=>{
    const d = new Date(s.timestamp);
    return [d.toLocaleDateString(),d.toLocaleTimeString(),s.name,s.category,s.qty,s.unitPrice,s.total].map(v=>'"'+v+'"').join(",");
  }).join("\n");
  const blob = new Blob([header+rows], {type:"text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download="grocery-report.csv"; a.click();
  URL.revokeObjectURL(url);
});

$("#btn-print-report").addEventListener("click",()=> window.print());

// ── Settings ─────────────────────────────────────────────
$("#store-name").value = config.storeName;
$("#currency-symbol").value = config.currency;
$("#btn-save-settings").addEventListener("click",()=>{
  config.storeName = $("#store-name").value;
  config.currency  = $("#currency-symbol").value || "$";
  save(); alert("Settings saved.");
});

// ── Data Management ──────────────────────────────────────
$("#btn-export-data").addEventListener("click",()=>{
  const blob = new Blob([JSON.stringify({inventory,sales,config},null,2)],{type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download="grocery-backup.json"; a.click();
  URL.revokeObjectURL(url);
});

$("#btn-import-data").addEventListener("click",()=>{
  const input = document.createElement("input"); input.type="file"; input.accept=".json";
  input.addEventListener("change", e=>{
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ev=>{
      try{
        const data = JSON.parse(ev.target.result);
        if(data.inventory) inventory = data.inventory;
        if(data.sales) sales = data.sales;
        if(data.config) config = data.config;
        save(); renderInventory(); renderRecentSales(); renderQuickItems();
        alert("Data imported successfully.");
      } catch(err){ alert("Invalid file."); }
    };
    reader.readAsText(file);
  });
  input.click();
});

$("#btn-clear-sales").addEventListener("click",()=>{
  if(!confirm("Clear ALL sales history? This cannot be undone.")) return;
  sales = []; save(); renderRecentSales(); renderSalesLog();
});

$("#btn-reset-all").addEventListener("click",()=>{
  if(!confirm("Reset EVERYTHING (inventory, sales, settings)? This cannot be undone.")) return;
  localStorage.removeItem(SK.inv); localStorage.removeItem(SK.sales); localStorage.removeItem(SK.cfg);
  location.reload();
});

// ── Init ─────────────────────────────────────────────────
renderInventory();
renderRecentSales();
renderQuickItems();
renderSalesLog();

})();
