// Multi-Tenant OmniPulse Seed Data with Business Vertical Personas
// Verticals: software, shop, factory, industry, ecommerce (or 'all' for universal)

export const seedBills = [
  // --- SOFTWARE / SAAS TECH ---
  {
    id: "bill-101",
    invoiceNumber: "INV-2026-001",
    title: "AWS Cloud Infrastructure & GPU Cluster",
    vendorOrClient: "Amazon Web Services Inc.",
    amount: 14250.00,
    dueDate: "2026-11-05",
    category: "Cloud Hosting",
    status: "paid",
    paymentMethod: "Corporate Wire",
    notes: "Production clusters, RDS instances and S3 multi-region replication.",
    businessType: "software"
  },
  {
    id: "bill-102",
    invoiceNumber: "INV-2026-002",
    title: "OpenAI Enterprise API Subscription",
    vendorOrClient: "OpenAI LLC",
    amount: 6800.00,
    dueDate: "2026-11-10",
    category: "AI Software",
    status: "pending",
    paymentMethod: "Credit Card (Ending 4092)",
    notes: "Usage billing for LLM token inference and fine-tuned models.",
    businessType: "software"
  },
  {
    id: "bill-103",
    invoiceNumber: "INV-2026-003",
    title: "Cybersecurity Compliance & Pen-testing",
    vendorOrClient: "SentinelSec Global",
    amount: 8500.00,
    dueDate: "2026-10-24",
    category: "Security",
    status: "overdue",
    paymentMethod: "ACH Transfer",
    notes: "SOC-2 Type II annual surveillance audit.",
    businessType: "software"
  },
  {
    id: "bill-104",
    invoiceNumber: "INV-2026-004",
    title: "Quarterly Silicon Valley HQ Lease",
    vendorOrClient: "Vanguard Commercial Real Estate",
    amount: 22400.00,
    dueDate: "2026-11-01",
    category: "Facilities",
    status: "pending",
    paymentMethod: "Corporate Wire",
    notes: "Q4 Lease payment for floors 8 & 9.",
    businessType: "software"
  },
  {
    id: "bill-105",
    invoiceNumber: "INV-2026-005",
    title: "Customer Support Suite Enterprise",
    vendorOrClient: "Zendesk Global",
    amount: 3200.00,
    dueDate: "2026-10-15",
    category: "SaaS Tools",
    status: "paid",
    paymentMethod: "Credit Card (Ending 4092)",
    notes: "Annual Tier 3 Enterprise support seat expansion.",
    businessType: "software"
  },

  // --- RETAIL SHOP & STORE ---
  {
    id: "bill-106",
    invoiceNumber: "INV-SHP-001",
    title: "Downtown Retail Commercial Space Lease",
    vendorOrClient: "HighStreet Real Estate Partners",
    amount: 4200.00,
    dueDate: "2026-11-01",
    category: "Store Rent",
    status: "paid",
    paymentMethod: "Corporate Wire",
    notes: "Monthly storefront lease for Main Street flagship branch.",
    businessType: "shop"
  },
  {
    id: "bill-107",
    invoiceNumber: "INV-SHP-002",
    title: "Beverage & Confectionery Wholesale Restock",
    vendorOrClient: "Metro Wholesale Distributors",
    amount: 2850.00,
    dueDate: "2026-11-08",
    category: "Store Supplies",
    status: "pending",
    paymentMethod: "ACH Transfer",
    notes: "Bulk organic roasted coffee beans and snack supplies.",
    businessType: "shop"
  },
  {
    id: "bill-108",
    invoiceNumber: "INV-SHP-003",
    title: "Smart POS Dual-Display Register Leasing",
    vendorOrClient: "Square / Toast Merchant Tech",
    amount: 480.00,
    dueDate: "2026-10-28",
    category: "POS Hardware",
    status: "paid",
    paymentMethod: "Credit Card",
    notes: "Monthly lease for 3 counter barcode scanner & card terminals.",
    businessType: "shop"
  },

  // --- FACTORY & MANUFACTURING ---
  {
    id: "bill-109",
    invoiceNumber: "INV-FAC-001",
    title: "Cold-Rolled High-Tensile Steel Coil (24 Tons)",
    vendorOrClient: "ArcelorMittal Steel Works",
    amount: 48500.00,
    dueDate: "2026-11-15",
    category: "Raw Materials",
    status: "pending",
    paymentMethod: "Letter of Credit",
    notes: "Batch #St-982 for plant hydraulic chassis manufacturing.",
    businessType: "factory"
  },
  {
    id: "bill-110",
    invoiceNumber: "INV-FAC-002",
    title: "CNC 5-Axis Milling Machine Servicing & Tooling",
    vendorOrClient: "Haas Automation Precision",
    amount: 6400.00,
    dueDate: "2026-10-20",
    category: "Plant Maintenance",
    status: "paid",
    paymentMethod: "Corporate Wire",
    notes: "Spindle recalibration and carbide drill replacement.",
    businessType: "factory"
  },
  {
    id: "bill-111",
    invoiceNumber: "INV-FAC-003",
    title: "Factory High-Voltage Power & Compressor Utility",
    vendorOrClient: "Midwest Energy Power Grid",
    amount: 18200.00,
    dueDate: "2026-10-31",
    category: "Utilities & Fuel",
    status: "pending",
    paymentMethod: "ACH Transfer",
    notes: "Heavy industrial electricity consumption for October assembly shifts.",
    businessType: "factory"
  },

  // --- HEAVY INDUSTRIES & INFRASTRUCTURE ---
  {
    id: "bill-112",
    invoiceNumber: "INV-IND-001",
    title: "CAT 349 Excavator & Mobile Crane Monthly Lease",
    vendorOrClient: "Caterpillar Heavy Fleet Rentals",
    amount: 28000.00,
    dueDate: "2026-11-05",
    category: "Equipment Lease",
    status: "paid",
    paymentMethod: "Corporate Wire",
    notes: "On-site heavy machinery for highway substation construction.",
    businessType: "industry"
  },
  {
    id: "bill-113",
    invoiceNumber: "INV-IND-002",
    title: "Trans-Regional Rail Heavy Freight Logistics",
    vendorOrClient: "Union Pacific Freight Logistics",
    amount: 34500.00,
    dueDate: "2026-11-18",
    category: "Heavy Logistics",
    status: "pending",
    paymentMethod: "Corporate Wire",
    notes: "Flatcar transport of 12 reinforced bridge girders to depot.",
    businessType: "industry"
  },

  // --- E-COMMERCE & D2C BRANDS ---
  {
    id: "bill-114",
    invoiceNumber: "INV-ECM-001",
    title: "DHL & FedEx Global D2C Priority Logistics",
    vendorOrClient: "DHL Express Global Supply",
    amount: 32400.00,
    dueDate: "2026-11-02",
    category: "3PL Shipping",
    status: "paid",
    paymentMethod: "ACH Transfer",
    notes: "Prepaid regional warehousing and 4,800 domestic parcel deliveries.",
    businessType: "ecommerce"
  },
  {
    id: "bill-115",
    invoiceNumber: "INV-ECM-002",
    title: "Meta & TikTok Performance Ads Campaign",
    vendorOrClient: "Meta Ads Platform",
    amount: 24800.00,
    dueDate: "2026-11-09",
    category: "Performance Ads",
    status: "pending",
    paymentMethod: "Credit Card",
    notes: "ROAS targeting for Q4 consumer product launch surge.",
    businessType: "ecommerce"
  }
];

