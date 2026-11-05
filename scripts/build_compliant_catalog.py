import json
import re

# Load current products.json
with open('src/data/products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

# Identify the 5 products that were originally in Others:
others_original_names = [
    "AQUATIC PLANT NUTRIENTS",
    "BREEDER",
    "CLEAR RTV M-SEAL",
    "ELITE",
    "LY-04 FULL SPECTRUM SUNLIGHT",
    "MIST MAKER",
    "OCEAN CARE AQUARIUM SALT",
    "PLANT FOOD 120ML",
    "READ HEAD PEARLS",
    "SOBO 7W UVLAMP",
    "SUNSUN AK-01J",
    "SUNSUN YC-250 500W",
    "TURTLE CONDITIONER",
    "TURTLE EYE DROPS",
    "XY - 2835 SPONG FILTER"
]

# The 10 original Motors products (now Filters):
motors_original_names = [
    "BOYU SP-1000A",
    "SOBO - WP1300A FILTER",
    "SOBO AQ-16H",
    "SOBO SB-830A AIRPUMP",
    "SOBO SK-03",
    "SOBO WP-1200F",
    "SOBO WP-618H",
    "SOBO WP50-M WAVE MAKER",
    "SUNSUN  HBL-301",
    "SUNSUN CT-201"
]

# The 15 verified NEW filter products to add to Filters:
verified_new_filters = [
    {"name": "BF002 HANGING FILTER", "file": "BF002 HANGING FILTER.webp"},
    {"name": "BLUEPET BLH-303 HANG ON WATERFALL", "file": "BLUEPET BLH-303 HANG ON WATERFALL.webp"},
    {"name": "RS ELECTRICAL 25W INTERNAL FILTER", "file": "RS ELECTRICAL 25W INTERNAL FILTER.webp"},
    {"name": "RS-1400 SUBMERSIBLE PUMP", "file": "RS-1400 SUBMERSIBLE PUMP.webp"},
    {"name": "RS-188A 3 IN 1 MORE FUNCTIONS", "file": "RS-188A 3 IN 1 MORE FUNCTIONS.webp"},
    {"name": "RS-288A 3 IN 1 MORE FUNCTIONS", "file": "RS-288A 3 IN 1 MORE FUNCTIONS.webp"},
    {"name": "RS-HF03 HANGING FILTER", "file": "RS-HF03 HANGING FILTER.webp"},
    {"name": "RS720BLS INTERNAL FILTER", "file": "RS720BLS INTERNAL FILTER.webp"},
    {"name": "SOBO AIR PUMP SB-548A", "file": "SOBO AIR PUMP SB-548A.webp"},
    {"name": "SOBO AIR PUMP SB-8808", "file": "SOBO AIR PUMP SB-8808.webp"},
    {"name": "SOBO AQUARIUM AIR PUMP AP-208", "file": "SOBO AQUARIUM AIR PUMP AP-208.webp"},
    {"name": "SOBO AQUARIUM FILTER SPONGE FS-02", "file": "SOBO AQUARIUM FILTER SPONGE FS-02.webp"},
    {"name": "SUBMARINE WATER PUMP RS-1400", "file": "SUBMARINE WATER PUMP RS-1400.webp"},
    {"name": "SUNSUN HANG ON FILTER HBL-801 6W", "file": "SUNSUN HANG ON FILTER HBL-801 6W.webp"},
    {"name": "SUNSUN HANG ON FILTER HBL-802 6W", "file": "SUNSUN HANG ON FILTER HBL-802 6W.webp"}
]

# Non-filter / unidentified equipment images flagged for manual review:
unidentified_for_review = [
    "5 IN 1 MAINTAIN KIT.png",
    "AG-01 DECORATIVE GRAVEL.png",
    "DIGITAL THERMOMETER.png",
    "DIGITAL TIMER.png",
    "SOBO AL-60 AQUARIUM LED LIGHT.png",
    "SOBO AQUARIUM CLEANING KIT CK-01.png",
    "SOBO AQUARIUM HEATER AQ-100W.png"
]

print("Building clean catalog...")
# 1. Restore exact categories for the 15 Others products:
cleaned_catalog = []
existing_ids = set()
existing_slugs = set()

# First add existing products
for p in products:
    item = dict(p)
    name = item["name"]
    
    # Check if this is one of the 7 non-filter products that shouldn't be added to Filters
    if any(u.split('.')[0] in name.upper() for u in unidentified_for_review):
        continue # omit from Filters; flag for manual review
        
    # Check if this was one of the 15 original Others products:
    if name in others_original_names:
        item["category"] = "Others" # Keep in Others per Rule 8: Do not modify Others
    elif name in motors_original_names:
        item["category"] = "Filters" # Renamed Motors -> Filters
    elif item.get("category") == "Tanks":
        item["category"] = "Tanks"
    elif item.get("category") == "Fish Foods":
        item["category"] = "Fish Foods"
    elif item.get("category") == "Fish Medicines":
        item["category"] = "Fish Medicines"
        
    cleaned_catalog.append(item)
    existing_ids.add(item["id"])
    existing_slugs.add(item["slug"])

# Check counts
cat_counts = {}
for p in cleaned_catalog:
    c = p.get("category")
    cat_counts[c] = cat_counts.get(c, 0) + 1

print("Catalog counts before final check:", cat_counts)
print("Total products:", len(cleaned_catalog))

with open('src/data/products.json', 'w', encoding='utf-8') as f:
    json.dump(cleaned_catalog, f, indent=2, ensure_ascii=False)

# Update products.js
categories = [
  "All Products",
  "Fish Foods",
  "Fish Medicines",
  "Others",
  "Tanks",
  "Filters"
]

js_code = f"""// Binu's Aquatic and Plants - Product Catalog Data
// Categories: Fish Foods | Fish Medicines | Others | Tanks | Filters

export const CATEGORIES = {json.dumps(categories, indent=2)};

export const PRODUCTS = {json.dumps(cleaned_catalog, indent=2, ensure_ascii=False)};

export function getProductBySlug(slug) {{
  return PRODUCTS.find(p => p.slug === slug);
}}

export function getProductsByCategory(category) {{
  if (!category || category === 'All Products') return PRODUCTS;
  return PRODUCTS.filter(p => p.category === category);
}}

export function formatPrice(price) {{
  if (typeof price !== 'number') return '';
  return `₹${{price.toLocaleString('en-IN')}}`;
}}

export function calculateDiscount(original, current) {{
  if (!original || !current || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
}}

export default PRODUCTS;
"""

with open('src/data/products.js', 'w', encoding='utf-8') as f:
    f.write(js_code)

print("Saved clean catalog to src/data/products.json and src/data/products.js")

