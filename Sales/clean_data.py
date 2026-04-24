"""
Amazon Sales Data Cleaning & Preprocessing Script
===================================================
Reads amazon.csv, cleans/transforms data, and exports structured data.json
for the interactive dashboard.
"""

import csv
import json
import re
import os

INPUT_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "amazon.csv")
OUTPUT_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data.json")


def parse_price(price_str):
    """Strip ₹ symbol, commas, and convert to float."""
    if not price_str or price_str.strip() == "":
        return None
    cleaned = price_str.replace("₹", "").replace(",", "").strip()
    try:
        return round(float(cleaned), 2)
    except ValueError:
        return None


def parse_discount(discount_str):
    """Strip % and convert to integer."""
    if not discount_str or discount_str.strip() == "":
        return None
    cleaned = discount_str.replace("%", "").strip()
    try:
        return int(cleaned)
    except ValueError:
        return None


def parse_rating(rating_str):
    """Convert rating to float."""
    if not rating_str or rating_str.strip() == "":
        return None
    try:
        return round(float(rating_str.strip()), 1)
    except ValueError:
        return None


def parse_rating_count(count_str):
    """Remove commas and convert to integer."""
    if not count_str or count_str.strip() == "":
        return None
    cleaned = count_str.replace(",", "").strip()
    try:
        return int(cleaned)
    except ValueError:
        return None


def extract_categories(category_str):
    """
    Split pipe-delimited category string into main_category and sub_category.
    e.g. 'Computers&Accessories|Accessories&Peripherals|Cables&Accessories|Cables|USBCables'
    → main_category: 'Computers & Accessories'
    → sub_category: 'Accessories & Peripherals'
    """
    if not category_str or category_str.strip() == "":
        return None, None

    # Split by pipe
    parts = category_str.split("|")

    # Clean up: add spaces around &, remove extra whitespace
    def clean_cat(s):
        s = s.strip()
        # Add space around & if not present
        s = re.sub(r"(\w)&(\w)", r"\1 & \2", s)
        # Add spaces before capital letters in CamelCase (e.g., USBCables → USB Cables)
        s = re.sub(r"([a-z])([A-Z])", r"\1 \2", s)
        # Handle cases like 'HomeTheater' → 'Home Theater'
        s = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1 \2", s)
        return s.strip()

    main_category = clean_cat(parts[0]) if len(parts) > 0 else None
    sub_category = clean_cat(parts[1]) if len(parts) > 1 else None

    return main_category, sub_category


def truncate_name(name, max_len=80):
    """Truncate product name to max_len characters."""
    if not name:
        return ""
    name = name.strip()
    if len(name) <= max_len:
        return name
    return name[:max_len - 3].rstrip() + "..."