export const seedSales = [
  // --- SOFTWARE / SAAS TECH ---
  {
    id: "deal-201",
    dealName: "OmniPulse Enterprise License - 500 Seats",
    customerName: "Apex Fintech Corp",
    customerEmail: "marcus.vance@apexfintech.io",
    amount: 84000.00,
    stage: "closed_won",
    probability: 100,
    expectedCloseDate: "2026-10-18",
    rep: "Elena Rostova",
    businessType: "software"
  },
  {
    id: "deal-202",
    dealName: "Global Telemetry & Realtime Analytics Suite",
    customerName: "Nordic Logistics Group",
    customerEmail: "s.lindqvist@nordiclog.se",
    amount: 62000.00,
    stage: "proposal",
    probability: 75,
    expectedCloseDate: "2026-11-12",
    rep: "David Chen",
    businessType: "software"
  },
  {
    id: "deal-203",
    dealName: "Multi-tenant CRM & Billing Hub Integration",
    customerName: "Starlight Retailers Inc",
    customerEmail: "sarah.jenkins@starlight.com",
    amount: 39500.00,
    stage: "qualified",
    probability: 50,
    expectedCloseDate: "2026-11-20",
    rep: "Marcus Brody",
    businessType: "software"
  },
  {
    id: "deal-204",
    dealName: "AI Sales Forecasting Expansion",
    customerName: "Kuroda Heavy Industries",
    customerEmail: "k.tanaka@kuroda-hi.co.jp",
    amount: 115000.00,
    stage: "proposal",
    probability: 80,
    expectedCloseDate: "2026-12-05",
    rep: "Elena Rostova",
    businessType: "software"
  },
  {
    id: "deal-205",
    dealName: "Starter Tier Pro Trial Conversion",
    customerName: "Zenith Growth Labs",
    customerEmail: "hi@zenithlabs.co",
    amount: 12500.00,
    stage: "prospect",
    probability: 25,
    expectedCloseDate: "2026-11-30",
    rep: "Sarah Connors",
    businessType: "software"
  },

  // --- RETAIL SHOP & STORE ---
  {
    id: "deal-206",
    dealName: "Downtown Cafe Monthly Bulk Bean Contract",
    customerName: "Downtown Cafe & Bakery",
    customerEmail: "orders@downtownbakery.com",
    amount: 3800.00,
    stage: "closed_won",
    probability: 100,
    expectedCloseDate: "2026-10-24",
    rep: "Front Desk POS",
    businessType: "shop"
  },
  {
    id: "deal-207",
    dealName: "Weekend Register Settlement Surge",
    customerName: "Walk-in Store Patrons",
    customerEmail: "counter@omnipulsestore.com",
    amount: 14200.00,
    stage: "closed_won",
    probability: 100,
    expectedCloseDate: "2026-10-26",
    rep: "Register #1",
    businessType: "shop"
  },
  {
    id: "deal-208",
    dealName: "GreenGrocer Wholesale Produce Supply",
    customerName: "Corner Deli Mart",
    customerEmail: "supply@cornerdelimart.com",
    amount: 7600.00,
    stage: "qualified",
    probability: 60,
    expectedCloseDate: "2026-11-04",
    rep: "Store Manager",
    businessType: "shop"
  },

  // --- FACTORY & MANUFACTURING ---
  {
    id: "deal-209",
    dealName: "Apex Automotive 50,000-Unit Stamping OEM Contract",
    customerName: "Apex Automotive Tier 1",
    customerEmail: "procurement@apexauto-mfg.com",
    amount: 340000.00,
    stage: "closed_won",
    probability: 100,
    expectedCloseDate: "2026-10-15",
    rep: "Vikram Malhotra",
    businessType: "factory"
  },
  {
    id: "deal-210",
    dealName: "Midwest Appliance Electric Motor Shafts Supply",
    customerName: "Midwest Heavy Assembly Corp",
    customerEmail: "bids@midwestassembly.com",
    amount: 185000.00,
    stage: "proposal",
    probability: 75,
    expectedCloseDate: "2026-11-25",
    rep: "Vikram Malhotra",
    businessType: "factory"
  },
  {
    id: "deal-211",
    dealName: "Rail Coupler High-Yield Casting Tender",
    customerName: "Titan Precision Machining",
    customerEmail: "contracting@titanmachining.com",
    amount: 260000.00,
    stage: "negotiation",
    probability: 85,
    expectedCloseDate: "2026-12-10",
    rep: "Helena Vance",
    businessType: "factory"
  },

  // --- HEAVY INDUSTRIES & INFRASTRUCTURE ---
  {
    id: "deal-212",
    dealName: "National Supergrid 33kV Substation EPC Turnkey",
    customerName: "National Infrastructure Corp",
    customerEmail: "epc.tenders@nationalinfra.gov",
    amount: 850000.00,
    stage: "closed_won",
    probability: 100,
    expectedCloseDate: "2026-10-10",
    rep: "Chief Engineer Roy",
    businessType: "industry"
  },
  {
    id: "deal-213",
    dealName: "Deepwater Port Container Crane Modernization",
    customerName: "Pacific Logistics Terminals",
    customerEmail: "port.ops@pacificterminals.org",
    amount: 1200000.00,
    stage: "proposal",
    probability: 70,
    expectedCloseDate: "2026-12-20",
    rep: "Marcus Vance",
    businessType: "industry"
  },

  // --- E-COMMERCE & D2C BRANDS ---
  {
    id: "deal-214",
    dealName: "Black Friday Early-Access Flash Sale D2C Volume",
    customerName: "D2C Online Storefront",
    customerEmail: "orders@omnipulse-shop.com",
    amount: 142000.00,
    stage: "closed_won",
    probability: 100,
    expectedCloseDate: "2026-10-25",
    rep: "Shopify Storefront",
    businessType: "ecommerce"
  },
  {
    id: "deal-215",
    dealName: "Corporate Holiday Gift Hampers Batch (2,000 Pcs)",
    customerName: "Prime Delivery Club",
    customerEmail: "vip.corporate@primedelivery.io",
    amount: 48500.00,
    stage: "proposal",
    probability: 65,
    expectedCloseDate: "2026-11-15",
    rep: "Chloe Bennett",
    businessType: "ecommerce"
  }
];

