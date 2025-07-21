# Used Car Pricing Analysis

## Project Overview
This project analyzes a dataset of used cars to explore how various features impact their prices. The goal is to understand relationships between car characteristics (like engine size, horsepower, fuel efficiency) and price, and to build a simple predictive model for car price estimation.

## Dataset
- **Source:** [UCI Machine Learning Repository - Automobile Data Set](https://archive.ics.uci.edu/ml/datasets/automobile)
- **Format:** CSV file with 205 rows and 26 columns
- **Description:** Contains features such as make, model, engine size, horsepower, curb weight, fuel economy, and price.

## Analysis Performed
- Data cleaning and preprocessing (handling missing values, correcting data types)
- Exploratory Data Analysis (EDA) to explore feature distributions and relationships
- Visualizations including regression plots and heatmaps to identify important predictors
- Correlation analysis to select key features influencing price

## Modeling
- Built a simple Linear Regression model using top correlated features:
  - Engine Size
  - Horsepower
  - Curb Weight
- Evaluated model performance using Mean Absolute Error (MAE) and R² Score

## Key Findings
- Strong positive correlation between engine size, horsepower, and car price.
- Negative correlation between fuel efficiency (city/highway mpg) and price.
- Features like peak RPM have weak correlation and low predictive power.
- Linear regression model achieved reasonable accuracy, demonstrating potential for price prediction.

## Recommendations
- Use top features (engine size, horsepower, curb weight) for price prediction in used car appraisal systems.
- Consider advanced modeling and feature engineering to improve predictions.
- Insights can help dealerships or buyers understand pricing trends.

## Tools & Technologies
- Python (Pandas, NumPy, Matplotlib, Seaborn)
- Scikit-learn for modeling
- Google Colab for development and visualization

## Project Structure
- `Used_Car_Pricing.ipynb` — Jupyter notebook containing data cleaning, EDA, visualization, and modeling steps.
- `README.md` — Project overview and documentation.

## Contact
- Anushka Bhattarai
- https://www.linkedin.com/in/anushka-bhattarai-789aa5238/

---

Feel free to clone or fork this repo and try your own experiments with the data!