def clean_data():
    """Main cleaning pipeline."""
    products = []
    seen_ids = set()
    skipped = {"duplicate": 0, "missing_critical": 0, "invalid_price": 0}

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for row in reader:
            product_id = row.get("product_id", "").strip()

            # --- Skip duplicates ---
            if product_id in seen_ids:
                skipped["duplicate"] += 1
                continue
            seen_ids.add(product_id)

            # --- Parse fields ---
            discounted_price = parse_price(row.get("discounted_price", ""))
            actual_price = parse_price(row.get("actual_price", ""))
            discount_percentage = parse_discount(row.get("discount_percentage", ""))
            rating = parse_rating(row.get("rating", ""))
            rating_count = parse_rating_count(row.get("rating_count", ""))
            main_category, sub_category = extract_categories(row.get("category", ""))
            product_name = truncate_name(row.get("product_name", ""))

            # --- Validate critical fields ---
            if not product_id or not product_name:
                skipped["missing_critical"] += 1
                continue

            if discounted_price is None or actual_price is None:
                skipped["invalid_price"] += 1
                continue

            if rating is None:
                skipped["missing_critical"] += 1
                continue

            # --- Fix illogical data ---
            # If discounted price > actual price, swap them
            if discounted_price > actual_price:
                discounted_price, actual_price = actual_price, discounted_price

            # Compute savings
            savings = round(actual_price - discounted_price, 2)

            # Recompute discount if missing or inconsistent
            if actual_price > 0:
                computed_discount = round((savings / actual_price) * 100)
            else:
                computed_discount = 0

            if discount_percentage is None:
                discount_percentage = computed_discount

            # Default rating_count to 0 if missing
            if rating_count is None:
                rating_count = 0

            # Default categories
            if main_category is None:
                main_category = "Uncategorized"
            if sub_category is None:
                sub_category = "Other"

            # Clamp rating to 0-5 range
            rating = max(0.0, min(5.0, rating))

            # Clamp discount to 0-100
            discount_percentage = max(0, min(100, discount_percentage))

            # --- Build clean product ---
            products.append({
                "product_id": product_id,
                "product_name": product_name,
                "main_category": main_category,
                "sub_category": sub_category,
                "discounted_price": discounted_price,
                "actual_price": actual_price,
                "discount_percentage": discount_percentage,
                "savings": savings,
                "rating": rating,
                "rating_count": rating_count,
            })

    # --- Compute summary statistics ---
    total_products = len(products)
    avg_discount = round(sum(p["discount_percentage"] for p in products) / total_products, 1) if total_products > 0 else 0
    avg_rating = round(sum(p["rating"] for p in products) / total_products, 1) if total_products > 0 else 0
    total_reviews = sum(p["rating_count"] for p in products)
    avg_price = round(sum(p["discounted_price"] for p in products) / total_products, 2) if total_products > 0 else 0
    total_savings = round(sum(p["savings"] for p in products), 2)
    max_discount = max((p["discount_percentage"] for p in products), default=0)
    min_discount = min((p["discount_percentage"] for p in products), default=0)

    # Category counts
    category_counts = {}
    for p in products:
        cat = p["main_category"]
        category_counts[cat] = category_counts.get(cat, 0) + 1

    output = {
        "products": products,
        "summary": {
            "total_products": total_products,
            "avg_discount": avg_discount,
            "avg_rating": avg_rating,
            "total_reviews": total_reviews,
            "avg_price": avg_price,
            "total_savings": total_savings,
            "max_discount": max_discount,
            "min_discount": min_discount,
            "category_counts": category_counts,
        },
        "cleaning_report": {
            "original_rows": total_products + sum(skipped.values()),
            "cleaned_rows": total_products,
            "duplicates_removed": skipped["duplicate"],
            "missing_critical_dropped": skipped["missing_critical"],
            "invalid_price_dropped": skipped["invalid_price"],
        }
    }

    # --- Write output ---
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    # --- Print report ---
    print("=" * 60)
    print("  AMAZON DATA CLEANING REPORT")
    print("=" * 60)
    print(f"  Input file:             {INPUT_FILE}")
    print(f"  Output file:            {OUTPUT_FILE}")
    print(f"  Original rows:          {output['cleaning_report']['original_rows']}")
    print(f"  Cleaned rows:           {total_products}")
    print(f"  Duplicates removed:     {skipped['duplicate']}")
    print(f"  Missing critical:       {skipped['missing_critical']}")
    print(f"  Invalid price:          {skipped['invalid_price']}")
    print("-" * 60)
    print(f"  Avg Discount:           {avg_discount}%")
    print(f"  Avg Rating:             {avg_rating}")
    print(f"  Total Reviews:          {total_reviews:,}")
    print(f"  Avg Price (discounted): INR {avg_price:,.2f}")
    print(f"  Categories:             {len(category_counts)}")
    print("-" * 60)
    print("  Category Breakdown:")
    for cat, count in sorted(category_counts.items(), key=lambda x: -x[1]):
        print(f"    {cat}: {count} products")
    print("=" * 60)


if __name__ == "__main__":
    clean_data()