export const seedProducts = [
  // --- SOFTWARE / SAAS TECH ---
  {
    id: "prod-301",
    name: "OmniPulse Enterprise Core",
    sku: "OP-ENT-001",
    category: "Software Subscription",
    price: 2400.00,
    costPrice: 320.00,
    stockQty: 9999,
    minStockLevel: 50,
    status: "active",
    rating: 4.9,
    salesCount: 1420,
    businessType: "software"
  },
  {
    id: "prod-302",
    name: "Edge IoT Analytics Hardware Sensor Gateway",
    sku: "HW-IOT-GW4",
    category: "Hardware Devices",
    price: 489.00,
    costPrice: 210.00,
    stockQty: 85,
    minStockLevel: 25,
    status: "active",
    rating: 4.7,
    salesCount: 540,
    businessType: "software"
  },
  {
    id: "prod-303",
    name: "AI Predictive Engine Add-on",
    sku: "AI-MOD-09",
    category: "Add-on Module",
    price: 890.00,
    costPrice: 95.00,
    stockQty: 9999,
    minStockLevel: 10,
    status: "active",
    rating: 4.8,
    salesCount: 890,
    businessType: "software"
  },
  {
    id: "prod-304",
    name: "Enterprise Dedicated Server Appliance (Rack 2U)",
    sku: "HW-RACK-2U",
    category: "Hardware Appliances",
    price: 5400.00,
    costPrice: 3800.00,
    stockQty: 8,
    minStockLevel: 15,
    status: "active",
    rating: 4.6,
    salesCount: 42,
    businessType: "software"
  },
  {
    id: "prod-305",
    name: "Premium 24/7 SLA Engineering Support",
    sku: "SVC-SLA-247",
    category: "Professional Services",
    price: 1500.00,
    costPrice: 400.00,
    stockQty: 999,
    minStockLevel: 5,
    status: "active",
    rating: 5.0,
    salesCount: 215,
    businessType: "software"
  },

  // --- RETAIL SHOP & STORE ---
  {
    id: "prod-306",
    name: "Premium Arabica Espresso Beans (1kg Bag)",
    sku: "SHP-COF-01",
    category: "Store Goods",
    price: 32.00,
    costPrice: 14.50,
    stockQty: 240,
    minStockLevel: 50,
    status: "active",
    rating: 4.9,
    salesCount: 1850,
    businessType: "shop"
  },
  {
    id: "prod-307",
    name: "Wireless Laser Barcode Scanner Gen-4",
    sku: "SHP-BC-SCAN",
    category: "Store Equipment",
    price: 129.00,
    costPrice: 62.00,
    stockQty: 18,
    minStockLevel: 5,
    status: "active",
    rating: 4.8,
    salesCount: 94,
    businessType: "shop"
  },
  {
    id: "prod-308",
    name: "Thermal POS Cash Register Rolls (Pack of 50)",
    sku: "SHP-POS-RL",
    category: "Store Supplies",
    price: 45.00,
    costPrice: 18.00,
    stockQty: 85,
    minStockLevel: 25,
    status: "active",
    rating: 4.7,
    salesCount: 310,
    businessType: "shop"
  },

  // --- FACTORY & MANUFACTURING ---
  {
    id: "prod-309",
    name: "Precision Hydraulic Cylinder 40mm Stroke",
    sku: "FAC-HYD-40",
    category: "Fabricated Assembly",
    price: 620.00,
    costPrice: 310.00,
    stockQty: 120,
    minStockLevel: 30,
    status: "active",
    rating: 4.9,
    salesCount: 460,
    businessType: "factory"
  },
  {
    id: "prod-310",
    name: "Heavy Industrial Planetary Gearbox 5:1",
    sku: "FAC-GBX-51",
    category: "Heavy Machinery",
    price: 1450.00,
    costPrice: 820.00,
    stockQty: 24,
    minStockLevel: 10,
    status: "active",
    rating: 4.8,
    salesCount: 88,
    businessType: "factory"
  },
  {
    id: "prod-311",
    name: "High-Tensile M12 Fastener Box (1,000 Pcs)",
    sku: "FAC-FST-M12",
    category: "Hardware Fasteners",
    price: 180.00,
    costPrice: 75.00,
    stockQty: 450,
    minStockLevel: 100,
    status: "active",
    rating: 4.6,
    salesCount: 920,
    businessType: "factory"
  },

  // --- HEAVY INDUSTRIES & INFRASTRUCTURE ---
  {
    id: "prod-312",
    name: "50-Ton Crawler Crane Winch Assembly",
    sku: "IND-CRN-50",
    category: "Structural Machinery",
    price: 42000.00,
    costPrice: 26000.00,
    stockQty: 3,
    minStockLevel: 2,
    status: "active",
    rating: 5.0,
    salesCount: 14,
    businessType: "industry"
  },
  {
    id: "prod-313",
    name: "Industrial Substation Transformer 33kV/415V",
    sku: "IND-XFR-33KV",
    category: "Power Infrastructure",
    price: 65000.00,
    costPrice: 41000.00,
    stockQty: 2,
    minStockLevel: 1,
    status: "active",
    rating: 4.9,
    salesCount: 8,
    businessType: "industry"
  },
  {
    id: "prod-314",
    name: "Pre-stressed Concrete Bridge Girder (30m)",
    sku: "IND-GDR-30M",
    category: "Civil Construction",
    price: 18500.00,
    costPrice: 11000.00,
    stockQty: 8,
    minStockLevel: 4,
    status: "active",
    rating: 4.8,
    salesCount: 32,
    businessType: "industry"
  },

  // --- E-COMMERCE & D2C BRANDS ---
  {
    id: "prod-315",
    name: "Ergonomic Memory Foam Pillow (CoolGel)",
    sku: "ECM-PLW-CG",
    category: "Consumer Goods",
    price: 79.00,
    costPrice: 22.00,
    stockQty: 640,
    minStockLevel: 150,
    status: "active",
    rating: 4.8,
    salesCount: 3410,
    businessType: "ecommerce"
  },
  {
    id: "prod-316",
    name: "Active Noise Cancelling Wireless Earbuds Pro",
    sku: "ECM-EAR-ANC",
    category: "Consumer Electronics",
    price: 149.00,
    costPrice: 48.00,
    stockQty: 320,
    minStockLevel: 80,
    status: "active",
    rating: 4.9,
    salesCount: 2180,
    businessType: "ecommerce"
  },
  {
    id: "prod-317",
    name: "Vacuum Insulated Stainless Steel Tumbler (1L)",
    sku: "ECM-TMB-1L",
    category: "Lifestyle & Gear",
    price: 38.00,
    costPrice: 9.50,
    stockQty: 1150,
    minStockLevel: 200,
    status: "active",
    rating: 4.7,
    salesCount: 5200,
    businessType: "ecommerce"
  }
];

