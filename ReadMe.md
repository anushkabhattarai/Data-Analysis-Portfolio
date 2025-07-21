# Ecommerce Sales Dashboard – Power BI Project

## Objective

The goal of this project was to help an ecommerce store owner track and analyze their online sales performance across India. I created an interactive Power BI dashboard to present clear insights on sales, profits, quantities, product categories, states, and payment methods.

---

## Chapter 1: Data Cleanup and Transformation

The data was initially provided in CSV format. I used Power Query in Power BI to clean and transform the data:

- Changed data types appropriately (numbers, dates, text)
- Renamed unclear columns for better understanding
- Promoted the first row to header
- Re-applied data types after transformations
- Used locale-based formatting for region-specific data (e.g., currency, date)

This process ensured the data was ready for modeling and visualization.

---

## Chapter 2: Data Modeling

After the cleanup, I prepared the data model:

- Connected and joined multiple tables as required
- Built relationships between related tables (e.g., product, region, time)
- Created new calculated columns and measures using DAX (e.g., AOV – Average Order Value)
- Enabled user-driven parameters using slicers and filters

These steps made the data flexible and responsive to user inputs within the dashboard.

---

## Chapter 3: Power BI in Action

The final dashboard was designed to be visually engaging and easy to explore. The following visualizations were used:

### Card Visualizations:
- Sum of Amount: 438K
- Sum of Profit: 37K
- Sum of Quantity: 6K
- Average Order Value (AOV): 121K

### Bar Charts:
- Profit by Sub Category (State-wise): Maharashtra, Madhya Pradesh, etc.
- Profit by Sub Category (Product-wise): Tables, Printers, Bookcases, etc.

### Column Chart:
- Profit by Month: Showed time-based trends from January to December

### Donut Charts:
1. Sum of Quantity by Product Category:
   - Clothing: 63%
   - Electronics: 21%
   - Furniture: 17%
2. Sum of Quantity by Payment Mode:
   - COD: 44%
   - UPI: 21%
   - Debit Card: 13%
   - Credit Card: 12%
   - EMI: 10%

### Filters and Slicers:
- Quarter filter (Q1, Q2, Q3, Q4)
- State filter (All/Individual)

---

## Key Insights

- Clothing had the highest quantity sold (63%), indicating strong customer demand.
- Cash on Delivery (COD) was the most popular payment mode at 44%.
- October had the highest profit, suggesting a seasonal peak.
- Maharashtra and Madhya Pradesh contributed significantly to total profit.
- Losses in months like June and December might require further analysis.

---

## Tools and Skills Used

- Power BI (Power Query, DAX, Visualizations)
- Data Cleaning and Wrangling
- Data Modeling and Relationships
- Visualization and Dashboard Design
- CSV File Handling

---

## Learnings

- Built a dashboard from raw data using Power BI
- Applied slicers, filters, and drilldowns for interactivity
- Created calculated fields using DAX
- Designed and organized visual elements for clear communication
- Learned how to extract actionable insights from raw sales data

