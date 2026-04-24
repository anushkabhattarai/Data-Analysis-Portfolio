/* ============================================================
   Amazon Insights Dashboard — Shared runtime
   Data loader · formatters · cross-filter state · chart helpers
   ============================================================ */

(function (global) {
  'use strict';

  // -----------------------------------------------------------
  // DATA LOADING
  // -----------------------------------------------------------
  async function loadData() {
    try {
      const res = await fetch('data.json');
      if (!res.ok) throw new Error('fetch failed');
      return await res.json();
    } catch (e) {
      console.error('Could not load data.json', e);
      // Offline fallback — visible banner
      const banner = document.createElement('div');
      banner.style.cssText = 'background:#FEF3C7;color:#92400E;padding:10px;text-align:center;font-size:13px;font-weight:500;border-radius:8px;margin:12px;';
      banner.innerHTML = '⚠️ Could not load data.json. Please run this dashboard via a local web server (e.g. <code>python -m http.server</code>).';
      document.body.prepend(banner);
      return { products: [], summary: {} };
    }
  }

  // -----------------------------------------------------------
  // FORMATTERS — Indian-rupee-ish, crore/lakh scale
  // -----------------------------------------------------------
  function fmt(n, decimals = 1) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    const abs = Math.abs(n);
    if (abs >= 1e7) return (n / 1e7).toFixed(decimals) + ' Cr';
    if (abs >= 1e5) return (n / 1e5).toFixed(decimals) + ' L';
    if (abs >= 1e3) return (n / 1e3).toFixed(decimals) + 'K';
    return Math.round(n).toLocaleString();
  }

  function fmtINR(n, decimals = 1) {
    return '₹' + fmt(n, decimals);
  }

  function fmtINRFull(n) {
    if (n === null || n === undefined) return '—';
    return '₹' + Math.round(n).toLocaleString('en-IN');
  }

  function fmtInt(n) {
    if (n === null || n === undefined) return '—';
    return Math.round(n).toLocaleString('en-IN');
  }

  function fmtPct(n, decimals = 1) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    return n.toFixed(decimals) + '%';
  }

  // -----------------------------------------------------------
  // DERIVED METRICS
  //   Since the dataset has no time/region/customer-txn fields,
  //   we use well-defined PROXIES:
  //     · rating_count ≈ units sold (reviews correlate w/ orders)
  //     · revenue      = discounted_price × rating_count
  //     · est profit   = (discounted_price × 0.22) × rating_count
  //                      (assume a blended 22% gross margin on
  //                       discounted price — transparent & editable)
  //     · customer savings = (actual - discounted) × rating_count
  // -----------------------------------------------------------
  const MARGIN = 0.22;

  function enrich(products) {
    return products.map(p => {
      const units = p.rating_count || 0;
      const revenue = (p.discounted_price || 0) * units;
      const profit = revenue * MARGIN;
      const shopperSavings = (p.savings || 0) * units;
      return {
        ...p,
        units,
        revenue,
        profit,
        shopperSavings,
      };
    });
  }

  // -----------------------------------------------------------
  // CROSS-FILTER STATE
  //   Pages subscribe to changes; any visual can publish a filter.
  // -----------------------------------------------------------
  function createStore(all) {
    const subscribers = [];
    const state = {
      category: null,       // string or null
      subcategory: null,    // string or null
      discountBucket: null, // string or null
      ratingBand: null,     // string or null
      priceBand: null,      // string or null
      search: '',           // product-name query
      segment: null,        // string or null (segmentation page)
    };

    function notify() {
      const filtered = applyFilters(all, state);
      subscribers.forEach(fn => fn(filtered, state));
    }

    return {
      state,
      getAll: () => all,
      getFiltered: () => applyFilters(all, state),
      set(patch) {
        Object.assign(state, patch);
        notify();
      },
      reset() {
        Object.keys(state).forEach(k => { state[k] = (k === 'search' ? '' : null); });
        notify();
      },
      subscribe(fn) { subscribers.push(fn); },
      notify,
    };
  }

  function applyFilters(all, s) {
    return all.filter(p => {
      if (s.category && p.main_category !== s.category) return false;
      if (s.subcategory && p.sub_category !== s.subcategory) return false;
      if (s.discountBucket) {
        const b = discountBucket(p.discount_percentage);
        if (b !== s.discountBucket) return false;
      }
      if (s.ratingBand) {
        const b = ratingBand(p.rating);
        if (b !== s.ratingBand) return false;
      }
      if (s.priceBand) {
        const b = priceBand(p.discounted_price);
        if (b !== s.priceBand) return false;
      }
      if (s.segment) {
        const seg = customerSegment(p);
        if (seg !== s.segment) return false;
      }
      if (s.search) {
        const q = s.search.toLowerCase();
        if (!p.product_name.toLowerCase().includes(q) &&
            !p.main_category.toLowerCase().includes(q) &&
            !p.sub_category.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }

  // -----------------------------------------------------------
  // BUCKETS
  // -----------------------------------------------------------
  function discountBucket(d) {
    if (d === null || d === undefined) return 'No discount';
    if (d >= 70) return 'Deep (70 %+)';
    if (d >= 50) return 'High (50–69 %)';
    if (d >= 30) return 'Mid (30–49 %)';
    if (d >= 10) return 'Light (10–29 %)';
    return 'None (<10 %)';
  }

  function ratingBand(r) {
    if (r >= 4.5) return 'Excellent (4.5+)';
    if (r >= 4.0) return 'Great (4.0–4.4)';
    if (r >= 3.5) return 'Good (3.5–3.9)';
    if (r >= 3.0) return 'Fair (3.0–3.4)';
    return 'Poor (<3.0)';
  }

  function priceBand(p) {
    if (p >= 10000) return 'Premium (₹10K+)';
    if (p >= 3000) return 'Upper (₹3–10K)';
    if (p >= 1000) return 'Mid (₹1–3K)';
    if (p >= 300) return 'Value (₹300–1K)';
    return 'Budget (<₹300)';
  }

  // Customer segment: 2-axis — Spend × Engagement (review/units)
  //  · Champions: high-price × high-units (big-basket enthusiasts)
  //  · Loyalists: mid-price × high-units (frequent buyers)
  //  · Bargain-Hunters: high-discount × high-units
  //  · Premium-Seekers: high-price × low-units (occasional splurge)
  //  · At-Risk: low-rating × mid-units
  //  · Casual: low price × low engagement
  function customerSegment(p) {
    const price = p.discounted_price || 0;
    const units = p.units || p.rating_count || 0;
    const rating = p.rating || 0;
    const disc = p.discount_percentage || 0;

    if (rating < 3.5 && units > 1000) return 'At-Risk';
    if (price >= 5000 && units >= 5000) return 'Champions';
    if (price >= 5000 && units < 5000) return 'Premium Seekers';
    if (disc >= 60 && units >= 5000) return 'Bargain Hunters';
    if (units >= 20000) return 'Loyalists';
    if (rating >= 4.3 && units >= 3000) return 'Advocates';
    return 'Casual';
  }

  const SEGMENTS = [
    { key: 'Champions',       color: '#7C3AED', desc: 'High spend · high volume' },
    { key: 'Loyalists',       color: '#2563EB', desc: 'Frequent mid-ticket buyers' },
    { key: 'Advocates',       color: '#0EA5A4', desc: 'Raving high-rating cohort' },
    { key: 'Bargain Hunters', color: '#D97706', desc: 'Discount-driven volume' },
    { key: 'Premium Seekers', color: '#DB2777', desc: 'High spend · low frequency' },
    { key: 'At-Risk',         color: '#E11D48', desc: 'Unhappy post-purchase' },
    { key: 'Casual',          color: '#64748B', desc: 'Low engagement, long-tail' },
  ];

  // -----------------------------------------------------------
  // AGGREGATORS
  // -----------------------------------------------------------
  function groupSum(items, key, sumKey) {
    const m = new Map();
    items.forEach(p => {
      const k = p[key];
      m.set(k, (m.get(k) || 0) + (p[sumKey] || 0));
    });
    return [...m.entries()].map(([k, v]) => ({ key: k, value: v }));
  }

  function groupAggregate(items, key) {
    const m = new Map();
    items.forEach(p => {
      const k = p[key];
      if (!m.has(k)) m.set(k, { key: k, count: 0, revenue: 0, profit: 0, units: 0, savings: 0, ratingSum: 0, discSum: 0 });
      const g = m.get(k);
      g.count += 1;
      g.revenue += p.revenue || 0;
      g.profit += p.profit || 0;
      g.units += p.units || 0;
      g.savings += p.shopperSavings || 0;
      g.ratingSum += p.rating || 0;
      g.discSum += p.discount_percentage || 0;
    });
    return [...m.values()].map(g => ({
      ...g,
      avgRating: g.count ? g.ratingSum / g.count : 0,
      avgDiscount: g.count ? g.discSum / g.count : 0,
    }));
  }

  // -----------------------------------------------------------
  // COLORS — sequential blue scale for heatmap
  // -----------------------------------------------------------
  function blueScale(t) {
    // t in [0,1]; returns hex
    t = Math.max(0, Math.min(1, t));
    const stops = [
      [239, 246, 255], // #EFF6FF
      [219, 234, 254], // #DBEAFE
      [147, 197, 253], // #93C5FD
      [59, 130, 246],  // #3B82F6
      [29, 78, 216],   // #1D4ED8
    ];
    const i = t * (stops.length - 1);
    const lo = Math.floor(i), hi = Math.ceil(i), f = i - lo;
    const a = stops[lo], b = stops[hi];
    const r = Math.round(a[0] + (b[0] - a[0]) * f);
    const g = Math.round(a[1] + (b[1] - a[1]) * f);
    const bch = Math.round(a[2] + (b[2] - a[2]) * f);
    return `rgb(${r},${g},${bch})`;
  }

  // -----------------------------------------------------------
  // TREEMAP (squarified, simple greedy)
  // -----------------------------------------------------------
  function squarify(items, x, y, w, h) {
    items = items.slice().sort((a, b) => b.value - a.value);
    const total = items.reduce((s, i) => s + i.value, 0);
    const cells = [];
    let rect = { x, y, w, h };
    let row = [];
    let rowTotal = 0;
    const remaining = items.slice();

    function worst(row, len) {
      const sum = row.reduce((s, r) => s + r.value, 0);
      const rMin = Math.min(...row.map(r => r.value));
      const rMax = Math.max(...row.map(r => r.value));
      const s2 = (sum * sum) / (len * len);
      return Math.max((len * len * rMax) / s2, s2 / (len * len * rMin));
    }

    function layoutRow(row, rect, horizontal) {
      const sum = row.reduce((s, r) => s + r.value, 0);
      const areaFraction = sum / total;
      if (horizontal) {
        const rowHeight = rect.h * areaFraction;
        let cx = rect.x;
        row.forEach(r => {
          const cellW = rect.w * (r.value / sum);
          cells.push({ ...r, x: cx, y: rect.y, w: cellW, h: rowHeight });
          cx += cellW;
        });
        return { x: rect.x, y: rect.y + rowHeight, w: rect.w, h: rect.h - rowHeight };
      } else {
        const rowWidth = rect.w * areaFraction;
        let cy = rect.y;
        row.forEach(r => {
          const cellH = rect.h * (r.value / sum);
          cells.push({ ...r, x: rect.x, y: cy, w: rowWidth, h: cellH });
          cy += cellH;
        });
        return { x: rect.x + rowWidth, y: rect.y, w: rect.w - rowWidth, h: rect.h };
      }
    }

    // Reset — use total-scaled areas
    items.forEach(i => (i._area = (i.value / total) * (w * h)));

    function _sq(items, rect) {
      if (!items.length) return;
      const horizontal = rect.w >= rect.h;
      const len = horizontal ? rect.h : rect.w;
      let row = [];
      let rowArea = 0;
      let prevWorst = Infinity;

      for (let i = 0; i < items.length; i++) {
        const next = items[i];
        const nextRow = row.concat(next);
        const nextArea = rowArea + next._area;
        const rowValues = nextRow.map(r => r._area);
        const rMin = Math.min(...rowValues);
        const rMax = Math.max(...rowValues);
        const s2 = (nextArea * nextArea) / (len * len);
        const worstNext = Math.max((len * len * rMax) / s2, s2 / (len * len * rMin));

        if (worstNext <= prevWorst) {
          row = nextRow;
          rowArea = nextArea;
          prevWorst = worstNext;
        } else {
          // lay out current row
          const sum = row.reduce((s, r) => s + r._area, 0);
          if (horizontal) {
            const rh = sum / rect.w;
            let cx = rect.x;
            row.forEach(r => {
              const cw = r._area / rh;
              cells.push({ ...r, x: cx, y: rect.y, w: cw, h: rh });
              cx += cw;
            });
            _sq(items.slice(i), { x: rect.x, y: rect.y + rh, w: rect.w, h: rect.h - rh });
          } else {
            const rw = sum / rect.h;
            let cy = rect.y;
            row.forEach(r => {
              const ch = r._area / rw;
              cells.push({ ...r, x: rect.x, y: cy, w: rw, h: ch });
              cy += ch;
            });
            _sq(items.slice(i), { x: rect.x + rw, y: rect.y, w: rect.w - rw, h: rect.h });
          }
          return;
        }
      }
      // layout final row at end
      const sum = row.reduce((s, r) => s + r._area, 0);
      if (!sum) return;
      if (horizontal) {
        const rh = Math.min(sum / rect.w, rect.h);
        let cx = rect.x;
        row.forEach(r => {
          const cw = r._area / rh;
          cells.push({ ...r, x: cx, y: rect.y, w: cw, h: rh });
          cx += cw;
        });
      } else {
        const rw = Math.min(sum / rect.h, rect.w);
        let cy = rect.y;
        row.forEach(r => {
          const ch = r._area / rw;
          cells.push({ ...r, x: rect.x, y: cy, w: rw, h: ch });
          cy += ch;
        });
      }
    }

    _sq(items, { x, y, w, h });
    return cells;
  }

  // -----------------------------------------------------------
  // TOOLTIP
  // -----------------------------------------------------------
  let ttEl;
  function getTip() {
    if (!ttEl) {
      ttEl = document.createElement('div');
      ttEl.className = 'tt';
      document.body.appendChild(ttEl);
    }
    return ttEl;
  }
  function showTip(html, evt) {
    const el = getTip();
    el.innerHTML = html;
    const x = evt.clientX;
    const y = evt.clientY - 12;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.classList.add('show');
  }
  function hideTip() {
    if (ttEl) ttEl.classList.remove('show');
  }

  // -----------------------------------------------------------
  // STARS
  // -----------------------------------------------------------
  function stars(rating) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    const emp = 5 - full - (half ? 1 : 0);
    return '★'.repeat(full) + (half ? '⯨' : '') + '☆'.repeat(emp);
  }

  // -----------------------------------------------------------
  // NAV ACTIVE
  // -----------------------------------------------------------
  function markActiveNav() {
    const here = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === here) a.classList.add('active');
    });
  }

  // -----------------------------------------------------------
  // CHART.JS GLOBAL DEFAULTS
  // -----------------------------------------------------------
  function configureChartDefaults() {
    if (!global.Chart) return;
    const C = global.Chart;
    C.defaults.font.family = 'Inter, sans-serif';
    C.defaults.font.size = 11.5;
    C.defaults.color = '#475569';
    C.defaults.borderColor = '#F1F5F9';
    C.defaults.plugins.legend.labels.boxWidth = 10;
    C.defaults.plugins.legend.labels.boxHeight = 10;
    C.defaults.plugins.legend.labels.padding = 14;
    C.defaults.plugins.legend.labels.usePointStyle = true;
    C.defaults.plugins.tooltip.backgroundColor = '#0F172A';
    C.defaults.plugins.tooltip.titleFont = { size: 11, weight: 600 };
    C.defaults.plugins.tooltip.bodyFont = { size: 12 };
    C.defaults.plugins.tooltip.padding = 10;
    C.defaults.plugins.tooltip.cornerRadius = 6;
    C.defaults.plugins.tooltip.boxPadding = 6;
    C.defaults.elements.line.borderWidth = 2;
    C.defaults.elements.line.tension = 0.35;
    C.defaults.elements.point.radius = 0;
    C.defaults.elements.point.hoverRadius = 5;
    C.defaults.elements.bar.borderRadius = 4;
    C.defaults.elements.bar.borderSkipped = false;
  }

  // -----------------------------------------------------------
  // DETERMINISTIC PSEUDO-RANDOM (for "monthly" synthetic shapes)
  //   Since the raw data has no timestamps, trend lines and monthly
  //   bars are generated deterministically from product IDs — the
  //   same dataset always produces the same shape.
  // -----------------------------------------------------------
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967295;
  }

  // Distribute a total over N months with a deterministic, seasonal
  // shape keyed by categories present. Q4 holiday lift is retained.
  function monthlySpread(totalValue, seedKey = 'all') {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const seasonal = [0.74, 0.78, 0.86, 0.88, 0.92, 0.95, 0.98, 1.02, 1.04, 1.12, 1.28, 1.42];
    const noise = months.map((m, i) => 0.92 + 0.16 * hash(seedKey + m + i));
    const raw = seasonal.map((s, i) => s * noise[i]);
    const sum = raw.reduce((a, b) => a + b, 0);
    return months.map((m, i) => ({ month: m, value: totalValue * (raw[i] / sum) }));
  }

  // Weekly shipping/delivery distribution — deterministic
  function weekdaySpread(totalValue, seedKey = 'ship') {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const shape = [1.12, 1.08, 1.04, 1.00, 0.96, 0.82, 0.98];
    const noise = days.map((d, i) => 0.95 + 0.10 * hash(seedKey + d + i));
    const raw = shape.map((s, i) => s * noise[i]);
    const sum = raw.reduce((a, b) => a + b, 0);
    return days.map((d, i) => ({ day: d, value: totalValue * (raw[i] / sum) }));
  }

  // -----------------------------------------------------------
  // SIDEBAR TEMPLATE — injected by each page for DRY
  // -----------------------------------------------------------
  function sidebarHTML(active) {
    const items = [
      { href: 'index.html',        label: 'Overview',          key: 'overview',
        icon: '<path d="M3 12L12 3l9 9"/><path d="M5 10v10h14V10"/>' },
      { href: 'segmentation.html', label: 'Customer Segments', key: 'segments',
        icon: '<circle cx="9" cy="9" r="4"/><path d="M17 11a3 3 0 100-6 3 3 0 000 6z"/><path d="M2 20c0-4 3-6 7-6s7 2 7 6"/><path d="M15 20c0-3 2-5 5-5"/>' },
      { href: 'products.html',     label: 'Product Insights',  key: 'products',
        icon: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>' },
    ];
    const navHtml = items.map(i => `
      <a href="${i.href}" class="${i.key === active ? 'active' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${i.icon}</svg>
        <span>${i.label}</span>
      </a>`).join('');

    return `
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">aI</div>
          <div>
            <div class="brand-name">Amazon Insights</div>
            <div class="brand-sub">Retail Intelligence</div>
          </div>
        </div>
        <div class="nav-label">Workspace</div>
        <nav class="nav">${navHtml}</nav>
        <div class="sidebar-foot">
          <div class="user">
            <div class="avatar">XI</div>
            <div>
              <div style="color:var(--ink-800);font-weight:500;font-size:13px;">XInfin</div>
              <div style="font-size:11px;">Analyst</div>
            </div>
          </div>
        </div>
      </aside>`;
  }

  // -----------------------------------------------------------
  // EXPORT
  // -----------------------------------------------------------
  global.Dash = {
    loadData, enrich,
    fmt, fmtINR, fmtINRFull, fmtInt, fmtPct,
    createStore, applyFilters,
    discountBucket, ratingBand, priceBand, customerSegment, SEGMENTS,
    groupSum, groupAggregate,
    blueScale, squarify,
    showTip, hideTip,
    stars, markActiveNav,
    configureChartDefaults,
    monthlySpread, weekdaySpread, hash,
    sidebarHTML,
    MARGIN,
  };
})(window);
