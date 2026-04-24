/**
 * SalesIQ — Amazon Sales BI Dashboard (Shoppers Design)
 * =====================================================
 * Multi-page SPA with Chart.js, cross-filtering, data tables,
 * and gauge visualization. Pixel-perfect Shoppers replication.
 */

/* ==========================================
   GLOBALS
   ========================================== */
let allProducts = [];
let filteredProducts = [];
let activeFilters = {};
let charts = {};
let currentPage = 'dashboard';

// Products table state
let productsTableData = [];
let productsSortKey = 'rating_count';
let productsSortAsc = false;
let productsCurrentPage = 1;
const PER_PAGE = 25;

/* ==========================================
   PALETTE
   ========================================== */
const C = {
  blue: '#2563EB',
  green: '#16A34A',
  emerald: '#10B981',
  orange: '#EA580C',
  amber: '#F59E0B',
  purple: '#7C3AED',
  cyan: '#06B6D4',
  rose: '#F43F5E',
  teal: '#14B8A6',
  pink: '#EC4899',
  sky: '#0EA5E9',
  red: '#DC2626',
  slate: '#64748B',
  indigo: '#6366F1',
};

const PAL = ['#2563EB','#16A34A','#F59E0B','#7C3AED','#EA580C','#EC4899','#06B6D4','#14B8A6','#F43F5E','#6366F1','#0EA5E9','#84CC16','#D946EF','#64748B'];

/* ==========================================
   CHART DEFAULTS
   ========================================== */
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 11;
Chart.defaults.color = '#9CA3AF';
Chart.defaults.plugins.legend.display = false;
Chart.defaults.animation.duration = 600;
Chart.defaults.animation.easing = 'easeOutQuart';

const GRID = { color: 'rgba(229,231,235,0.5)', drawBorder: false };
const TIP = {
  backgroundColor: '#111827',
  titleColor: '#F9FAFB',
  bodyColor: '#E5E7EB',
  borderColor: 'rgba(255,255,255,0.06)',
  borderWidth: 1,
  padding: 10,
  cornerRadius: 6,
  titleFont: { weight: '600', size: 12 },
  bodyFont: { size: 11 },
  displayColors: true,
  boxPadding: 4,
};

/* ==========================================
   INIT
   ========================================== */
document.addEventListener('DOMContentLoaded', () => loadData());

async function loadData() {
  try {
    const res = await fetch('data.json');
    const data = await res.json();
    allProducts = data.products;
    filteredProducts = [...allProducts];
    document.getElementById('loadingState').style.display = 'none';
    populateFilters();
    navigateTo('dashboard');
  } catch (err) {
    console.error('Failed to load data:', err);
    document.getElementById('loadingState').innerHTML =
      '<div style="color:#DC2626;font-size:1.1rem;font-weight:600;">Failed to load data</div>' +
      '<div style="color:#9CA3AF;font-size:0.85rem;margin-top:4px;">Make sure data.json is in the same directory.</div>';
  }
}

/* ==========================================
   NAVIGATION
   ========================================== */
function navigateTo(page) {
  currentPage = page;

  // Sidebar active
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const navEl = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navEl) navEl.classList.add('active');

  // Title
  const names = { dashboard: 'Dashboard', products: 'Products', categories: 'Categories', pricing: 'Pricing', ratings: 'Ratings' };
  document.getElementById('topbarTitle').textContent = names[page] || page;

  // Pages
  document.querySelectorAll('.page').forEach(el => el.style.display = 'none');
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) {
    pageEl.style.display = 'block';
    pageEl.style.animation = 'none';
    pageEl.offsetHeight;
    pageEl.style.animation = 'fadeIn 0.25s ease-out';
  }

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('mobile-open');

  // Render
  renderPage(page);
  document.getElementById('contentArea').scrollTop = 0;
}

function renderPage(page) {
  switch (page) {
    case 'dashboard': renderDashboard(); break;
    case 'products': renderProductsPage(); break;
    case 'categories': renderCategoriesPage(); break;
    case 'pricing': renderPricingPage(); break;
    case 'ratings': renderRatingsPage(); break;
  }
}

/* ==========================================
   DASHBOARD PAGE
   ========================================== */
function renderDashboard() {
  const d = filteredProducts;
  const n = d.length;
  const avgDisc = n > 0 ? (d.reduce((s, p) => s + p.discount_percentage, 0) / n).toFixed(1) : 0;
  const avgRat = n > 0 ? (d.reduce((s, p) => s + p.rating, 0) / n).toFixed(1) : 0;
  const totRev = d.reduce((s, p) => s + p.rating_count, 0);
  const cats = new Set(d.map(p => p.main_category)).size;

  animVal('kpiProducts', n);
  document.getElementById('kpiDiscount').textContent = avgDisc + '%';
  document.getElementById('kpiRating').textContent = avgRat;
  animVal('kpiReviews', totRev);
  document.getElementById('kpiProductsCompare').textContent = `across ${cats} categories`;
  document.getElementById('kpiReviewsCompare').textContent = `${fmtNum(totRev)} ratings collected`;

  // Total Revenue
  const totalRevenue = d.reduce((s, p) => s + p.actual_price, 0);
  document.getElementById('totalRevenueValue').textContent = '₹' + fmtNum(Math.round(totalRevenue));

  createRevenueChart();
  createRatingBarsChart();
  renderBestProductsTable();
  drawGauge();
  renderCategoryBreakdown();
  createCategoryPieChart();
}