export const seedCustomers = [
  // --- SOFTWARE / SAAS TECH ---
  {
    id: "cust-401",
    name: "Marcus Vance",
    email: "marcus.vance@apexfintech.io",
    company: "Apex Fintech Corp",
    phone: "+1 (415) 890-2341",
    status: "active",
    totalSpend: 168000.00,
    dealsCount: 4,
    lastContacted: "2026-10-22",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    businessType: "software"
  },
  {
    id: "cust-402",
    name: "Sofia Lindqvist",
    email: "s.lindqvist@nordiclog.se",
    company: "Nordic Logistics Group",
    phone: "+46 8 123 4567",
    status: "active",
    totalSpend: 94500.00,
    dealsCount: 2,
    lastContacted: "2026-10-25",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    businessType: "software"
  },
  {
    id: "cust-403",
    name: "Alexander Becker",
    email: "alex@berlintechno.de",
    company: "Berlin Mobility Labs",
    phone: "+49 30 8892 110",
    status: "churned",
    totalSpend: 18400.00,
    dealsCount: 1,
    lastContacted: "2026-09-14",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    businessType: "software"
  },

  // --- RETAIL SHOP & STORE ---
  {
    id: "cust-404",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@starlight.com",
    company: "Downtown Cafe & Bakery",
    phone: "+1 (212) 441-9801",
    status: "active",
    totalSpend: 28400.00,
    dealsCount: 3,
    lastContacted: "2026-10-19",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    businessType: "shop"
  },
  {
    id: "cust-405",
    name: "Liam O'Connor",
    email: "liam@cornerdelimart.com",
    company: "Corner Deli Mart",
    phone: "+1 (617) 555-0182",
    status: "active",
    totalSpend: 14200.00,
    dealsCount: 2,
    lastContacted: "2026-10-24",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    businessType: "shop"
  },

  // --- FACTORY & MANUFACTURING ---
  {
    id: "cust-406",
    name: "Vikram Malhotra",
    email: "procurement@apexauto-mfg.com",
    company: "Apex Automotive Tier 1",
    phone: "+1 (313) 490-8812",
    status: "active",
    totalSpend: 680000.00,
    dealsCount: 5,
    lastContacted: "2026-10-20",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    businessType: "factory"
  },
  {
    id: "cust-407",
    name: "Hans Gruber",
    email: "hans@titanmachining.com",
    company: "Titan Precision Machining",
    phone: "+49 711 500 291",
    status: "active",
    totalSpend: 240000.00,
    dealsCount: 3,
    lastContacted: "2026-10-18",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    businessType: "factory"
  },

  // --- HEAVY INDUSTRIES & INFRASTRUCTURE ---
  {
    id: "cust-408",
    name: "Kenji Tanaka",
    email: "k.tanaka@kuroda-hi.co.jp",
    company: "Kuroda Heavy Industries",
    phone: "+81 3 5555 0192",
    status: "active",
    totalSpend: 1250000.00,
    dealsCount: 2,
    lastContacted: "2026-10-20",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    businessType: "industry"
  },
  {
    id: "cust-409",
    name: "Alastair Sterling",
    email: "epc@nationalinfra.gov",
    company: "National Infrastructure Corp",
    phone: "+44 20 7946 0912",
    status: "active",
    totalSpend: 2400000.00,
    dealsCount: 4,
    lastContacted: "2026-10-15",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    businessType: "industry"
  },

  // --- E-COMMERCE & D2C BRANDS ---
  {
    id: "cust-410",
    name: "Chloe Bennett",
    email: "chloe.b@primeclub.com",
    company: "VIP Platinum Subscriber Club",
    phone: "+1 (310) 882-9901",
    status: "active",
    totalSpend: 184000.00,
    dealsCount: 12,
    lastContacted: "2026-10-25",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    businessType: "ecommerce"
  }
];

