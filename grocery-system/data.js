// Best Way Grocery — Brampton, Ontario
// Tax categories per Canada Revenue Agency:
//   ZERO = basic groceries (zero-rated)
//   TAX  = taxable at HST 13% (5% GST + 8% PST) — snacks, candy, prepared foods, beverages

const DEFAULT_INVENTORY = [
  // ── Rice & Grains ─────────────────────────────────────
  { barcode:"1001", name:"Basmati Rice 10lb", category:"Rice & Grains", price:18.99, stock:80, taxable:false },
  { barcode:"1002", name:"Sella Basmati Rice 10lb", category:"Rice & Grains", price:22.99, stock:60, taxable:false },
  { barcode:"1003", name:"Jasmine Rice 5lb", category:"Rice & Grains", price:8.99, stock:50, taxable:false },
  { barcode:"1004", name:"Brown Rice 5lb", category:"Rice & Grains", price:6.99, stock:40, taxable:false },
  { barcode:"1005", name:"Wheat Flour (Atta) 20lb", category:"Rice & Grains", price:14.99, stock:70, taxable:false },
  { barcode:"1006", name:"Besan (Gram Flour) 4lb", category:"Rice & Grains", price:5.99, stock:45, taxable:false },
  { barcode:"1007", name:"Maida (All Purpose) 4lb", category:"Rice & Grains", price:4.99, stock:40, taxable:false },
  { barcode:"1008", name:"Sooji (Semolina) 2lb", category:"Rice & Grains", price:3.49, stock:35, taxable:false },
  { barcode:"1009", name:"Moong Dal 4lb", category:"Rice & Grains", price:7.99, stock:50, taxable:false },
  { barcode:"1010", name:"Masoor Dal 4lb", category:"Rice & Grains", price:6.99, stock:45, taxable:false },
  { barcode:"1011", name:"Chana Dal 4lb", category:"Rice & Grains", price:7.49, stock:50, taxable:false },
  { barcode:"1012", name:"Urad Dal 4lb", category:"Rice & Grains", price:8.99, stock:35, taxable:false },
  { barcode:"1013", name:"Toor Dal 4lb", category:"Rice & Grains", price:8.49, stock:40, taxable:false },
  { barcode:"1014", name:"Rajma (Kidney Beans) 2lb", category:"Rice & Grains", price:5.49, stock:30, taxable:false },
  { barcode:"1015", name:"Chole (Chickpeas) 2lb", category:"Rice & Grains", price:4.99, stock:35, taxable:false },

  // ── Spices & Masala ───────────────────────────────────
  { barcode:"2001", name:"Turmeric Powder 400g", category:"Spices & Masala", price:4.99, stock:60, taxable:false },
  { barcode:"2002", name:"Red Chili Powder 400g", category:"Spices & Masala", price:5.99, stock:55, taxable:false },
  { barcode:"2003", name:"Coriander Powder 400g", category:"Spices & Masala", price:4.49, stock:50, taxable:false },
  { barcode:"2004", name:"Cumin Seeds 400g", category:"Spices & Masala", price:6.99, stock:45, taxable:false },
  { barcode:"2005", name:"Garam Masala 200g", category:"Spices & Masala", price:4.99, stock:40, taxable:false },
  { barcode:"2006", name:"Chicken Tikka Masala 100g", category:"Spices & Masala", price:2.99, stock:50, taxable:false },
  { barcode:"2007", name:"Biryani Masala 100g", category:"Spices & Masala", price:3.49, stock:45, taxable:false },
  { barcode:"2008", name:"Chaat Masala 100g", category:"Spices & Masala", price:2.99, stock:40, taxable:false },
  { barcode:"2009", name:"Black Pepper 200g", category:"Spices & Masala", price:7.99, stock:30, taxable:false },
  { barcode:"2010", name:"Cardamom 100g", category:"Spices & Masala", price:8.99, stock:25, taxable:false },
  { barcode:"2011", name:"Cloves 100g", category:"Spices & Masala", price:6.99, stock:25, taxable:false },
  { barcode:"2012", name:"Bay Leaves 50g", category:"Spices & Masala", price:2.49, stock:30, taxable:false },
  { barcode:"2013", name:"Fennel Seeds 200g", category:"Spices & Masala", price:3.99, stock:35, taxable:false },
  { barcode:"2014", name:"Mustard Seeds 200g", category:"Spices & Masala", price:3.49, stock:30, taxable:false },
  { barcode:"2015", name:"Hing (Asafoetida) 50g", category:"Spices & Masala", price:4.99, stock:25, taxable:false },

  // ── Fresh Produce ─────────────────────────────────────
  { barcode:"3001", name:"Ginger 1lb", category:"Fresh Produce", price:2.99, stock:80, taxable:false },
  { barcode:"3002", name:"Garlic 1lb", category:"Fresh Produce", price:3.49, stock:60, taxable:false },
  { barcode:"3003", name:"Green Chilies 200g", category:"Fresh Produce", price:1.49, stock:50, taxable:false },
  { barcode:"3004", name:"Fresh Coriander Bunch", category:"Fresh Produce", price:0.99, stock:60, taxable:false },
  { barcode:"3005", name:"Fresh Mint Bunch", category:"Fresh Produce", price:1.29, stock:40, taxable:false },
  { barcode:"3006", name:"Onions 10lb", category:"Fresh Produce", price:5.99, stock:100, taxable:false },
  { barcode:"3007", name:"Tomatoes 10lb", category:"Fresh Produce", price:6.99, stock:90, taxable:false },
  { barcode:"3008", name:"Potatoes 10lb", category:"Fresh Produce", price:4.99, stock:100, taxable:false },
  { barcode:"3009", name:"Okra (Bhindi) 1lb", category:"Fresh Produce", price:2.99, stock:30, taxable:false },
  { barcode:"3010", name:"Bitter Gourd 1lb", category:"Fresh Produce", price:3.49, stock:20, taxable:false },
  { barcode:"3011", name:"Bottle Gourd 1pc", category:"Fresh Produce", price:2.99, stock:25, taxable:false },
  { barcode:"3012", name:"Bitter Gourd 1lb", category:"Fresh Produce", price:3.49, stock:20, taxable:false },
  { barcode:"3013", name:"Spinach Bunch", category:"Fresh Produce", price:1.99, stock:40, taxable:false },
  { barcode:"3014", name:"Methi (Fenugreek) Bunch", category:"Fresh Produce", price:1.49, stock:30, taxable:false },
  { barcode:"3015", name:"Bananas Bunch", category:"Fresh Produce", price:1.29, stock:100, taxable:false },
  { barcode:"3016", name:"Mangoes (Alphonso) 6ct", category:"Fresh Produce", price:9.99, stock:40, taxable:false },
  { barcode:"3017", name:"Pomegranate 1pc", category:"Fresh Produce", price:2.99, stock:30, taxable:false },

  // ── Dairy ─────────────────────────────────────────────
  { barcode:"4001", name:"Whole Milk 4L", category:"Dairy", price:5.49, stock:60, taxable:false },
  { barcode:"4002", name:"Paneer 400g", category:"Dairy", price:5.99, stock:40, taxable:false },
  { barcode:"4003", name:"Dahi (Yogurt) 2kg", category:"Dairy", price:4.99, stock:50, taxable:false },
  { barcode:"4004", name:"Ghee 1kg", category:"Dairy", price:12.99, stock:35, taxable:false },
  { barcode:"4005", name:"Butter 454g", category:"Dairy", price:4.99, stock:45, taxable:false },
  { barcode:"4006", name:"Cream 500ml", category:"Dairy", price:3.49, stock:30, taxable:false },
  { barcode:"4007", name:"Lassi 1L", category:"Dairy", price:3.99, stock:40, taxable:true },
  { barcode:"4008", name:"Mango Lassi 500ml", category:"Dairy", price:2.99, stock:35, taxable:true },

  // ── Meat & Seafood ────────────────────────────────────
  { barcode:"5001", name:"Chicken Whole Halal", category:"Meat & Seafood", price:8.99, stock:40, taxable:false },
  { barcode:"5002", name:"Chicken Breast Halal lb", category:"Meat & Seafood", price:5.99, stock:35, taxable:false },
  { barcode:"5003", name:"Goat Meat Bone-in lb", category:"Meat & Seafood", price:12.99, stock:25, taxable:false },
  { barcode:"5004", name:"Lamb Leg lb", category:"Meat & Seafood", price:11.99, stock:20, taxable:false },
  { barcode:"5005", name:"Beef Mince Halal lb", category:"Meat & Seafood", price:7.99, stock:30, taxable:false },
  { barcode:"5006", name:"Whole Tilapia 1lb", category:"Meat & Seafood", price:5.99, stock:20, taxable:false },
  { barcode:"5007", name:"Salmon Fillet lb", category:"Meat & Seafood", price:11.99, stock:15, taxable:false },
  { barcode:"5008", name:"Prawns 1lb", category:"Meat & Seafood", price:13.99, stock:15, taxable:false },

  // ── Frozen ────────────────────────────────────────────
  { barcode:"6001", name:"Frozen Paratha 10ct", category:"Frozen", price:4.99, stock:50, taxable:false },
  { barcode:"6002", name:"Frozen Naan 6ct", category:"Frozen", price:3.99, stock:45, taxable:false },
  { barcode:"6003", name:"Frozen Samosas 12ct", category:"Frozen", price:5.99, stock:40, taxable:false },
  { barcode:"6004", name:"Frozen Paneer Tikka 400g", category:"Frozen", price:6.99, stock:30, taxable:false },
  { barcode:"6005", name:"Frozen Mixed Vegetables 1kg", category:"Frozen", price:3.49, stock:40, taxable:false },
  { barcode:"6006", name:"Frozen Peas 1kg", category:"Frozen", price:2.99, stock:50, taxable:false },
  { barcode:"6007", name:"Frozen Mango Pulp 850g", category:"Frozen", price:4.99, stock:30, taxable:false },
  { barcode:"6008", name:"Kulfi 4ct", category:"Frozen", price:5.99, stock:25, taxable:true },

  // ── Oils & Cooking ────────────────────────────────────
  { barcode:"7001", name:"Mustard Oil 1L", category:"Oils & Cooking", price:5.99, stock:40, taxable:false },
  { barcode:"7002", name:"Coconut Oil 1L", category:"Oils & Cooking", price:6.99, stock:35, taxable:false },
  { barcode:"7003", name:"Sunflower Oil 3L", category:"Oils & Cooking", price:8.99, stock:50, taxable:false },
  { barcode:"7004", name:"Ghee 500g", category:"Oils & Cooking", price:7.99, stock:30, taxable:false },
  { barcode:"7005", name:"Vinegar 500ml", category:"Oils & Cooking", price:2.49, stock:25, taxable:false },
  { barcode:"7006", name:"Tamarind Paste 500g", category:"Oils & Cooking", price:3.99, stock:20, taxable:false },

  // ── Snacks & Sweets (TAXABLE — HST 13%) ──────────────
  { barcode:"8001", name:"Haldiram's Bhujia 400g", category:"Snacks & Sweets", price:5.99, stock:40, taxable:true },
  { barcode:"8002", name:"Ladoo 500g", category:"Snacks & Sweets", price:7.99, stock:25, taxable:true },
  { barcode:"8003", name:"Gulab Jamun 1kg", category:"Snacks & Sweets", price:8.99, stock:30, taxable:true },
  { barcode:"8004", name:"Rasgulla 1kg", category:"Snacks & Sweets", price:7.99, stock:25, taxable:true },
  { barcode:"8005", name:"Jalebi 500g", category:"Snacks & Sweets", price:5.99, stock:20, taxable:true },
  { barcode:"8006", name:"Barfi 500g", category:"Snacks & Sweets", price:9.99, stock:20, taxable:true },
  { barcode:"8007", name:"Murukku 200g", category:"Snacks & Sweets", price:3.99, stock:35, taxable:true },
  { barcode:"8008", name:"Mixture 400g", category:"Snacks & Sweets", price:4.99, stock:40, taxable:true },
  { barcode:"8009", name:"Papad 200g", category:"Snacks & Sweets", price:2.99, stock:50, taxable:true },
  { barcode:"8010", name:"Digestive Biscuits", category:"Snacks & Sweets", price:2.49, stock:40, taxable:true },
  { barcode:"8011", name:"Parle-G Biscuits", category:"Snacks & Sweets", price:1.99, stock:60, taxable:true },
  { barcode:"8012", name:"Kurkure 150g", category:"Snacks & Sweets", price:2.49, stock:50, taxable:true },
  { barcode:"8013", name:"Lays Chips 200g", category:"Snacks & Sweets", price:3.49, stock:60, taxable:true },

  // ── Beverages (MIXED TAX) ─────────────────────────────
  { barcode:"9001", name:"Tea Leaves (Wagh Bakri) 1kg", category:"Beverages", price:8.99, stock:40, taxable:false },
  { barcode:"9002", name:"Lipton Tea 1kg", category:"Beverages", price:7.99, stock:35, taxable:false },
  { barcode:"9003", name:"Instant Coffee 200g", category:"Beverages", price:5.99, stock:30, taxable:false },
  { barcode:"9004", name:"Mango Juice 1L", category:"Beverages", price:3.49, stock:40, taxable:true },
  { barcode:"9005", name:"Rooh Afza 750ml", category:"Beverages", price:4.99, stock:35, taxable:true },
  { barcode:"9006", name:"Thumbs Up 1.25L", category:"Beverages", price:2.49, stock:60, taxable:true },
  { barcode:"9007", name:"Mazaa 1.25L", category:"Beverages", price:2.49, stock:50, taxable:true },
  { barcode:"9008", name:"Buttermilk (Chaas) 1L", category:"Beverages", price:2.99, stock:30, taxable:true },
  { barcode:"9009", name:"Packaged Water 24pk", category:"Beverages", price:3.99, stock:80, taxable:false },

  // ── Baking & Condiments ───────────────────────────────
  { barcode:"A001", name:"Baking Powder 200g", category:"Baking & Condiments", price:2.49, stock:30, taxable:false },
  { barcode:"A002", name:"Vanilla Essence 50ml", category:"Baking & Condiments", price:3.49, stock:25, taxable:false },
  { barcode:"A003", name:"Sugar 10lb", category:"Baking & Condiments", price:7.99, stock:60, taxable:false },
  { barcode:"A004", name:"Brown Sugar 2lb", category:"Baking & Condiments", price:3.49, stock:30, taxable:false },
  { barcode:"A005", name:"Salt 2kg", category:"Baking & Condiments", price:1.49, stock:50, taxable:false },
  { barcode:"A006", name:"Mango Pickle 400g", category:"Baking & Condiments", price:4.99, stock:30, taxable:false },
  { barcode:"A007", name:"Mixed Pickle 400g", category:"Baking & Condiments", price:4.99, stock:25, taxable:false },
  { barcode:"A008", name:"Green Chili Sauce 250ml", category:"Baking & Condiments", price:2.99, stock:30, taxable:false },
  { barcode:"A009", name:"Tomato Ketchup 500g", category:"Baking & Condiments", price:3.49, stock:35, taxable:false },
  { barcode:"A010", name:"Tamarind Chutney 400g", category:"Baking & Condiments", price:3.99, stock:25, taxable:false },

  // ── Household ─────────────────────────────────────────
  { barcode:"B001", name:"Paper Towels 6pk", category:"Household", price:8.99, stock:30, taxable:true },
  { barcode:"B002", name:"Dish Soap 1L", category:"Household", price:3.49, stock:25, taxable:true },
  { barcode:"B003", name:"Trash Bags 30-ct", category:"Household", price:6.99, stock:20, taxable:true },
  { barcode:"B004", name:"Laundry Detergent 2L", category:"Household", price:9.99, stock:20, taxable:true },
  { barcode:"B005", name:"Aluminium Foil 30m", category:"Household", price:4.99, stock:25, taxable:true },
  { barcode:"B006", name:"Zip Lock Bags 100ct", category:"Household", price:3.99, stock:30, taxable:true }
];
