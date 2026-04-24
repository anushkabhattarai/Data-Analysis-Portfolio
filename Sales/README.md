# Amazon Sales Insights Dashboard

An end-to-end retail analytics project built on an Amazon India product catalog. The project combines a Python data-cleaning pipeline, an interactive multi-page web dashboard, and a parallel Power BI report to explore pricing, discounts, ratings, and category performance across roughly 1,350 products spanning 9 main categories.

## Project Overview

This project answers a simple question: **where is the revenue, and which products are pulling their weight?**

Starting from a raw, messy CSV of Amazon India listings (prices in rupees with symbols and commas, inconsistent categories in pipe-delimited strings, duplicate listings, and missing fields), the project:

1. Cleans and standardizes the data using a reproducible Python script.
2. Produces a structured JSON dataset ready for consumption by a front-end dashboard.
3. Presents the insights through a custom web dashboard (HTML / CSS / JavaScript with Chart.js) and a complementary Power BI report.

## Key Features

- **Business Overview** — KPI strip showing total products, average discount, average rating, total reviews, and total savings; revenue-and-profit trend over a rolling 12-month view; category revenue treemap; monthly performance bars.
- **Product Explorer** — searchable, filterable product table with category pills, rating filter, and price range controls.
- **Segmentation View** — breaks the catalog into performance tiers by price, discount, and rating so you can isolate top performers vs. underperformers.
- **Cross-filtering** — clicking a category anywhere on the dashboard filters every other chart on the page.
- **Power BI Report** — the same dataset surfaced through Power BI visuals (.pbix) for stakeholders who prefer working in the Microsoft BI stack.

## Dataset

- **Source:** Amazon India product listings (`amazon.csv`)
- **Size:** ~1,350 cleaned products after dedup and validation
- **Fields used:** product id, name, category hierarchy, discounted price, actual price, discount percentage, rating, rating count
- **Currency:** Indian Rupees (INR / ₹)

## Data Cleaning Pipeline

`clean_data.py` handles the full cleanup:

- Parses currency strings (`₹1,099`) into floats
- Converts discount percentages (`64%`) and rating counts (`24,269`) into numeric types
- Splits pipe-delimited category strings (`Computers&Accessories|Accessories&Peripherals|...`) into clean main and sub-category fields, inserting spaces around `&` and breaking up CamelCase
- Truncates overly long product names
- Removes duplicate product ids, rows missing critical fields, and rows with invalid prices
- Swaps discounted and actual prices when the data is inverted
- Recomputes `savings` and fills in missing discount percentages from first principles
- Clamps ratings to 0–5 and discounts to 0–100
- Writes a clean `data.json` with the product list, aggregate summary statistics, and a cleaning report (rows in / rows out / drops by reason)

## Tech Stack

- **Data cleaning:** Python 3 (standard library only — `csv`, `json`, `re`)
- **Front-end dashboard:** HTML, CSS, vanilla JavaScript
- **Charting:** Chart.js 4 (via CDN)
- **BI report:** Microsoft Power BI (.pbix) and a custom Power BI visual (.pbiviz)

## Project Structure

```
Sales/
├── amazon.csv                   # Raw Amazon India product data
├── clean_data.py                # Python cleaning & transformation script
├── data.json                    # Cleaned output consumed by the dashboard
│
├── index.html                   # Business Overview page
├── products.html                # Product explorer page
├── segmentation.html            # Segmentation page
├── dashboard.js                 # Shared dashboard logic (charts, filters)
├── dashboard.css                # Dashboard layout and theming
├── app.js                       # App-wide behaviour (sidebar, routing)
├── styles.css                   # App-wide styles
│
├── SalesDashboard.pbix          # Power BI report
├── Sales_Dashboard.pbix         # Alternate Power BI report
├── SalesDashboard.pbiviz        # Custom Power BI visual
└── SalesPage1_Dashboard.pbiviz  # Custom Power BI visual (overview page)
```

## How to Run

### 1. Regenerate the cleaned data (optional)

If you want to rerun the cleaning step against `amazon.csv`:

```bash
cd Sales
python clean_data.py
```

This will overwrite `data.json` and print a full cleaning report to the console.

### 2. Launch the web dashboard

Because the dashboard loads `data.json` via `fetch`, it needs to be served from a local web server (opening the HTML file directly won't work due to browser CORS rules for local files):

```bash
cd Sales
python -m http.server 8000
```

Then open http://localhost:8000/index.html in your browser.

### 3. Open the Power BI report

Open `SalesDashboard.pbix` in Microsoft Power BI Desktop.

## Key Insights

A few observations the dashboard surfaces:

- **Discount depth is real, not cosmetic.** The average discount across the catalog sits comfortably above 40%, with certain sub-categories routinely marked down by 60% or more.
- **Rating concentration.** A handful of sub-categories carry a disproportionate share of total reviews, suggesting where customer attention and purchase volume actually live.
- **Category imbalance.** Electronics and accessories dominate the catalog by product count, but share-of-revenue can look quite different once price is factored in — which is exactly what the category treemap is designed to show.

## About

Part of my broader [Data Analysis Portfolio](https://github.com/anushkabhattarai/Data-Analysis-Portfolio). I'm a data & business analyst focused on turning messy raw data into clean, decision-ready insights — across Python, SQL, Power BI, and web-based dashboards.

- **Email:** anushkabhattarai@gmail.com
- **LinkedIn:** https://www.linkedin.com/in/anushka-bhattarai-789aa5238/
- **Portfolio website:** https://anneushka.my.canva.site/data-analyst-portfolio