export const seedStock = [
  // --- SOFTWARE / SAAS TECH ---
  {
    id: "stk-501",
    productId: "prod-302",
    productName: "Edge IoT Analytics Hardware Sensor Gateway",
    sku: "HW-IOT-GW4",
    warehouse: "North America Hub (Chicago)",
    currentStock: 85,
    reservedStock: 14,
    minThreshold: 25,
    status: "in_stock",
    lastRestocked: "2026-10-10",
    businessType: "software"
  },
  {
    id: "stk-502",
    productId: "prod-304",
    productName: "Enterprise Dedicated Server Appliance (Rack 2U)",
    sku: "HW-RACK-2U",
    warehouse: "EU Central Hub (Frankfurt)",
    currentStock: 8,
    reservedStock: 5,
    minThreshold: 15,
    status: "low_stock",
    lastRestocked: "2026-09-28",
    businessType: "software"
  },

  // --- RETAIL SHOP & STORE ---
  {
    id: "stk-503",
    productId: "prod-306",
    productName: "Premium Arabica Espresso Beans (1kg Bag)",
    sku: "SHP-COF-01",
    warehouse: "Storefront Shelf Aisle 2",
    currentStock: 240,
    reservedStock: 35,
    minThreshold: 50,
    status: "in_stock",
    lastRestocked: "2026-10-22",
    businessType: "shop"
  },
  {
    id: "stk-504",
    productId: "prod-308",
    productName: "Thermal POS Cash Register Rolls (Pack of 50)",
    sku: "SHP-POS-RL",
    warehouse: "Store Checkout Storage Bay",
    currentStock: 85,
    reservedStock: 12,
    minThreshold: 25,
    status: "in_stock",
    lastRestocked: "2026-10-15",
    businessType: "shop"
  },

  // --- FACTORY & MANUFACTURING ---
  {
    id: "stk-505",
    productId: "prod-309",
    productName: "Precision Hydraulic Cylinder 40mm Stroke",
    sku: "FAC-HYD-40",
    warehouse: "Plant Pallet Staging Bay 3",
    currentStock: 120,
    reservedStock: 45,
    minThreshold: 30,
    status: "in_stock",
    lastRestocked: "2026-10-19",
    businessType: "factory"
  },
  {
    id: "stk-506",
    productId: "prod-310",
    productName: "Heavy Industrial Planetary Gearbox 5:1",
    sku: "FAC-GBX-51",
    warehouse: "Heavy Machinery Crate Depot",
    currentStock: 24,
    reservedStock: 16,
    minThreshold: 10,
    status: "in_stock",
    lastRestocked: "2026-10-12",
    businessType: "factory"
  },

  // --- HEAVY INDUSTRIES & INFRASTRUCTURE ---
  {
    id: "stk-507",
    productId: "prod-313",
    productName: "Industrial Substation Transformer 33kV/415V",
    sku: "IND-XFR-33KV",
    warehouse: "Central Heavy Equipment Yard",
    currentStock: 2,
    reservedStock: 1,
    minThreshold: 1,
    status: "low_stock",
    lastRestocked: "2026-09-30",
    businessType: "industry"
  },
  {
    id: "stk-508",
    productId: "prod-314",
    productName: "Pre-stressed Concrete Bridge Girder (30m)",
    sku: "IND-GDR-30M",
    warehouse: "Depot Structural Staging Yard",
    currentStock: 8,
    reservedStock: 6,
    minThreshold: 4,
    status: "in_stock",
    lastRestocked: "2026-10-05",
    businessType: "industry"
  },

  // --- E-COMMERCE & D2C BRANDS ---
  {
    id: "stk-509",
    productId: "prod-315",
    productName: "Ergonomic Memory Foam Pillow (CoolGel)",
    sku: "ECM-PLW-CG",
    warehouse: "3PL Fulfillment Center (Bin A-14)",
    currentStock: 640,
    reservedStock: 120,
    minThreshold: 150,
    status: "in_stock",
    lastRestocked: "2026-10-21",
    businessType: "ecommerce"
  },
  {
    id: "stk-510",
    productId: "prod-316",
    productName: "Active Noise Cancelling Wireless Earbuds Pro",
    sku: "ECM-EAR-ANC",
    warehouse: "High-Value Security Cage C",
    currentStock: 320,
    reservedStock: 85,
    minThreshold: 80,
    status: "in_stock",
    lastRestocked: "2026-10-18",
    businessType: "ecommerce"
  }
];