/* --- Revenue Line Chart --- */
function createRevenueChart() {
  const ctx = document.getElementById('chartRevenue');
  if (!ctx) return;

  // Group by category for a meaningful line
  const catMap = {};
  filteredProducts.forEach(p => {
    catMap[p.main_category] = (catMap[p.main_category] || 0) + p.actual_price;
  });
  const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  const labels = sorted.map(s => s[0].length > 14 ? s[0].substring(0, 14) + '…' : s[0]);
  const values = sorted.map(s => Math.round(s[1]));

  if (charts.revenue) charts.revenue.destroy();
  charts.revenue = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: values,
        borderColor: C.blue,
        backgroundColor: 'rgba(37,99,235,0.08)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: C.blue,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { tooltip: { ...TIP, callbacks: { label: item => ` ₹${item.raw.toLocaleString('en-IN')}` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        y: { grid: GRID, ticks: { font: { size: 10 }, callback: v => fmtCur(v) } },
      },
    },
  });
}

/* --- Rating Bars (vertical like "Most Day Active") --- */
function createRatingBarsChart() {
  const ctx = document.getElementById('chartRatingBars');
  if (!ctx) return;
  const { labels, values } = getRatingData();

  if (charts.ratingBars) charts.ratingBars.destroy();
  charts.ratingBars = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: labels.map((_, i) => i === values.indexOf(Math.max(...values)) ? C.blue : '#E2E8F0'),
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.55,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { tooltip: { ...TIP, callbacks: { label: item => ` ${item.raw} products` } } },
      scales: {
        y: { grid: GRID, beginAtZero: true, ticks: { font: { size: 10 } } },
        x: { grid: { display: false }, ticks: { font: { size: 11, weight: '600' } } },
      },
      onClick: (_, elements) => {
        if (elements.length > 0) applyFilter('rating_range', labels[elements[0].index]);
      },
    },
  });
}

/* --- Best Products Table --- */
function renderBestProductsTable() {
  const best = [...filteredProducts].sort((a, b) => b.rating_count - a.rating_count).slice(0, 5);
  const tbody = document.getElementById('bestProductsBody');
  if (!tbody) return;

  tbody.innerHTML = best.map((p) => {
    const stars = '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5 - Math.round(p.rating));
    return `<tr>
      <td style="color:var(--text-muted);font-weight:500;font-size:0.75rem;">#${p.product_id.substring(0, 5)}</td>
      <td class="product-name-cell" title="${esc(p.product_name)}">${esc(p.product_name.substring(0, 30))}…</td>
      <td style="font-size:0.75rem;color:var(--text-secondary);">${esc(p.main_category.substring(0, 18))}</td>
      <td><span class="price-green">₹${p.discounted_price.toLocaleString('en-IN')}</span></td>
      <td><span class="stars-cell">${stars}</span> <span style="color:var(--text-secondary);font-size:0.72rem;">(${p.rating})</span></td>
    </tr>`;
  }).join('');
}

/* --- Gauge (High Rating Rate) --- */
function drawGauge() {
  const canvas = document.getElementById('gaugeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const n = filteredProducts.length;
  const fourPlus = filteredProducts.filter(p => p.rating >= 4).length;
  const pct = n > 0 ? Math.round((fourPlus / n) * 100) : 0;

  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h - 10;
  const r = 75;
  const lineW = 14;

  ctx.clearRect(0, 0, w, h);

  // Background arc
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 2 * Math.PI);
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = lineW;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Value arc
  const angle = Math.PI + (pct / 100) * Math.PI;
  const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
  grad.addColorStop(0, '#16A34A');
  grad.addColorStop(0.5, '#22C55E');
  grad.addColorStop(1, '#86EFAC');

  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, angle);
  ctx.strokeStyle = grad;
  ctx.lineWidth = lineW;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Ticks
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI + (i / 10) * Math.PI;
    const x1 = cx + (r + 10) * Math.cos(a);
    const y1 = cy + (r + 10) * Math.sin(a);
    const x2 = cx + (r + 15) * Math.cos(a);
    const y2 = cy + (r + 15) * Math.sin(a);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  document.getElementById('gaugeValue').textContent = pct + '%';
}

