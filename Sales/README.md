<<<<<<< HEAD
<div align="center">

# 🛍️ Amazon Sales Insights Dashboard

### End-to-end retail analytics on ~1,350 Amazon India products

*Python cleaning pipeline · Custom web dashboard · Power BI report*

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)
![Power BI](https://img.shields.io/badge/Power%20BI-F2C811?style=for-the-badge&logo=powerbi&logoColor=black)

![Products](https://img.shields.io/badge/Products-1%2C350-4C78A8?style=flat-square)
![Categories](https://img.shields.io/badge/Categories-9-17BECF?style=flat-square)
![Pages](https://img.shields.io/badge/Dashboard%20Pages-3-F58518?style=flat-square)
![Currency](https://img.shields.io/badge/Currency-INR%20%E2%82%B9-54A24B?style=flat-square)

</div>

---

## 🎯 Project Overview

This project answers one question: **where is the revenue, and which products are pulling their weight?**

Starting from a raw, messy CSV of Amazon India listings (prices in rupees with ₹ symbols and commas, pipe-delimited category strings, duplicate listings, and missing fields), the project:

1. 🧹 **Cleans and standardizes** the data using a reproducible Python script
2. 📦 **Produces a structured JSON** dataset ready for a front-end dashboard
3. 📊 **Presents the insights** through a custom multi-page web dashboard (HTML / CSS / JavaScript + Chart.js) and a parallel Power BI report

---

## ✨ Key Features

- **Business Overview** — KPI strip showing total products, average discount, average rating, total reviews, and total savings; revenue-and-profit trend over a rolling 12-month view; category revenue treemap; monthly performance bars
- **Product Explorer** — searchable, filterable product table with category pills, rating filter, and price-range controls
- **Segmentation View** — breaks the catalog into performance tiers by price, discount, and rating to isolate top performers vs. underperformers
- **Cross-filtering** — clicking a category anywhere on the dashboard filters every other chart on the page
- **Power BI Report** — the same dataset surfaced through Power BI visuals (`.pbix`) for stakeholders who prefer the Microsoft BI stack

---

## 📦 Dataset
=======
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
>>>>>>> fb71fce105f41473abddd5a8db66c689fc63c950

- **Source:** Amazon India product listings (`amazon.csv`)
- **Size:** ~1,350 cleaned products after dedup and validation
- **Fields used:** product id, name, category hierarchy, discounted price, actual price, discount percentage, rating, rating count
- **Currency:** Indian Rupees (INR / ₹)

<<<<<<< HEAD
---

## 🧹 Data Cleaning Pipeline
=======
## Data Cleaning Pipeline
>>>>>>> fb71fce105f41473abddd5a8db66c689fc63c950

`clean_data.py` handles the full cleanup:

- Parses currency strings (`₹1,099`) into floats
- Converts discount percentages (`64%`) and rating counts (`24,269`) into numeric types
<<<<<<< HEAD
- Splits pipe-delimited category strings (`Computers&Accessories|Accessories&Peripherals|...`) into clean main and sub-category fields — adds spaces around `&` and breaks up CamelCase
=======
- Splits pipe-delimited category strings (`Computers&Accessories|Accessories&Peripherals|...`) into clean main and sub-category fields, inserting spaces around `&` and breaking up CamelCase
>>>>>>> fb71fce105f41473abddd5a8db66c689fc63c950
- Truncates overly long product names
- Removes duplicate product ids, rows missing critical fields, and rows with invalid prices
- Swaps discounted and actual prices when the data is inverted
- Recomputes `savings` and fills in missing discount percentages from first principles
- Clamps ratings to 0–5 and discounts to 0–100
- Writes a clean `data.json` with the product list, aggregate summary statistics, and a cleaning report (rows in / rows out / drops by reason)

<<<<<<< HEAD
---

## 🛠️ Tech Stack

**Data cleaning:** Python 3 (standard library only — `csv`, `json`, `re`)

**Front-end dashboard:** HTML, CSS, vanilla JavaScript

**Charting:** Chart.js 4 (via CDN)

**BI report:** Microsoft Power BI (`.pbix`) and custom Power BI visuals (`.pbiviz`)

---

## 📁 Project Structure
=======
## Tech Stack

- **Data cleaning:** Python 3 (standard library only — `csv`, `json`, `re`)
- **Front-end dashboard:** HTML, CSS, vanilla JavaScript
- **Charting:** Chart.js 4 (via CDN)
- **BI report:** Microsoft Power BI (.pbix) and a custom Power BI visual (.pbiviz)

## Project Structure
>>>>>>> fb71fce105f41473abddd5a8db66c689fc63c950

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

<<<<<<< HEAD
---

## ▶️ How to Run

### 1. Regenerate the cleaned data (optional)

=======
## How to Run

### 1. Regenerate the cleaned data (optional)

If you want to rerun the cleaning step against `amazon.csv`:

>>>>>>> fb71fce105f41473abddd5a8db66c689fc63c950
```bash
cd Sales
python clean_data.py
```

<<<<<<< HEAD
This overwrites `data.json` and prints a full cleaning report to the console.

### 2. Launch the web dashboard

The dashboard loads `data.json` via `fetch`, so it needs to be served from a local web server (browsers block local-file fetches by default):
=======
This will overwrite `data.json` and print a full cleaning report to the console.

### 2. Launch the web dashboard

Because the dashboard loads `data.json` via `fetch`, it needs to be served from a local web server (opening the HTML file directly won't work due to browser CORS rules for local files):
>>>>>>> fb71fce105f41473abddd5a8db66c689fc63c950

```bash
cd Sales
python -m http.server 8000
```

<<<<<<< HEAD
Then open [http://localhost:8000/index.html](http://localhost:8000/index.html) in your browser.
=======
Then open http://localhost:8000/index.html in your browser.
>>>>>>> fb71fce105f41473abddd5a8db66c689fc63c950

### 3. Open the Power BI report

Open `SalesDashboard.pbix` in Microsoft Power BI Desktop.

<<<<<<< HEAD
---

## 💡 Key Insights

- **Discount depth is real, not cosmetic.** Average discount sits comfortably above 40%, with certain sub-categories routinely marked down 60%+.
- **Rating concentration.** A handful of sub-categories carry a disproportionate share of total reviews — that's where customer attention and purchase volume actually live.
- **Category imbalance.** Electronics and accessories dominate the catalog by product count, but share-of-revenue looks different once price is factored in — which is exactly what the category treemap surfaces.

---

## 👤 About

Part of my broader [Data Analysis Portfolio](https://github.com/anushkabhattarai/Data-Analysis-Portfolio). I'm a data & business analyst focused on turning messy raw data into clean, decision-ready insights — across Python, SQL, Power BI, and web-based dashboards.

[![Email](https://img.shields.io/badge/Email-D14836?style=flat&logo=gmail&logoColor=white)](mailto:anushkabhattarai@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/anushka-bhattarai-789aa5238/)
[![Portfolio](https://img.shields.io/badge/Portfolio-FF4F8B?style=flat&logo=canva&logoColor=white)](https://anneushka.my.canva.site/data-analyst-portfolio)
=======
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
>>>>>>> fb71fce105f41473abddd5a8db66c689fc63c950
