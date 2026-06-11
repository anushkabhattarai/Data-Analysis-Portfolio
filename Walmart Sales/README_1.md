# Sales Performance Dashboard — Power BI Custom Visual

A single, self-contained Power BI custom visual (`.pbiviz`) that renders a complete five-tab retail sales dashboard with Power BI–style cross-filtering. Every number — KPIs, charts, tables, correlations and written takeaways — is **calculated live from the data you bind to it**. Nothing is hardcoded.

The visual was built against a 45-store retail network reporting weekly sales over 143 weeks (Feb 2010 – Oct 2012), but it is fully generic: bind any compatible dataset and it recomputes everything.

---

## Table of Contents

- [What this is](#what-this-is)
- [Installation](#installation)
- [Data fields](#data-fields)
- [The dashboard, tab by tab](#the-dashboard-tab-by-tab)
- [Key insights](#key-insights)
- [How the figures are calculated](#how-the-figures-are-calculated)
- [Cross-filtering](#cross-filtering)
- [Technical notes](#technical-notes)

---

## What this is

A packaged Power BI custom visual that reproduces a designed HTML dashboard inside Power BI Desktop. It bundles its own charting engine (Chart.js, embedded inline — custom visuals cannot load external scripts), so it works offline with no dependencies.

**Highlights**

- Five tabs: **Dashboard**, **Seasons & Holidays**, **Stores**, **Drivers**, **Takeaways**.
- Twelve interactive charts plus a sortable store ledger.
- Click any chart element to cross-filter the whole dashboard; click again to undo.
- Selecting a store also filters the rest of your Power BI report.
- A dark, presentation-ready theme with smooth animated charts.
- 100% data-driven — figures recompute whenever the data or filter context changes.

---

## Installation

1. In Power BI Desktop, open the **Visualizations** pane.
2. Click the **⋯** (more options) → **Import a visual from a file**.
3. Select the `.pbiviz` file.
4. Drop the new visual onto the canvas and bind the fields below.

> The visual is unsigned. If your organisation enforces certified-visuals-only, you may need to allow it in **File → Options → Security**, or sign it with `pbiviz package`.

---

## Data fields

| Field well | Required | What to bind | Notes |
|---|:---:|---|---|
| **Store** | ✅ | Store identifier | One series per store |
| **Week Ending Date** | ✅ | A date column | Drives the time axis, year, month and quarter |
| **Weekly Sales** | ✅ | Sales amount | Summed per store-week |
| **Holiday Flag** | ◻ | 0/1 flag for holiday weeks | Enables holiday analytics |
| **Temperature** | ◻ | Weekly temperature | Enables the temperature chart |
| **Fuel Price** | ◻ | Fuel price | Adds to the correlation chart |
| **CPI** | ◻ | Consumer price index | Adds to the correlation chart |
| **Unemployment** | ◻ | Local unemployment rate (%) | Enables the unemployment scatter |

The three required fields (Store, Week Ending Date, Weekly Sales) are the minimum; the optional fields light up additional charts. If any required field is missing, the visual shows a friendly empty state.

---

## The dashboard, tab by tab

### 1. Dashboard (overview)

- **Headline KPI** — total sales for the current filter context, with the date range and week count.
- **Sales trend** — a smoothed weekly sales line. A Gaussian filter removes week-to-week noise so the seasonal shape is clear; gold dots mark holiday weeks at their true value, and the tooltip shows both the raw weekly figure and the smoothed value.
- **Profile & key stats** — an at-a-glance summary: average weekly sales, largest/smallest store, network spread, year-over-year growth and holiday-week lift.
- **Network metrics** — three panels:
  - **Sales Overview** with a **Monthly / Quarterly** toggle that regroups the bars between a 12-month and a 4-quarter view, comparing the two most recent years.
  - **Quarterly Sales** — total sales by quarter across the whole period.
  - **Largest vs Smallest Store** — the biggest and smallest stores compared quarter by quarter.

### 2. Seasons & Holidays

- **Sales by Month** — average weekly sales per store for each calendar month, exposing the seasonal curve.
- **Sales by Year** — total sales per year (with a note that the first/last year may be partial).
- **Holiday-Week Impact** — how much each holiday week beats (or misses) a normal week.

### 3. Stores

- **Total Sales by Store** — every store ranked largest to smallest, with **Best 10 / Lowest 10 / All** views; the steep drop-off shows how concentrated revenue is.
- **Store ledger** — a sortable table: total sales, typical week, best week, volatility (±%) and a consistency rating per store. Click any row to filter by that store.

### 4. Drivers

- **Factor Correlation** — Pearson correlation between weekly sales and each external factor (holiday, fuel, temperature, CPI, unemployment). Near-zero bars mean little or no effect.
- **Sales by Temperature** — average weekly sales grouped into temperature bands.
- **Unemployment vs Sales** — one dot per store: average local unemployment against average weekly revenue.

### 5. Takeaways

Plain-language findings and recommended actions, generated from the live data — biggest/smallest stores, the strongest seasonal effect, the most volatile store, and like-for-like growth.

---

## Key insights

> All figures below were computed from the reference dataset (45 stores × 143 weeks, Feb 2010 – Oct 2012). They are reproduced here as an example of the kind of analysis the dashboard surfaces; your own data will produce its own numbers.

### Headline numbers

| Metric | Value |
|---|---|
| Total network sales | **$6.74B** |
| Average network week | **$47.1M** |
| Best single week | **$80.9M** (week ending 24 Dec 2010) |
| Typical store-week | **$1.05M** |
| Holiday-week lift (overall) | **+7.8%** |

### 1. The calendar drives the business

Sales follow a strong, repeatable seasonal pattern. December is the peak month (≈ **$1.28M** average per store-week) and January is the trough (≈ **$0.92M**) — a swing of roughly **39%** between the slowest and busiest months.

| Holiday week | Lift vs a normal week |
|---|---|
| **Thanksgiving** (Black Friday) | **+41.3%** |
| Super Bowl | +3.6% |
| Labor Day | +0.1% |
| "Christmas" week (week ending 31 Dec) | −7.7% |

Thanksgiving week is by far the biggest single event. The negative "Christmas" figure is a labelling artefact: the dataset tags the *week ending 31 December* as the Christmas week — i.e. **after** the shopping rush. The real spending peak is the week before (which lands in the December total).

### 2. Store size dominates everything

Revenue is highly concentrated. The largest store outsells the smallest by a wide margin:

| | Store | Total sales |
|---|---|---|
| Largest | **Store 20** | **$301.4M** |
| Smallest | **Store 33** | **$37.2M** |
| **Spread** | | **8.1×** |

Store **35** is the most volatile, with weekly sales swinging **±22.9%** around its own average — worth watching for operational or demand instability.

### 3. Weather and the economy barely matter

Every external factor tested is weakly correlated with sales — the calendar and store size explain far more.

| Factor | Correlation with weekly sales |
|---|---|
| Holiday week | +0.037 |
| Fuel price | +0.009 |
| Temperature | −0.064 |
| CPI (prices) | −0.073 |
| Unemployment | −0.106 |

The only mild weather signal: very hot weeks (over 90°F) sell noticeably less (≈ **$0.80M** per store-week) than cool weeks in the 20–40°F band (≈ **$1.10M**). Higher-unemployment areas sell slightly less, but the relationship is weak — several top stores operate in tough job markets.

### 4. Year-over-year performance was essentially flat, then recovered

Because the dataset starts in February 2010 and ends in October 2012, raw annual totals are not comparable. On a **like-for-like basis** (comparing only the months present in both years):

- **2011 vs 2010: ≈ −0.2%** (flat)
- **2012 vs 2011: ≈ +2.6%** (returned to growth)

### What to do about it

- **Plan stock and staffing around Thanksgiving → Christmas** — this short window makes or breaks the year.
- **Use the quiet late-January period** for maintenance, resets and clearance.
- **Learn from the top stores** and investigate the smallest ones — size, location or competition likely explain the gap.
- **Keep an eye on the most volatile store** (Store 35 in the reference data).
- **Don't over-invest in weather/economic forecasting for sales** — the payoff is small.

---

## How the figures are calculated

Everything is derived from the row-level data at runtime:

- **Network/series aggregates** — weekly sales summed across stores, and per store.
- **Seasonality** — average weekly sales per store, grouped by month or quarter.
- **Holiday lift** — average holiday-week sales versus the average non-holiday week, per holiday type.
- **Correlations** — Pearson's *r* between weekly sales and each factor across all store-weeks.
- **Volatility** — coefficient of variation (standard deviation ÷ mean) of each store's weekly sales.
- **Smoothed trend** — a Gaussian-weighted moving average that adapts its window to the number of weeks in view (reduces week-to-week noise by ~84% on the reference data while preserving the seasonal shape).
- **Year-over-year** — compared only across months present in both years, so partial first/last years don't distort the result.

Because the calculations are generic, the dashboard works for any store/date/sales dataset, not just the reference data.

---

## Cross-filtering

The dashboard behaves like native Power BI visuals:

- **Click** a bar, point, row or scatter dot to filter the entire dashboard by that month, quarter, year, holiday or store.
- **Click again** on the same element to remove the filter.
- Active filters appear as removable chips in a filter bar; **Clear all** resets them.
- Selecting a **store** additionally applies a report-level filter, so the rest of your Power BI page filters to that store too.

---

## Technical notes

- **Self-contained.** Chart.js and the data-labels plugin are bundled inline; the visual makes no external network calls.
- **API version:** Power BI Custom Visuals API 5.3.0.
- **Row capacity:** up to 30,000 store-weeks per refresh.
- **Performance:** charts rebuild only when the underlying data changes; pure resizes just re-fit the existing charts.
- **Theme:** dark UI with a teal accent, Inter typography, responsive layout that scrolls vertically within the visual frame.

---

## License

Provided as-is for internal analytics and demonstration. Add your preferred license here before publishing.

---

*Built by Infin Consultants.*