/* --- Category Breakdown Row --- */
function renderCategoryBreakdown() {
  const catMap = {};
  filteredProducts.forEach(p => {
    catMap[p.main_category] = (catMap[p.main_category] || 0) + 1;
  });
  const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const container = document.getElementById('categoryBreakdown');
  if (!container) return;

  const colors = [C.blue, C.green, C.amber];
  const icons = ['📦', '🏷️', '⭐'];
  container.innerHTML = sorted.map(([cat, count], i) => `
    <div class="breakdown-item">
      <div class="breakdown-dot" style="background:${colors[i]}"></div>
      <div>
        <div class="breakdown-val">${fmtNum(count)}</div>
        <div class="breakdown-label">${cat.length > 18 ? cat.substring(0, 18) + '…' : cat}</div>
      </div>
    </div>
  `).join('');
}

/* --- Category Pie Chart --- */
function createCategoryPieChart() {
  const ctx = document.getElementById('chartCategoryPie');
  if (!ctx) return;
  const catMap = {};
  filteredProducts.forEach(p => { catMap[p.main_category] = (catMap[p.main_category] || 0) + 1; });
  const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  const labels = sorted.map(s => s[0]);
  const values = sorted.map(s => s[1]);

  if (charts.catPie) charts.catPie.destroy();
  charts.catPie = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: PAL.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '55%',
      plugins: {
        tooltip: { ...TIP, callbacks: { label: item => ` ${item.label}: ${item.raw} products` } },
        legend: {
          display: true, position: 'bottom',
          labels: { padding: 8, usePointStyle: true, pointStyle: 'circle', font: { size: 9, weight: '500' } },
        },
      },
      onClick: (_, elements) => {
        if (elements.length > 0) applyFilter('category', labels[elements[0].index]);
      },
    },
  });
}

/* ==========================================
   PRODUCTS PAGE
   ========================================== */
function renderProductsPage() { filterProductsTable(); }

function populateFilters() {
  const cats = [...new Set(allProducts.map(p => p.main_category))].sort();
  const subs = [...new Set(allProducts.map(p => p.sub_category))].sort();
  const catSel = document.getElementById('productCategoryFilter');
  const subSel = document.getElementById('productSubCatFilter');
  if (!catSel || !subSel) return;
  cats.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; catSel.appendChild(o); });
  subs.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; subSel.appendChild(o); });
}

function filterProductsTable() {
  const cat = document.getElementById('productCategoryFilter')?.value || '';
  const sub = document.getElementById('productSubCatFilter')?.value || '';
  const rat = document.getElementById('productRatingFilter')?.value || '';
  const q = (document.getElementById('productSearchInput')?.value || '').toLowerCase();

  productsTableData = allProducts.filter(p => {
    if (cat && p.main_category !== cat) return false;
    if (sub && p.sub_category !== sub) return false;
    if (rat && p.rating < parseFloat(rat)) return false;
    if (q && !p.product_name.toLowerCase().includes(q)) return false;
    return true;
  });

  productsTableData.sort((a, b) => {
    const av = a[productsSortKey], bv = b[productsSortKey];
    if (typeof av === 'string') return productsSortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    return productsSortAsc ? av - bv : bv - av;
  });

  productsCurrentPage = 1;
  renderProductsTablePage();
}

function sortProductsTable(key) {
  if (productsSortKey === key) productsSortAsc = !productsSortAsc;
  else { productsSortKey = key; productsSortAsc = key === 'product_name'; }
  filterProductsTable();
}

function renderProductsTablePage() {
  const total = productsTableData.length;
  const pages = Math.ceil(total / PER_PAGE);
  const start = (productsCurrentPage - 1) * PER_PAGE;
  const slice = productsTableData.slice(start, start + PER_PAGE);

  document.getElementById('productRecordCount').textContent = `${total} products`;

  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;

  tbody.innerHTML = slice.map(p => {
    const rc = p.rating >= 4 ? 'high' : p.rating >= 3 ? 'mid' : 'low';
    return `<tr>
      <td class="product-name-cell" title="${esc(p.product_name)}">${esc(p.product_name)}</td>
      <td>${esc(p.main_category)}</td>
      <td style="font-size:0.75rem;color:var(--text-secondary);">${esc(p.sub_category)}</td>
      <td><span class="price-green">₹${p.discounted_price.toLocaleString('en-IN')}</span></td>
      <td><span class="price-muted">₹${p.actual_price.toLocaleString('en-IN')}</span></td>
      <td><span class="badge-disc">${p.discount_percentage}%</span></td>
      <td><span class="badge-rating ${rc}">★ ${p.rating}</span></td>
      <td>${p.rating_count.toLocaleString('en-IN')}</td>
    </tr>`;
  }).join('');

  renderPagination(pages);
}