export const seedRevenue = {
  overview: {
    mrr: 184500.00,
    arr: 2214000.00,
    netRevenueMTD: 241800.00,
    grossMargin: 82.4,
    churnRate: 1.15,
    growthRateMoM: 18.7,
    activePaidAccounts: 842,
    arpu: 219.00
  },
  verticalMetrics: {
    all: {
      totalVolume: 1864000,
      monthlyRunRate: 312000,
      netMargin: 78.4,
      openPipeline: 3450000,
      activeEntities: 1240,
      growthMoM: 21.4
    },
    software: {
      totalVolume: 241800,
      monthlyRunRate: 184500,
      netMargin: 82.4,
      openPipeline: 313000,
      activeEntities: 842,
      growthMoM: 18.7
    },
    shop: {
      totalVolume: 89400,
      monthlyRunRate: 64200,
      netMargin: 64.2,
      openPipeline: 25600,
      activeEntities: 380,
      growthMoM: 14.2
    },
    factory: {
      totalVolume: 785000,
      monthlyRunRate: 420000,
      netMargin: 42.8,
      openPipeline: 785000,
      activeEntities: 48,
      growthMoM: 22.5
    },
    industry: {
      totalVolume: 2450000,
      monthlyRunRate: 1120000,
      netMargin: 36.5,
      openPipeline: 2050000,
      activeEntities: 18,
      growthMoM: 28.1
    },
    ecommerce: {
      totalVolume: 295000,
      monthlyRunRate: 210000,
      netMargin: 58.2,
      openPipeline: 190500,
      activeEntities: 2140,
      growthMoM: 31.8
    }
  },
  monthlyTrends: [
    { month: "May", mrr: 122000, revenue: 140000, expenses: 45000, profit: 95000 },
    { month: "Jun", mrr: 135000, revenue: 158000, expenses: 49000, profit: 109000 },
    { month: "Jul", mrr: 146000, revenue: 172000, expenses: 51000, profit: 121000 },
    { month: "Aug", mrr: 159000, revenue: 191000, expenses: 56000, profit: 135000 },
    { month: "Sep", mrr: 171000, revenue: 215000, expenses: 60000, profit: 155000 },
    { month: "Oct", mrr: 184500, revenue: 241800, expenses: 64200, profit: 177600 }
  ],
  revenueStreams: [
    { category: "SaaS Enterprise Subscriptions", percentage: 42, amount: 140244, vertical: "software" },
    { category: "Heavy Infrastructure EPC Tenders", percentage: 28, amount: 93496, vertical: "industry" },
    { category: "Factory Wholesale OEM Contracts", percentage: 16, amount: 53196, vertical: "factory" },
    { category: "D2C E-Commerce Flash Volumes", percentage: 9, amount: 30034, vertical: "ecommerce" },
    { category: "Retail Counter Store Sales", percentage: 5, amount: 16686, vertical: "shop" }
  ]
};
