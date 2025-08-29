# Pizza Sales Data Analysis Portfolio

## Overview

This project demonstrates a comprehensive SQL-based analysis on a fictional pizza sales dataset. The goal is to uncover business insights such as total revenue, order patterns, customer preferences, and performance of different pizza categories and types. The project showcases practical SQL skills often used in business intelligence and data analysis roles.

---

## Output Report

A full summary of this analysis is available in a professionally formatted PDF report:
> [Download the Report](Pizza_Sales.pdf)

---

## Dataset Description

The database consists of the following main tables:

- `orders`: Contains order-level data including order ID, date, and time.
- `order_details`: Holds line-level information about the pizzas ordered in each order.
- `pizzas`: Contains pricing and size information for each pizza ID.
- `pizza_types`: Maps each pizza to a category and includes the pizza name.

---

## Objectives

- Calculate total orders and revenue
- Identify the top-selling pizzas and most common pizza sizes
- Analyze order distribution by hour and day
- Determine performance of pizza categories in terms of quantity and revenue
- Rank pizzas by revenue within their respective categories
- Track cumulative revenue trends over time

---

## Tools Used

- **SQL (MySQL)**
- **phpMyAdmin**
- SQL Features: Aggregations, Joins, Subqueries, Window Functions

---

## Key Business Questions Answered

### Basic Analysis

- **Total Orders Placed:** Calculated using COUNT on `order_id`.
- **Total Revenue:** Derived using SUM on `quantity × price` across order details.
- **Highest-Priced Pizza:** Identified by ordering pizzas by price in descending order.
- **Most Common Pizza Size:** Determined by grouping orders based on size and counting occurrences.
- **Top 5 Most Ordered Pizza Types:** Ranked using aggregated quantities.

### Intermediate Analysis

- **Total Quantity by Pizza Category:** Aggregated using JOINs and GROUP BY.
- **Hourly Order Distribution:** Extracted using the `HOUR()` function on order times.
- **Category-Wise Pizza Distribution:** Counted total pizzas under each category.
- **Average Pizzas Ordered Per Day:** Grouped by date and averaged.
- **Top 3 Pizza Types by Revenue:** Ranked by total sales amount (price × quantity).

### Advanced Analysis

- **Revenue Contribution by Category:** Calculated as a percentage of total revenue.
- **Cumulative Revenue Over Time:** Tracked using a window function over date.
- **Top 3 Pizzas per Category by Revenue:** Derived using `RANK()` partitioned by category.

---

## Sample Insights

- **Total Revenue:** Over $25,000
- **Peak Order Time:** Between 6 PM and 8 PM
- **Most Ordered Size:** Medium
- **Top Category by Quantity:** Classic
- **Top Revenue-Generating Pizzas:** BBQ Chicken, Pepperoni Extreme, Veggie Delight
- **Classic Pizzas Contribution to Revenue:** Approximately 35%
- **Average Pizzas Ordered Per Day:** Around 150

---

## Skills Demonstrated

- Writing complex SQL queries using `JOIN`, `GROUP BY`, and `ORDER BY`
- Aggregation using `SUM`, `COUNT`, `AVG`, and `ROUND`
- Time-series and date-based analysis using `HOUR()` and `GROUP BY date`
- Ranking and window functions such as `RANK()` and `OVER()`
- Subqueries for nested aggregation and filtering
- Business interpretation of raw data through query output

---

## Challenges Encountered

- Ensuring accuracy of joins between multiple tables
- Handling potential NULL values in calculations
- Extracting and formatting time-related insights from timestamps
- Maintaining query performance on potentially large datasets

---
---

## Author

**Anushka Bhattarai**  
Data & Business Analyst  
[Portfolio Website](https://anneushka.my.canva.site/data-analyst-portfolio)

---

## How to Use

If you'd like to explore or replicate this analysis:
1. Import the database dump (if provided) into your MySQL environment.
2. Use phpMyAdmin or a MySQL client to