function renderPagination(total) {
  const el = document.getElementById('productsPagination');
  if (!el) return;
  if (total <= 1) { el.innerHTML = ''; return; }
  let h = `<button class="pg-btn" ${productsCurrentPage === 1 ? 'disabled' : ''} onclick="goPage(${productsCurrentPage - 1})">‹</button>`;
  const maxV = 7;
  let s = Math.max(1, productsCurrentPage - 3), e = Math.min(total, s + maxV - 1);
  if (e - s < maxV - 1) s = Math.max(1, e - maxV + 1);
  if (s > 1) { h += `<button class="pg-btn" onclick="goPage(1)">1</button>`; if (s > 2) h += '<span style="color:var(--text-muted);padding:0 4px;">…</span>'; }
  for (let i = s; i <= e; i++) h += `<button class="pg-btn ${i === productsCurrentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
  if (e < total) { if (e < total - 1) h += '<span style="color:var(--text-muted);padding:0 4px;">…</span>'; h += `<button class="pg-btn" onclick="goPage(${total})">${total}</button>`; }
  h += `<button class="pg-btn" ${productsCurrentPage === total ? 'disabled' : ''} onclick="goPage(${productsCurrentPage + 1})">›</button>`;
  el.innerHTML = h;
}

function goPage(p) { productsCurrentPage = p; renderProductsTablePage(); document.getElementById('contentArea').scrollTop = 0; }

/* ==========================================
   CATEGORIES PAGE
   ========================================== */
function renderCategoriesPage() {
  const catMap = buildCatMap();
  const entries = Object.entries(catMap);
  const totalCats = entries.length;
  const sorted = entries.sort((a, b) => b[1].count - a[1].count);
  const topCat = sorted[0];
  const highDisc = entries.sort((a, b) => (b[1].discSum / b[1].count) - (a[1].discSum / a[1].count))[0];
  const bestRat = entries.sort((a, b) => (b[1].ratSum / b[1].count) - (a[1].ratSum / a[1].count))[0];

  document.getElementById('kpiTotalCats').textContent = totalCats;
  if (topCat) { document.getElementById('kpiTopCat').textContent = topCat[0]; document.getElementById('kpiTopCatSub').textContent = `${topCat[1].count} products`; }
  if (highDisc) { document.getElementById('kpiHighDiscCat').textContent = highDisc[0]; document.getElementById('kpiHighDiscCatSub').textContent = `${(highDisc[1].discSum / highDisc[1].count).toFixed(1)}% avg`; }
  if (bestRat) { document.getElementById('kpiBestRatedCat').textContent = bestRat[0]; document.getElementById('kpiBestRatedCatSub').textContent = `${(bestRat[1].ratSum / bestRat[1].count).toFixed(1)} avg`; }

  createCatBarChart(sorted.sort((a, b) => b[1].count - a[1].count));
  createCatRadarChart(catMap);
  createCatDiscountChart(catMap);
  renderCatCompareTable(sorted.sort((a, b) => b[1].count - a[1].count), catMap);
}

function buildCatMap() {
  const m = {};
  filteredProducts.forEach(p => {
    if (!m[p.main_category]) m[p.main_category] = { count: 0, subs: new Set(), priceSum: 0, discSum: 0, ratSum: 0, revSum: 0, saveSum: 0 };
    const c = m[p.main_category]; c.count++; c.subs.add(p.sub_category); c.priceSum += p.discounted_price; c.discSum += p.discount_percentage; c.ratSum += p.rating; c.revSum += p.rating_count; c.saveSum += p.savings;
  });
  return m;
}

function createCatBarChart(sorted) {
  const ctx = document.getElementById('chartCatBar'); if (!ctx) return;
  const labels = sorted.map(s => s[0]); const values = sorted.map(s => s[1].count);
  if (charts.catBar) charts.catBar.destroy();
  charts.catBar = new Chart(ctx, {
    type: 'bar', data: { labels, datasets: [{ data: values, backgroundColor: PAL.slice(0, labels.length), borderRadius: 4, borderSkipped: false, barPercentage: 0.65 }] },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { tooltip: { ...TIP, callbacks: { title: i => i[0].label, label: i => ` ${i.raw} products` } } },
      scales: { x: { grid: GRID, ticks: { font: { size: 10 } } }, y: { grid: { display: false }, ticks: { font: { size: 11, weight: '500' } } } },
      onClick: (_, el) => { if (el.length > 0) applyFilter('category', labels[el[0].index]); } },
  });
}

function createCatRadarChart(catMap) {
  const ctx = document.getElementById('chartCatRadar'); if (!ctx) return;
  const e = Object.entries(catMap).sort((a, b) => b[1].count - a[1].count).slice(0, 8);
  const labels = e.map(x => x[0].length > 14 ? x[0].substring(0, 14) + '…' : x[0]);
  const values = e.map(x => parseFloat((x[1].ratSum / x[1].count).toFixed(2)));
  if (charts.catRadar) charts.catRadar.destroy();
  charts.catRadar = new Chart(ctx, {
    type: 'radar', data: { labels, datasets: [{ data: values, backgroundColor: 'rgba(37,99,235,0.12)', borderColor: C.blue, borderWidth: 2, pointBackgroundColor: C.blue, pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, scales: { r: { beginAtZero: false, min: 2, max: 5, ticks: { stepSize: 0.5, font: { size: 9 }, backdropColor: 'transparent' }, grid: { color: 'rgba(229,231,235,0.4)' }, pointLabels: { font: { size: 10, weight: '500' }, color: '#6B7280' } } },
      plugins: { tooltip: { ...TIP, callbacks: { label: i => ` Avg: ${i.raw}` } } } },
  });
}

function createCatDiscountChart(catMap) {
  const ctx = document.getElementById('chartCatDiscount'); if (!ctx) return;
  const e = Object.entries(catMap).map(([c, d]) => ({ c, a: parseFloat((d.discSum / d.count).toFixed(1)) })).sort((a, b) => b.a - a.a);
  if (charts.catDisc) charts.catDisc.destroy();
  charts.catDisc = new Chart(ctx, {
    type: 'bar', data: { labels: e.map(x => x.c), datasets: [{ data: e.map(x => x.a), backgroundColor: e.map((_, i) => PAL[i % PAL.length] + 'CC'), borderColor: e.map((_, i) => PAL[i % PAL.length]), borderWidth: 1, borderRadius: 4, borderSkipped: false, barPercentage: 0.55 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { tooltip: { ...TIP, callbacks: { label: i => ` ${i.raw}% avg discount` } } },
      scales: { y: { grid: GRID, beginAtZero: true, max: 100, ticks: { font: { size: 10 }, callback: v => v + '%' } }, x: { grid: { display: false }, ticks: { font: { size: 10, weight: '500' }, maxRotation: 45, callback: function(v) { const l = this.getLabelForValue(v); return l.length > 14 ? l.substring(0, 14) + '…' : l; } } } } },
  });
}

function renderCatCompareTable(sorted, catMap) {
  const tbody = document.getElementById('catCompareBody'); if (!tbody) return;
  tbody.innerHTML = sorted.map(([cat, d]) => {
    const rc = (d.ratSum / d.count) >= 4 ? 'high' : (d.ratSum / d.count) >= 3 ? 'mid' : 'low';
    return `<tr><td style="font-weight:500;">${esc(cat)}</td><td>${d.count}</td><td>${d.subs.size}</td><td>₹${Math.round(d.priceSum / d.count).toLocaleString('en-IN')}</td><td><span class="badge-disc">${(d.discSum / d.count).toFixed(1)}%</span></td><td><span class="badge-rating ${rc}">★ ${(d.ratSum / d.count).toFixed(1)}</span></td><td>${fmtNum(d.revSum)}</td><td><span class="badge-save">₹${fmtNum(Math.round(d.saveSum))}</span></td></tr>`;
  }).join('');
}

/* ==========================================
   PRICING PAGE
   ========================================== */
function renderPricingPage() {
  const d = filteredProducts, n = d.length;
  const avg = n > 0 ? Math.round(d.reduce((s, p) => s + p.discounted_price, 0) / n) : 0;
  const hi = n > 0 ? d.reduce((m, p) => p.discounted_price > m.discounted_price ? p : m, d[0]) : null;
  const lo = n > 0 ? d.reduce((m, p) => p.discounted_price < m.discounted_price ? p : m, d[0]) : null;
  const ts = d.reduce((s, p) => s + p.savings, 0);

  document.getElementById('kpiAvgPrice').textContent = '₹' + avg.toLocaleString('en-IN');
  document.getElementById('kpiMaxPrice').textContent = hi ? '₹' + hi.discounted_price.toLocaleString('en-IN') : '—';
  document.getElementById('kpiMinPrice').textContent = lo ? '₹' + lo.discounted_price.toLocaleString('en-IN') : '—';
  document.getElementById('kpiTotSavings').textContent = '₹' + fmtNum(Math.round(ts));

  createPriceRangeChart();
  createScatterChart();
  createDiscTierChart();
  renderTopSavings();
}

function createPriceRangeChart() {
  const ctx = document.getElementById('chartPriceRange'); if (!ctx) return;
  const R = [{ l: '₹0–500', a: 0, b: 500 }, { l: '₹500–1K', a: 500, b: 1000 }, { l: '₹1K–5K', a: 1000, b: 5000 }, { l: '₹5K–15K', a: 5000, b: 15000 }, { l: '₹15K–50K', a: 15000, b: 50000 }, { l: '₹50K+', a: 50000, b: Infinity }];
  const labels = R.map(r => r.l), values = R.map(r => filteredProducts.filter(p => p.discounted_price >= r.a && p.discounted_price < r.b).length);
  const colors = [C.emerald, C.teal, C.cyan, C.blue, C.purple, C.pink];
  if (charts.priceRange) charts.priceRange.destroy();
  charts.priceRange = new Chart(ctx, {
    type: 'bar', data: { labels, datasets: [{ data: values, backgroundColor: colors, borderRadius: 4, borderSkipped: false, barPercentage: 0.6 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { tooltip: { ...TIP, callbacks: { label: i => ` ${i.raw} products` } } },
      scales: { y: { grid: GRID, beginAtZero: true, ticks: { font: { size: 10 } } }, x: { grid: { display: false }, ticks: { font: { size: 10, weight: '500' } } } },
      onClick: (_, el) => { if (el.length > 0) applyFilter('price_range', labels[el[0].index]); } },
  });
}

function createScatterChart() {
  const ctx = document.getElementById('chartScatter'); if (!ctx) return;
  const sd = filteredProducts.slice(0, 300).map(p => ({ x: p.discounted_price, y: p.discount_percentage }));
  if (charts.scatter) charts.scatter.destroy();
  charts.scatter = new Chart(ctx, {
    type: 'scatter', data: { datasets: [{ data: sd, backgroundColor: 'rgba(37,99,235,0.35)', borderColor: 'rgba(37,99,235,0.6)', borderWidth: 1, pointRadius: 3, pointHoverRadius: 5 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { tooltip: { ...TIP, callbacks: { label: i => ` ₹${i.raw.x.toLocaleString('en-IN')} | ${i.raw.y}%` } } },
      scales: { x: { grid: GRID, title: { display: true, text: 'Price (₹)', font: { size: 11, weight: '500' } }, ticks: { font: { size: 10 }, callback: v => fmtCur(v) } }, y: { grid: GRID, title: { display: true, text: 'Discount %', font: { size: 11, weight: '500' } }, ticks: { font: { size: 10 } } } } },
  });
}

function createDiscTierChart() {
  const ctx = document.getElementById('chartDiscTier'); if (!ctx) return;
  const { labels, values } = getDiscData();
  if (charts.discTier) charts.discTier.destroy();
  charts.discTier = new Chart(ctx, {
    type: 'bar', data: { labels, datasets: [{ data: values, backgroundColor: [C.emerald, C.cyan, C.blue, C.amber, C.rose], borderRadius: 4, borderSkipped: false, barPercentage: 0.6 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { tooltip: { ...TIP, callbacks: { label: i => ` ${i.raw} products` } } },
      scales: { y: { grid: GRID, beginAtZero: true, ticks: { font: { size: 10 } } }, x: { grid: { display: false }, ticks: { font: { size: 11, weight: '500' } } } } },
  });
}

function renderTopSavings() {
  const s = [...filteredProducts].sort((a, b) => b.savings - a.savings).slice(0, 15);
  const tbody = document.getElementById('topSavingsBody'); if (!tbody) return;
  tbody.innerHTML = s.map((p, i) => `<tr>
    <td style="color:var(--text-muted);font-weight:500;">${i + 1}</td>
    <td class="product-name-cell" title="${esc(p.product_name)}">${esc(p.product_name)}</td>
    <td style="font-size:0.75rem;">${esc(p.main_category)}</td>
    <td>₹${p.actual_price.toLocaleString('en-IN')}</td>
    <td><span class="price-green">₹${p.discounted_price.toLocaleString('en-IN')}</span></td>
    <td><span class="badge-save">₹${p.savings.toLocaleString('en-IN')}</span></td>
    <td><span class="badge-disc">${p.discount_percentage}%</span></td>
  </tr>`).join('');
}

/* ==========================================
   RATINGS PAGE
   ========================================== */
function renderRatingsPage() {
  const d = filteredProducts, n = d.length;
  const avgR = n > 0 ? (d.reduce((s, p) => s + p.rating, 0) / n).toFixed(1) : 0;
  const f4 = d.filter(p => p.rating >= 4).length;
  const f4p = n > 0 ? ((f4 / n) * 100).toFixed(1) : 0;
  const tr = d.reduce((s, p) => s + p.rating_count, 0);
  const mr = n > 0 ? d.reduce((m, p) => p.rating_count > m.rating_count ? p : m, d[0]) : null;

  document.getElementById('kpiAvgRating2').textContent = avgR;
  document.getElementById('kpi4StarPct').textContent = f4p + '%';
  document.getElementById('kpiTotReviews2').textContent = fmtNum(tr);
  if (mr) { document.getElementById('kpiMostReviewed').textContent = mr.product_name.substring(0, 28) + '…'; document.getElementById('kpiMostReviewedSub').textContent = `${fmtNum(mr.rating_count)} reviews`; }

  createRatDistChart();
  createRatByCatChart();
  createTopReviewed2Chart();
  renderTopRatedTable();
}

function createRatDistChart() {
  const ctx = document.getElementById('chartRatDist'); if (!ctx) return;
  const { labels, values } = getRatingData();
  if (charts.ratDist) charts.ratDist.destroy();
  charts.ratDist = new Chart(ctx, {
    type: 'bar', data: { labels, datasets: [{ data: values, backgroundColor: [C.rose, C.amber, C.cyan, C.emerald], borderRadius: 4, borderSkipped: false, barPercentage: 0.6 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { tooltip: { ...TIP, callbacks: { label: i => ` ${i.raw} products` } } },
      scales: { y: { grid: GRID, beginAtZero: true, ticks: { font: { size: 10 } } }, x: { grid: { display: false }, ticks: { font: { size: 11, weight: '500' } } } } },
  });
}

function createRatByCatChart() {
  const ctx = document.getElementById('chartRatByCat'); if (!ctx) return;
  const m = {}; filteredProducts.forEach(p => { if (!m[p.main_category]) m[p.main_category] = { s: 0, c: 0 }; m[p.main_category].s += p.rating; m[p.main_category].c++; });
  const sorted = Object.entries(m).map(([c, d]) => ({ c, a: parseFloat((d.s / d.c).toFixed(2)) })).sort((a, b) => b.a - a.a);
  if (charts.ratByCat) charts.ratByCat.destroy();
  charts.ratByCat = new Chart(ctx, {
    type: 'bar', data: { labels: sorted.map(s => s.c), datasets: [{ data: sorted.map(s => s.a), backgroundColor: sorted.map((_, i) => PAL[i % PAL.length] + 'CC'), borderColor: sorted.map((_, i) => PAL[i % PAL.length]), borderWidth: 1, borderRadius: 4, borderSkipped: false, barPercentage: 0.55 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { tooltip: { ...TIP, callbacks: { label: i => ` ${i.raw} avg rating` } } },
      scales: { y: { grid: GRID, beginAtZero: false, min: 2, max: 5, ticks: { font: { size: 10 }, stepSize: 0.5 } }, x: { grid: { display: false }, ticks: { font: { size: 10, weight: '500' }, maxRotation: 45, callback: function(v) { const l = this.getLabelForValue(v); return l.length > 14 ? l.substring(0, 14) + '…' : l; } } } } },
  });
}

function createTopReviewed2Chart() {
  const ctx = document.getElementById('chartTopReviewed2'); if (!ctx) return;
  const sorted = [...filteredProducts].sort((a, b) => b.rating_count - a.rating_count).slice(0, 10);
  const labels = sorted.map(p => p.product_name.substring(0, 35));
  const values = sorted.map(p => p.rating_count);
  if (charts.topRev2) charts.topRev2.destroy();
  charts.topRev2 = new Chart(ctx, {
    type: 'bar', data: { labels, datasets: [{ data: values, backgroundColor: PAL.slice(0, labels.length).map(c => c + 'CC'), borderRadius: 4, borderSkipped: false, barPercentage: 0.6 }] },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { tooltip: { ...TIP, callbacks: { title: i => i[0].label, label: i => ` ${i.raw.toLocaleString('en-IN')} reviews` } } },
      scales: { x: { grid: GRID, ticks: { font: { size: 10 }, callback: v => fmtCompact(v) } }, y: { grid: { display: false }, ticks: { font: { size: 10, weight: '500' }, callback: function(v) { const l = this.getLabelForValue(v); return l.length > 26 ? l.substring(0, 26) + '…' : l; } } } } },
  });
}

function renderTopRatedTable() {
  const s = [...filteredProducts].filter(p => p.rating_count >= 100).sort((a, b) => b.rating - a.rating || b.rating_count - a.rating_count).slice(0, 15);
  const tbody = document.getElementById('topRatedBody'); if (!tbody) return;
  tbody.innerHTML = s.map((p, i) => {
    const rc = p.rating >= 4 ? 'high' : p.rating >= 3 ? 'mid' : 'low';
    return `<tr><td style="color:var(--text-muted);font-weight:500;">${i + 1}</td><td class="product-name-cell" title="${esc(p.product_name)}">${esc(p.product_name)}</td><td style="font-size:0.75rem;">${esc(p.main_category)}</td><td><span class="badge-rating ${rc}">★ ${p.rating}</span></td><td>${p.rating_count.toLocaleString('en-IN')}</td><td><span class="price-green">₹${p.discounted_price.toLocaleString('en-IN')}</span></td><td><span class="badge-disc">${p.discount_percentage}%</span></td></tr>`;
  }).join('');
}

/* ==========================================
   CROSS-FILTERING
   ========================================== */
function applyFilter(type, value) {
  activeFilters[type] = value;
  recalculate();
  showFilterBar();
}

function removeFilter(type) {
  delete activeFilters[type];
  recalculate();
  if (Object.keys(activeFilters).length === 0) hideFilterBar();
}

function resetAllFilters() {
  activeFilters = {};
  recalculate();
  hideFilterBar();
}

function recalculate() {
  filteredProducts = allProducts.filter(p => {
    for (const [t, v] of Object.entries(activeFilters)) {
      if (t === 'category' && p.main_category !== v) return false;
      if (t === 'discount_range') {
        const d = p.discount_percentage;
        if (v === '0–20%' && d > 20) return false;
        if (v === '21–40%' && (d <= 20 || d > 40)) return false;
        if (v === '41–60%' && (d <= 40 || d > 60)) return false;
        if (v === '61–80%' && (d <= 60 || d > 80)) return false;
        if (v === '81–100%' && d <= 80) return false;
      }
      if (t === 'rating_range') {
        const r = p.rating;
        if (v === '1–2 ★' && (r < 1 || r >= 2)) return false;
        if (v === '2–3 ★' && (r < 2 || r >= 3)) return false;
        if (v === '3–4 ★' && (r < 3 || r >= 4)) return false;
        if (v === '4–5 ★' && r < 4) return false;
      }
      if (t === 'price_range') {
        const pr = p.discounted_price;
        if (v === '₹0–500' && pr >= 500) return false;
        if (v === '₹500–1K' && (pr < 500 || pr >= 1000)) return false;
        if (v === '₹1K–5K' && (pr < 1000 || pr >= 5000)) return false;
        if (v === '₹5K–15K' && (pr < 5000 || pr >= 15000)) return false;
        if (v === '₹15K–50K' && (pr < 15000 || pr >= 50000)) return false;
        if (v === '₹50K+' && pr < 50000) return false;
      }
      if (t === 'product' && !p.product_name.startsWith(v)) return false;
    }
    return true;
  });
  renderPage(currentPage);
  renderFilterChips();

  // Show/hide reset
  const btn = document.getElementById('btnResetAll');
  if (btn) btn.style.display = Object.keys(activeFilters).length > 0 ? 'inline-flex' : 'none';
}

function showFilterBar() { document.getElementById('filterBar').classList.remove('hidden'); }
function hideFilterBar() { document.getElementById('filterBar').classList.add('hidden'); }

function renderFilterChips() {
  const el = document.getElementById('filterChips'); if (!el) return;
  el.innerHTML = '';
  for (const [t, v] of Object.entries(activeFilters)) {
    const chip = document.createElement('span');
    chip.className = 'filter-chip';
    const tl = { category: 'Category', discount_range: 'Discount', rating_range: 'Rating', price_range: 'Price', product: 'Product' }[t] || t;
    chip.innerHTML = `${tl}: ${v} <span class="close">✕</span>`;
    chip.addEventListener('click', () => removeFilter(t));
    el.appendChild(chip);
  }
}

/* ==========================================
   SHARED DATA GENERATORS
   ========================================== */
function getDiscData() {
  const labels = ['0–20%', '21–40%', '41–60%', '61–80%', '81–100%'];
  const bins = [0, 0, 0, 0, 0];
  filteredProducts.forEach(p => { const d = p.discount_percentage; if (d <= 20) bins[0]++; else if (d <= 40) bins[1]++; else if (d <= 60) bins[2]++; else if (d <= 80) bins[3]++; else bins[4]++; });
  return { labels, values: bins };
}

function getRatingData() {
  const labels = ['1–2 ★', '2–3 ★', '3–4 ★', '4–5 ★'];
  const bins = [0, 0, 0, 0];
  filteredProducts.forEach(p => { const r = p.rating; if (r < 2) bins[0]++; else if (r < 3) bins[1]++; else if (r < 4) bins[2]++; else bins[3]++; });
  return { labels, values: bins };
}

/* ==========================================
   UTILITIES
   ========================================== */
function animVal(id, val) {
  const el = document.getElementById(id); if (!el) return;
  const dur = 500, start = performance.now();
  function upd(now) {
    const p = Math.min((now - start) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = fmtNum(Math.round(val * e));
    if (p < 1) requestAnimationFrame(upd);
  }
  requestAnimationFrame(upd);
}

function fmtNum(n) {
  if (n >= 10000000) return (n / 10000000).toFixed(1) + 'Cr';
  if (n >= 100000) return (n / 100000).toFixed(1) + 'L';
  if (n >= 1000) return n.toLocaleString('en-IN');
  return n.toString();
}

function fmtCur(n) {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1) + 'Cr';
  if (n >= 100000) return '₹' + (n / 100000).toFixed(0) + 'L';
  if (n >= 1000) return '₹' + (n / 1000).toFixed(0) + 'K';
  return '₹' + n;
}

function fmtCompact(v) {
  if (v >= 100000) return (v / 100000).toFixed(0) + 'L';
  if (v >= 1000) return (v / 1000).toFixed(0) + 'K';
  return v;
}

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
