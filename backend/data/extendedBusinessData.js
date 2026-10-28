/**
 * Extended Business Registry & Data Layer
 * 12 Multi-Industry Commercial Businesses + 1 Zero-State Empty Testing Account
 */

export const EXTENDED_TENANTS = [
  // 1. Biotech & Pharmaceuticals
  {
    _id: 'tenant-biogenix',
    id: 'tenant-biogenix',
    name: 'BioGenix Therapeutics & Clinical Labs',
    slug: 'biogenix-rx',
    vertical: 'manufacturing',
    status: 'active',
    planTier: 'enterprise',
    currency: 'INR',
    timezone: 'America/New_York',
    limits: { maxUsers: 50, maxSkus: 20000, maxInvoicesPerMonth: 5000, maxBusinesses: 99 },
    allowedVerticals: ['all', 'manufacturing', 'software'],
    settings: {
      enabledModules: ['bills', 'sales', 'products', 'stock', 'revenue', 'customers', 'gl_ledger', 'dashboard'],
    },
  },
  // 2. Solar & Clean Energy EPC
  {
    _id: 'tenant-solaris',
    id: 'tenant-solaris',
    name: 'Solaris CleanTech & Solar Energy Grid',
    slug: 'solaris-energy',
    vertical: 'industry',
    status: 'active',
    planTier: 'enterprise',
    currency: 'INR',
    timezone: 'America/Phoenix',
    limits: { maxUsers: 60, maxSkus: 15000, maxInvoicesPerMonth: 5000, maxBusinesses: 99 },
    allowedVerticals: ['all', 'industry', 'factory'],
    settings: {
      enabledModules: ['bills', 'sales', 'products', 'stock', 'revenue', 'customers', 'gl_ledger', 'dashboard'],
    },
  },
  // 3. Global 3PL Freight & Logistics
  {
    _id: 'tenant-vanguard',
    id: 'tenant-vanguard',
    name: 'Vanguard 3PL Global Multimodal Logistics',
    slug: 'vanguard-logistics',
    vertical: 'industry',
    status: 'active',
    planTier: 'growth',
    currency: 'INR',
    timezone: 'America/Chicago',
    limits: { maxUsers: 30, maxSkus: 8000, maxInvoicesPerMonth: 3000, maxBusinesses: 3 },
    allowedVerticals: ['industry', 'ecommerce'],
    settings: {
      enabledModules: ['bills', 'sales', 'products', 'stock', 'revenue', 'customers', 'dashboard'],
    },
  },
  // 4. Commercial Real Estate & Construction
  {
    _id: 'tenant-skyline',
    id: 'tenant-skyline',
    name: 'Skyline Commercial Real Estate & EPC',
    slug: 'skyline-dev',
    vertical: 'industry',
    status: 'active',
    planTier: 'enterprise',
    currency: 'INR',
    timezone: 'America/New_York',
    limits: { maxUsers: 50, maxSkus: 25000, maxInvoicesPerMonth: 5000, maxBusinesses: 99 },
    allowedVerticals: ['all', 'industry'],
    settings: {
      enabledModules: ['bills', 'sales', 'products', 'stock', 'revenue', 'customers', 'gl_ledger', 'dashboard'],
    },
  },
  // 5. Luxury Resort & Hospitality
  {
    _id: 'tenant-auragrand',
    id: 'tenant-auragrand',
    name: 'Aura Grand Luxury Resort & Hospitality',
    slug: 'auragrand-resorts',
    vertical: 'shop',
    status: 'active',
    planTier: 'growth',
    currency: 'INR',
    timezone: 'America/Los_Angeles',
    limits: { maxUsers: 25, maxSkus: 4000, maxInvoicesPerMonth: 2000, maxBusinesses: 3 },
    allowedVerticals: ['shop', 'ecommerce'],
    settings: {
      enabledModules: ['bills', 'sales', 'products', 'revenue', 'customers', 'dashboard'],
    },
  },
  // 6. Cybersecurity SaaS
  {
    _id: 'tenant-cybershield',
    id: 'tenant-cybershield',
    name: 'CyberShield Zero-Trust Cloud Defense',
    slug: 'cybershield-sec',
    vertical: 'software',
    status: 'active',
    planTier: 'enterprise',
    currency: 'INR',
    timezone: 'America/Los_Angeles',
    limits: { maxUsers: 40, maxSkus: 2000, maxInvoicesPerMonth: 4000, maxBusinesses: 99 },
    allowedVerticals: ['all', 'software'],
    settings: {
      enabledModules: ['bills', 'sales', 'products', 'revenue', 'customers', 'gl_ledger', 'dashboard'],
    },
  },
  // 7. Food & Beverage Roastery Chain
  {
    _id: 'tenant-artisanroast',
    id: 'tenant-artisanroast',
    name: 'Artisan Specialty Roastery & Cafe Franchise',
    slug: 'artisan-roasters',
    vertical: 'shop',
    status: 'active',
    planTier: 'starter',
    currency: 'INR',
    timezone: 'America/Denver',
    limits: { maxUsers: 15, maxSkus: 1200, maxInvoicesPerMonth: 1000, maxBusinesses: 1 },
    allowedVerticals: ['shop'],
    settings: {
      enabledModules: ['bills', 'sales', 'products', 'stock', 'revenue', 'customers', 'dashboard'],
    },
  },
  // 8. Luxury Haute Couture & Fashion
  {
    _id: 'tenant-luxeatelier',
    id: 'tenant-luxeatelier',
    name: 'Luxe Atelier Haute Couture Paris',
    slug: 'luxe-atelier',
    vertical: 'ecommerce',
    status: 'active',
    planTier: 'growth',
    currency: 'INR',
    timezone: 'Europe/Paris',
    limits: { maxUsers: 20, maxSkus: 5000, maxInvoicesPerMonth: 2000, maxBusinesses: 3 },
    allowedVerticals: ['ecommerce', 'shop'],
    settings: {
      enabledModules: ['bills', 'sales', 'products', 'stock', 'revenue', 'customers', 'dashboard'],
    },
  },
  // 9. Commercial EV Fleets & Assembly
  {
    _id: 'tenant-voltmotors',
    id: 'tenant-voltmotors',
    name: 'VoltMotors Commercial EV Fleets',
    slug: 'voltmotors-ev',
    vertical: 'factory',
    status: 'active',
    planTier: 'enterprise',
    currency: 'INR',
    timezone: 'Europe/Stockholm',
    limits: { maxUsers: 50, maxSkus: 30000, maxInvoicesPerMonth: 6000, maxBusinesses: 99 },
    allowedVerticals: ['all', 'factory', 'industry'],
    settings: {
      enabledModules: ['bills', 'sales', 'products', 'stock', 'revenue', 'customers', 'gl_ledger', 'dashboard'],
    },
  },
  // 10. Aerospace Precision Machining & Avionics
  {
    _id: 'tenant-aerospace',
    id: 'tenant-aerospace',
    name: 'AeroSpace Precision Avionics & Defense',
    slug: 'aerospace-dyn',
    vertical: 'factory',
    status: 'active',
    planTier: 'enterprise',
    currency: 'INR',
    timezone: 'America/Chicago',
    limits: { maxUsers: 50, maxSkus: 20000, maxInvoicesPerMonth: 5000, maxBusinesses: 99 },
    allowedVerticals: ['all', 'factory', 'industry'],
    settings: {
      enabledModules: ['bills', 'sales', 'products', 'stock', 'revenue', 'customers', 'gl_ledger', 'dashboard'],
    },
  },
  // 11. Agriculture & Bulk Grain Commodity Exports
  {
    _id: 'tenant-terragro',
    id: 'tenant-terragro',
    name: 'TerraGro Agritech & Grain Commodity Exports',
    slug: 'terragro-agri',
    vertical: 'industry',
    status: 'active',
    planTier: 'growth',
    currency: 'INR',
    timezone: 'America/Chicago',
    limits: { maxUsers: 30, maxSkus: 5000, maxInvoicesPerMonth: 2500, maxBusinesses: 3 },
    allowedVerticals: ['industry', 'shop'],
    settings: {
      enabledModules: ['bills', 'sales', 'products', 'stock', 'revenue', 'customers', 'dashboard'],
    },
  },
  // 12. Media, Streaming & Virtual Production
  {
    _id: 'tenant-cinewave',
    id: 'tenant-cinewave',
    name: 'CineWave Virtual Studios & Streaming Media',
    slug: 'cinewave-studios',
    vertical: 'software',
    status: 'active',
    planTier: 'enterprise',
    currency: 'INR',
    timezone: 'America/Los_Angeles',
    limits: { maxUsers: 40, maxSkus: 1500, maxInvoicesPerMonth: 3000, maxBusinesses: 99 },
    allowedVerticals: ['all', 'software'],
    settings: {
      enabledModules: ['bills', 'sales', 'products', 'revenue', 'customers', 'gl_ledger', 'dashboard'],
    },
  },
  // 13. Clean Slate Account (0 of everything for testing empty state)
  {
    _id: 'tenant-empty',
    id: 'tenant-empty',
    name: 'Blank Slate Co. (Fresh Zero-State Account)',
    slug: 'blank-slate-zero',
    vertical: 'software',
    status: 'active',
    planTier: 'starter',
    currency: 'INR',
    timezone: 'UTC',
    limits: { maxUsers: 5, maxSkus: 100, maxInvoicesPerMonth: 50, maxBusinesses: 1 },
    allowedVerticals: ['software'],
    settings: {
      enabledModules: ['bills', 'sales', 'products', 'revenue', 'customers', 'dashboard'],
    },
  },
];

export const EXTENDED_DEMO_USERS = [
  // 1. BioGenix
  {
    id: 'user-010',
    name: 'Dr. Aris Thorne',
    email: 'aris.thorne@biogenix-rx.com',
    password: 'password123',
    role: 'admin',
    tenantId: 'tenant-biogenix',
    companyName: 'BioGenix Therapeutics & Clinical Labs',
    companyType: 'manufacturing',
    department: 'Clinical R&D & Diagnostics',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    bio: 'Chief Medical Officer directing oncology diagnostics, FDA trials, and robotic synthesizer calibration.',
  },
  // 2. Solaris
  {
    id: 'user-011',
    name: 'Elena Rostova',
    email: 'elena.r@solarisenergy.com',
    password: 'password123',
    role: 'admin',
    tenantId: 'tenant-solaris',
    companyName: 'Solaris CleanTech & Solar Energy Grid',
    companyType: 'industry',
    department: 'Solar Megawatt EPC',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    bio: 'VP Solar Infrastructure managing utility-scale photovoltaic parks and high-voltage battery storage.',
  },
  // 3. Vanguard
  {
    id: 'user-012',
    name: 'Capt. Trevor Hayes',
    email: 't.hayes@vanguard-logistics.net',
    password: 'password123',
    role: 'manager',
    tenantId: 'tenant-vanguard',
    companyName: 'Vanguard 3PL Global Multimodal Logistics',
    companyType: 'industry',
    department: 'Freight Dispatch & Fleet Ops',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'Fleet Logistics Commander tracking 240 refrigerated trailers, ocean containers and customs clearances.',
  },
  // 4. Skyline
  {
    id: 'user-013',
    name: 'Brandon Vance',
    email: 'brandon@skyline-devcorp.com',
    password: 'password123',
    role: 'admin',
    tenantId: 'tenant-skyline',
    companyName: 'Skyline Commercial Real Estate & EPC',
    companyType: 'industry',
    department: 'Capital Development & Construction',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    bio: 'Managing Partner presiding over 40-story commercial skyscraper development, zoning and structural steel.',
  },
  // 5. Aura Grand
  {
    id: 'user-014',
    name: 'Sophie Laurent',
    email: 'sophie.l@auragrandresorts.com',
    password: 'password123',
    role: 'admin',
    tenantId: 'tenant-auragrand',
    companyName: 'Aura Grand Luxury Resort & Hospitality',
    companyType: 'shop',
    department: 'Resort Executive Operations',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    bio: 'General Manager supervising 5-star beachfront suites, Michelin fine dining and spa retail concessions.',
  },
  // 6. CyberShield
  {
    id: 'user-015',
    name: 'Tariq Al-Mansoor',
    email: 'tariq@cybershield-sec.io',
    password: 'password123',
    role: 'admin',
    tenantId: 'tenant-cybershield',
    companyName: 'CyberShield Zero-Trust Cloud Defense',
    companyType: 'software',
    department: 'Information Security & Telemetry',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'CISO overseeing global SIEM telemetry, zero-day threat response, and enterprise ARR subscriptions.',
  },
  // 7. Artisan Roasters
  {
    id: 'user-016',
    name: 'Matteo Bianchi',
    email: 'matteo@artisanroasters.com',
    password: 'password123',
    role: 'admin',
    tenantId: 'tenant-artisanroast',
    companyName: 'Artisan Specialty Roastery & Cafe Franchise',
    companyType: 'shop',
    department: 'Master Roasting & Retail',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    bio: 'Founding Roaster sourcing micro-lot beans from Ethiopia & Colombia across 14 franchised cafes.',
  },
  // 8. Luxe Atelier
  {
    id: 'user-017',
    name: 'Vivienne Chen',
    email: 'vivienne@luxe-atelier.paris',
    password: 'password123',
    role: 'admin',
    tenantId: 'tenant-luxeatelier',
    companyName: 'Luxe Atelier Haute Couture Paris',
    companyType: 'ecommerce',
    department: 'Atelier Design & D2C Sales',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Creative Director crafting bespoke runway eveningwear with global VIP concierge fulfillment.',
  },
  // 9. VoltMotors
  {
    id: 'user-018',
    name: 'Henrik Lindqvist',
    email: 'henrik.l@voltmotors-ev.com',
    password: 'password123',
    role: 'admin',
    tenantId: 'tenant-voltmotors',
    companyName: 'VoltMotors Commercial EV Fleets',
    companyType: 'factory',
    department: 'EV Powertrain & Robotics Assembly',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    bio: 'Chief Production Engineer assembling heavy-duty electric commercial chassis & battery pack lines.',
  },
  // 10. AeroSpace
  {
    id: 'user-019',
    name: 'Col. Nathan Drake',
    email: 'nathan.drake@aerospace-dyn.com',
    password: 'password123',
    role: 'admin',
    tenantId: 'tenant-aerospace',
    companyName: 'AeroSpace Precision Avionics & Defense',
    companyType: 'factory',
    department: 'Defense Programs & AS9100 Machining',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    bio: 'VP Defense Programs managing 5-axis titanium milling for jet turbine vanes and radar arrays.',
  },
  // 11. TerraGro
  {
    id: 'user-020',
    name: 'Clara Thorne',
    email: 'clara.t@terragro-agri.com',
    password: 'password123',
    role: 'admin',
    tenantId: 'tenant-terragro',
    companyName: 'TerraGro Agritech & Grain Commodity Exports',
    companyType: 'industry',
    department: 'Global Commodity Trading & Grain Silos',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bio: 'Director Grain Trading coordinating 45,000-ton bulk wheat vessels and drone yield tracking.',
  },
  // 12. CineWave
  {
    id: 'user-021',
    name: 'Julian Mercer',
    email: 'julian.mercer@cinewavestudios.com',
    password: 'password123',
    role: 'admin',
    tenantId: 'tenant-cinewave',
    companyName: 'CineWave Virtual Studios & Streaming Media',
    companyType: 'software',
    department: 'Virtual Production & VFX Soundstages',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    bio: 'Executive Producer managing real-time Unreal Engine LED volume stages and syndication rights.',
  },
  // 13. Blank Slate / Zero Account
  {
    id: 'user-022',
    name: 'Jordan Zero',
    email: 'empty@omnipulse.local',
    password: 'password123',
    role: 'admin',
    tenantId: 'tenant-empty',
    companyName: 'Blank Slate Co. (Fresh Zero-State Account)',
    companyType: 'software',
    department: 'New Organization Onboarding',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: 'Brand-new empty account with 0 products, 0 bills, 0 sales, and 0 ledger records for testing zero states.',
  },
];

/**
 * Curated distinct products for the 12 businesses (tenant-empty has NONE)
 */
export const EXTENDED_PRODUCTS = [
  // BioGenix
  { id: 'prod-bg-1', tenantId: 'tenant-biogenix', name: 'NanoSeq-48 DNA Sequencing Cartridge Pack', sku: 'SKU-BIO-001', category: 'Genomics', price: 4200, costPrice: 1650, stockQty: 45, minStockLevel: 10, status: 'in_stock', businessType: 'manufacturing' },
  { id: 'prod-bg-2', tenantId: 'tenant-biogenix', name: 'CRISPR Gene Editing Reagent Kit (100 rxn)', sku: 'SKU-BIO-002', category: 'Reagents', price: 1850, costPrice: 420, stockQty: 90, minStockLevel: 20, status: 'in_stock', businessType: 'manufacturing' },
  { id: 'prod-bg-3', tenantId: 'tenant-biogenix', name: 'Automated Microfluidic Cell Sorter Pipette', sku: 'SKU-BIO-003', category: 'Equipment', price: 12500, costPrice: 5200, stockQty: 12, minStockLevel: 3, status: 'in_stock', businessType: 'manufacturing' },

  // Solaris
  { id: 'prod-sol-1', tenantId: 'tenant-solaris', name: 'Bi-Facial 650W Monocrystalline PV Panel (Pallet of 30)', sku: 'SKU-SOL-101', category: 'Solar Modules', price: 6800, costPrice: 3900, stockQty: 80, minStockLevel: 15, status: 'in_stock', businessType: 'industry' },
  { id: 'prod-sol-2', tenantId: 'tenant-solaris', name: 'Megawatt Central Inverter 1500V String Unit', sku: 'SKU-SOL-102', category: 'Inverters', price: 42000, costPrice: 24000, stockQty: 8, minStockLevel: 2, status: 'in_stock', businessType: 'industry' },

  // Vanguard Logistics
  { id: 'prod-van-1', tenantId: 'tenant-vanguard', name: 'Cross-Docking & Pallet Storage (Per Month Slot)', sku: 'SKU-VAN-201', category: 'Warehousing', price: 85, costPrice: 22, stockQty: 1200, minStockLevel: 100, status: 'in_stock', businessType: 'industry' },
  { id: 'prod-van-2', tenantId: 'tenant-vanguard', name: 'Refrigerated 40ft Reefer Intermodal Transit Line', sku: 'SKU-VAN-202', category: 'Freight', price: 3400, costPrice: 1950, stockQty: 150, minStockLevel: 25, status: 'in_stock', businessType: 'industry' },

  // Skyline
  { id: 'prod-sky-1', tenantId: 'tenant-skyline', name: 'Pre-Cast Reinforced Concrete Grade-A Column', sku: 'SKU-SKY-301', category: 'Structural', price: 2800, costPrice: 1100, stockQty: 60, minStockLevel: 10, status: 'in_stock', businessType: 'industry' },
  { id: 'prod-sky-2', tenantId: 'tenant-skyline', name: 'Commercial Curtain Wall Glazing Unit (4m x 2m)', sku: 'SKU-SKY-302', category: 'Architectural Glazing', price: 1450, costPrice: 620, stockQty: 140, minStockLevel: 20, status: 'in_stock', businessType: 'industry' },

  // Aura Grand
  { id: 'prod-aur-1', tenantId: 'tenant-auragrand', name: 'Presidential Oceanfront Villa Nightly Booking', sku: 'SKU-AUR-401', category: 'Suites', price: 2200, costPrice: 480, stockQty: 6, minStockLevel: 1, status: 'in_stock', businessType: 'shop' },
  { id: 'prod-aur-2', tenantId: 'tenant-auragrand', name: 'Executive Chef 7-Course Wine Pairing Banquet Cover', sku: 'SKU-AUR-402', category: 'Dining', price: 295, costPrice: 75, stockQty: 80, minStockLevel: 10, status: 'in_stock', businessType: 'shop' },

  // CyberShield
  { id: 'prod-cs-1', tenantId: 'tenant-cybershield', name: 'Enterprise Zero-Trust Endpoint Sensor (Annual)', sku: 'SKU-CS-501', category: 'Endpoint Protection', price: 140, costPrice: 18, stockQty: 5000, minStockLevel: 500, status: 'in_stock', businessType: 'software' },
  { id: 'prod-cs-2', tenantId: 'tenant-cybershield', name: 'Cloud SIEM Telemetry & Threat Hunter License', sku: 'SKU-CS-502', category: 'Cloud SIEM', price: 24000, costPrice: 2800, stockQty: 40, minStockLevel: 5, status: 'in_stock', businessType: 'software' },

  // Artisan Roasters
  { id: 'prod-art-1', tenantId: 'tenant-artisanroast', name: 'Ethiopian Yirgacheffe Washed Grade 1 (25kg Sack)', sku: 'SKU-ART-601', category: 'Green Beans', price: 380, costPrice: 190, stockQty: 110, minStockLevel: 20, status: 'in_stock', businessType: 'shop' },
  { id: 'prod-art-2', tenantId: 'tenant-artisanroast', name: 'Commercial Dual-Boiler PID Espresso Station', sku: 'SKU-ART-602', category: 'Machinery', price: 8900, costPrice: 4800, stockQty: 15, minStockLevel: 3, status: 'in_stock', businessType: 'shop' },

  // Luxe Atelier
  { id: 'prod-lux-1', tenantId: 'tenant-luxeatelier', name: 'Hand-Embroidered Silk Organza Evening Gown', sku: 'SKU-LUX-701', category: 'Haute Couture', price: 6400, costPrice: 1400, stockQty: 8, minStockLevel: 2, status: 'in_stock', businessType: 'ecommerce' },
  { id: 'prod-lux-2', tenantId: 'tenant-luxeatelier', name: 'Full-Grain Italian Calfskin Structured Tote', sku: 'SKU-LUX-702', category: 'Leather Goods', price: 1950, costPrice: 410, stockQty: 35, minStockLevel: 8, status: 'in_stock', businessType: 'ecommerce' },

  // VoltMotors
  { id: 'prod-vm-1', tenantId: 'tenant-voltmotors', name: 'VoltDrive 180kW Electric Delivery Chassis', sku: 'SKU-VM-801', category: 'Chassis', price: 78000, costPrice: 46000, stockQty: 18, minStockLevel: 4, status: 'in_stock', businessType: 'factory' },
  { id: 'prod-vm-2', tenantId: 'tenant-voltmotors', name: '120kWh Liquid-Cooled LFP Battery Sub-Module', sku: 'SKU-VM-802', category: 'Powertrain', price: 24500, costPrice: 14200, stockQty: 40, minStockLevel: 8, status: 'in_stock', businessType: 'factory' },

  // AeroSpace
  { id: 'prod-aero-1', tenantId: 'tenant-aerospace', name: '5-Axis Titanium Jet Turbine Blisk (Stage 2)', sku: 'SKU-AERO-901', category: 'Turbomachinery', price: 38500, costPrice: 16800, stockQty: 14, minStockLevel: 3, status: 'in_stock', businessType: 'factory' },
  { id: 'prod-aero-2', tenantId: 'tenant-aerospace', name: 'Hermetic Military-Grade Fly-by-Wire Actuator', sku: 'SKU-AERO-902', category: 'Avionics', price: 14200, costPrice: 5900, stockQty: 26, minStockLevel: 6, status: 'in_stock', businessType: 'factory' },

  // TerraGro
  { id: 'prod-tg-1', tenantId: 'tenant-terragro', name: 'Grade #1 Hard Red Winter Wheat (100 Metric Ton Lot)', sku: 'SKU-TG-011', category: 'Bulk Grain', price: 28500, costPrice: 19800, stockQty: 45, minStockLevel: 10, status: 'in_stock', businessType: 'industry' },
  { id: 'prod-tg-2', tenantId: 'tenant-terragro', name: 'Non-GMO Food-Grade Soybeans (50 Metric Ton Lot)', sku: 'SKU-TG-012', category: 'Bulk Grain', price: 22000, costPrice: 15400, stockQty: 60, minStockLevel: 12, status: 'in_stock', businessType: 'industry' },

  // CineWave
  { id: 'prod-cw-1', tenantId: 'tenant-cinewave', name: 'LED Volume Virtual Soundstage Day-Rate (Stage A)', sku: 'SKU-CW-111', category: 'Production Services', price: 18500, costPrice: 5200, stockQty: 25, minStockLevel: 5, status: 'in_stock', businessType: 'software' },
  { id: 'prod-cw-2', tenantId: 'tenant-cinewave', name: 'Cloud GPU Raytracing Farm Render Units (10,000 hrs)', sku: 'SKU-CW-112', category: 'Cloud VFX', price: 7500, costPrice: 2100, stockQty: 50, minStockLevel: 10, status: 'in_stock', businessType: 'software' },
];

/**
 * Curated distinct vendor bills for the 12 businesses
 */
export const EXTENDED_BILLS = [
  // BioGenix
  { id: 'bill-bg-1', tenantId: 'tenant-biogenix', invoiceNumber: 'INV-BIO-8801', title: 'Cleanroom Hepa Filtration & Nitrogen Gas Supply', vendorOrClient: 'Praxair Industrial Gases', vendor: 'Praxair Industrial Gases', vendorName: 'Praxair Industrial Gases', amount: 16800, dueDate: '2026-11-15', category: 'Facilities', status: 'paid', paymentMethod: 'Corporate Wire', businessType: 'manufacturing' },
  { id: 'bill-bg-2', tenantId: 'tenant-biogenix', invoiceNumber: 'INV-BIO-8802', title: 'FDA 21 CFR Part 11 Regulatory Compliance Audit', vendorOrClient: 'BioPharma Assurance Group', vendor: 'BioPharma Assurance Group', vendorName: 'BioPharma Assurance Group', amount: 32000, dueDate: '2026-12-01', category: 'Compliance', status: 'pending', paymentMethod: 'ACH Transfer', businessType: 'manufacturing' },

  // Solaris
  { id: 'bill-sol-1', tenantId: 'tenant-solaris', invoiceNumber: 'INV-SOL-9101', title: 'Substation Step-Up High Voltage Transformer Delivery', vendorOrClient: 'ABB Power Grids Corp', vendor: 'ABB Power Grids Corp', vendorName: 'ABB Power Grids Corp', amount: 84000, dueDate: '2026-11-20', category: 'Equipment', status: 'paid', paymentMethod: 'Corporate Wire', businessType: 'industry' },
  { id: 'bill-sol-2', tenantId: 'tenant-solaris', invoiceNumber: 'INV-SOL-9102', title: 'Land Lease for 500-Acre Desert Solar Basin', vendorOrClient: 'Mojave Land & Energy Trust', vendor: 'Mojave Land & Energy Trust', vendorName: 'Mojave Land & Energy Trust', amount: 28000, dueDate: '2026-11-30', category: 'Leases', status: 'pending', paymentMethod: 'ACH Transfer', businessType: 'industry' },

  // Vanguard
  { id: 'bill-van-1', tenantId: 'tenant-vanguard', invoiceNumber: 'INV-VAN-7011', title: 'Bulk Commercial Diesel & Fleet Fuel Cards (Oct)', vendorOrClient: 'Pilot Flying J Fleet Solutions', vendor: 'Pilot Flying J Fleet Solutions', vendorName: 'Pilot Flying J Fleet Solutions', amount: 34500, dueDate: '2026-11-10', category: 'Fuel & Fleet', status: 'paid', paymentMethod: 'Corporate Wire', businessType: 'industry' },
  { id: 'bill-van-2', tenantId: 'tenant-vanguard', invoiceNumber: 'INV-VAN-7012', title: 'Automated Hub Sorting Conveyor Preventive Maintenance', vendorOrClient: 'Vanderlande Material Handling', vendor: 'Vanderlande Material Handling', vendorName: 'Vanderlande Material Handling', amount: 12800, dueDate: '2026-11-28', category: 'Maintenance', status: 'pending', paymentMethod: 'ACH Transfer', businessType: 'industry' },

  // Skyline
  { id: 'bill-sky-1', tenantId: 'tenant-skyline', invoiceNumber: 'INV-SKY-5501', title: 'Tower Crane 240-ft Rigging & Operator Retainer', vendorOrClient: 'Liebherr Heavy Cranes', vendor: 'Liebherr Heavy Cranes', vendorName: 'Liebherr Heavy Cranes', amount: 62000, dueDate: '2026-11-18', category: 'Heavy Plant', status: 'paid', paymentMethod: 'Corporate Wire', businessType: 'industry' },
  { id: 'bill-sky-2', tenantId: 'tenant-skyline', invoiceNumber: 'INV-SKY-5502', title: 'Architectural Engineering Blueprints & PE Stamping', vendorOrClient: 'Gensler Architectural Partners', vendor: 'Gensler Architectural Partners', vendorName: 'Gensler Architectural Partners', amount: 48000, dueDate: '2026-12-05', category: 'Professional Services', status: 'pending', paymentMethod: 'Corporate Wire', businessType: 'industry' },

  // Aura Grand
  { id: 'bill-aur-1', tenantId: 'tenant-auragrand', invoiceNumber: 'INV-AUR-3301', title: 'Luxury Egyptian Cotton Linens & Amenities', vendorOrClient: 'Frette Hospitality Fine Linens', vendor: 'Frette Hospitality Fine Linens', vendorName: 'Frette Hospitality Fine Linens', amount: 14200, dueDate: '2026-11-12', category: 'Operating Supplies', status: 'paid', paymentMethod: 'ACH Transfer', businessType: 'shop' },
  { id: 'bill-aur-2', tenantId: 'tenant-auragrand', invoiceNumber: 'INV-AUR-3302', title: 'Sommelier Reserve Wine & Champagne Consignment', vendorOrClient: 'Grand Cru Import Estates', vendor: 'Grand Cru Import Estates', vendorName: 'Grand Cru Import Estates', amount: 26500, dueDate: '2026-11-25', category: 'Food & Beverage', status: 'pending', paymentMethod: 'Corporate Wire', businessType: 'shop' },

  // CyberShield
  { id: 'bill-cs-1', tenantId: 'tenant-cybershield', invoiceNumber: 'INV-CS-4401', title: 'Multi-Region AWS Direct Connect & GuardDuty Cloud', vendorOrClient: 'Amazon Web Services Inc.', vendor: 'Amazon Web Services Inc.', vendorName: 'Amazon Web Services Inc.', amount: 18200, dueDate: '2026-11-14', category: 'Cloud Infrastructure', status: 'paid', paymentMethod: 'Corporate Wire', businessType: 'software' },
  { id: 'bill-cs-2', tenantId: 'tenant-cybershield', invoiceNumber: 'INV-CS-4402', title: 'Global HackerOne Bug Bounty Payout Escrow', vendorOrClient: 'HackerOne Community Ops', vendor: 'HackerOne Community Ops', vendorName: 'HackerOne Community Ops', amount: 15000, dueDate: '2026-12-01', category: 'Security Research', status: 'pending', paymentMethod: 'Credit Card', businessType: 'software' },

  // Artisan Roasters
  { id: 'bill-art-1', tenantId: 'tenant-artisanroast', invoiceNumber: 'INV-ART-2201', title: 'Direct-Trade Green Coffee Container (Antioquia Colombia)', vendorOrClient: 'Cafexport Direct Farming', vendor: 'Cafexport Direct Farming', vendorName: 'Cafexport Direct Farming', amount: 11400, dueDate: '2026-11-08', category: 'Raw Materials', status: 'paid', paymentMethod: 'ACH Transfer', businessType: 'shop' },
  { id: 'bill-art-2', tenantId: 'tenant-artisanroast', invoiceNumber: 'INV-ART-2202', title: 'Biodegradable Nitrogen-Flushed Foil Pouches (50,000 pcs)', vendorOrClient: 'SavorPack Custom Packaging', vendor: 'SavorPack Custom Packaging', vendorName: 'SavorPack Custom Packaging', amount: 6200, dueDate: '2026-11-22', category: 'Packaging', status: 'pending', paymentMethod: 'Credit Card', businessType: 'shop' },

  // Luxe Atelier
  { id: 'bill-lux-1', tenantId: 'tenant-luxeatelier', invoiceNumber: 'INV-LUX-1101', title: 'Como Mulberry Silk Crepe & Duchesse Satin Yardage', vendorOrClient: 'Tessitura Ratti S.p.A. Italy', vendor: 'Tessitura Ratti S.p.A. Italy', vendorName: 'Tessitura Ratti S.p.A. Italy', amount: 19800, dueDate: '2026-11-15', category: 'Raw Textiles', status: 'paid', paymentMethod: 'Corporate Wire', businessType: 'ecommerce' },
  { id: 'bill-lux-2', tenantId: 'tenant-luxeatelier', invoiceNumber: 'INV-LUX-1102', title: 'Rue Saint-Honoré Paris Showroom Monthly Lease', vendorOrClient: 'Compagnie Foncière Parisienne', vendor: 'Compagnie Foncière Parisienne', vendorName: 'Compagnie Foncière Parisienne', amount: 18500, dueDate: '2026-11-30', category: 'Facilities', status: 'pending', paymentMethod: 'Corporate Wire', businessType: 'ecommerce' },

  // VoltMotors
  { id: 'bill-vm-1', tenantId: 'tenant-voltmotors', invoiceNumber: 'INV-VM-6601', title: 'Industrial Robotic Arm Calibration & Welding Cells', vendorOrClient: 'ABB Robotics AB Sweden', vendor: 'ABB Robotics AB Sweden', vendorName: 'ABB Robotics AB Sweden', amount: 56000, dueDate: '2026-11-19', category: 'Machinery', status: 'paid', paymentMethod: 'Corporate Wire', businessType: 'factory' },
  { id: 'bill-vm-2', tenantId: 'tenant-voltmotors', invoiceNumber: 'INV-VM-6602', title: 'Automotive Grade Microcontroller & Inverter Chips', vendorOrClient: 'Infineon Technologies AG', vendor: 'Infineon Technologies AG', vendorName: 'Infineon Technologies AG', amount: 92000, dueDate: '2026-12-10', category: 'Semiconductors', status: 'pending', paymentMethod: 'Corporate Wire', businessType: 'factory' },

  // AeroSpace
  { id: 'bill-aero-1', tenantId: 'tenant-aerospace', invoiceNumber: 'INV-AERO-9901', title: 'Aerospace Grade 5 Titanium Ingot Certification Batch', vendorOrClient: 'Timet Titanium Metals Corp', vendor: 'Timet Titanium Metals Corp', vendorName: 'Timet Titanium Metals Corp', amount: 74000, dueDate: '2026-11-12', category: 'Raw Alloys', status: 'paid', paymentMethod: 'Corporate Wire', businessType: 'factory' },
  { id: 'bill-aero-2', tenantId: 'tenant-aerospace', invoiceNumber: 'INV-AERO-9902', title: 'Nadcap Nondestructive Testing & X-Ray QA Audit', vendorOrClient: 'Performance Review Institute', vendor: 'Performance Review Institute', vendorName: 'Performance Review Institute', amount: 24500, dueDate: '2026-11-28', category: 'Certification', status: 'pending', paymentMethod: 'ACH Transfer', businessType: 'factory' },

  // TerraGro
  { id: 'bill-tg-1', tenantId: 'tenant-terragro', invoiceNumber: 'INV-TG-8001', title: 'Mississippi River Grain Barge Charter & Stevedoring', vendorOrClient: 'Ingram Marine Group', vendor: 'Ingram Marine Group', vendorName: 'Ingram Marine Group', amount: 48000, dueDate: '2026-11-15', category: 'Transport', status: 'paid', paymentMethod: 'Corporate Wire', businessType: 'industry' },
  { id: 'bill-tg-2', tenantId: 'tenant-terragro', invoiceNumber: 'INV-TG-8002', title: 'Grain Silo Aeration Fans & Pest Control QA Retainer', vendorOrClient: 'AgriSafe Biosystems LLC', vendor: 'AgriSafe Biosystems LLC', vendorName: 'AgriSafe Biosystems LLC', amount: 16500, dueDate: '2026-11-26', category: 'Operations', status: 'pending', paymentMethod: 'ACH Transfer', businessType: 'industry' },

  // CineWave
  { id: 'bill-cw-1', tenantId: 'tenant-cinewave', invoiceNumber: 'INV-CW-3001', title: 'Ultra-High-Density Roe Black Pearl LED Wall Rental', vendorOrClient: 'Creative Technology Broadcast Group', vendor: 'Creative Technology Broadcast Group', vendorName: 'Creative Technology Broadcast Group', amount: 38000, dueDate: '2026-11-18', category: 'Virtual Production', status: 'paid', paymentMethod: 'Corporate Wire', businessType: 'software' },
  { id: 'bill-cw-2', tenantId: 'tenant-cinewave', invoiceNumber: 'INV-CW-3002', title: 'Dolby Atmos Mastering License & Soundstage Certification', vendorOrClient: 'Dolby Laboratories Inc.', vendor: 'Dolby Laboratories Inc.', vendorName: 'Dolby Laboratories Inc.', amount: 21000, dueDate: '2026-12-05', category: 'Licensing', status: 'pending', paymentMethod: 'Credit Card', businessType: 'software' },
];

/**
 * Curated distinct sales deals for the 12 businesses
 */
export const EXTENDED_SALES = [
  // BioGenix (Total Won: $650,000)
  { id: 'sale-bg-1', tenantId: 'tenant-biogenix', dealName: 'Phase-III Clinical Genomic Sequencing Program', customerName: 'Memorial Sloan Kettering Center', amount: 420000, stage: 'closed_won', closeDate: '2026-10-15', probability: 100, businessType: 'manufacturing' },
  { id: 'sale-bg-2', tenantId: 'tenant-biogenix', dealName: 'Companion Diagnostic Reagent Supply Accord', customerName: 'Novartis Oncology Labs', amount: 230000, stage: 'closed_won', closeDate: '2026-10-22', probability: 100, businessType: 'manufacturing' },

  // Solaris (Total Won: $1,240,000)
  { id: 'sale-sol-1', tenantId: 'tenant-solaris', dealName: '40MW Desert Sun Utility Array Module Supply', customerName: 'Arizona Public Power Service', amount: 820000, stage: 'closed_won', closeDate: '2026-09-30', probability: 100, businessType: 'industry' },
  { id: 'sale-sol-2', tenantId: 'tenant-solaris', dealName: 'Commercial Solar Microgrid & Inverter Turnkey', customerName: 'Intel Ocotillo Semiconductor Campus', amount: 420000, stage: 'closed_won', closeDate: '2026-10-18', probability: 100, businessType: 'industry' },

  // Vanguard (Total Won: $480,000)
  { id: 'sale-van-1', tenantId: 'tenant-vanguard', dealName: 'National Chilled Grocery 3PL Dedicated Route', customerName: 'Whole Foods Regional Hub', amount: 290000, stage: 'closed_won', closeDate: '2026-10-05', probability: 100, businessType: 'industry' },
  { id: 'sale-van-2', tenantId: 'tenant-vanguard', dealName: 'Cross-Border Automotive Parts Transloading', customerName: 'Magna International Freight', amount: 190000, stage: 'closed_won', closeDate: '2026-10-20', probability: 100, businessType: 'industry' },

  // Skyline (Total Won: $2,100,000)
  { id: 'sale-sky-1', tenantId: 'tenant-skyline', dealName: 'Midtown Tech Tower Structural Superstructure', customerName: 'Hudson Yards Development Corp', amount: 1450000, stage: 'closed_won', closeDate: '2026-09-25', probability: 100, businessType: 'industry' },
  { id: 'sale-sky-2', tenantId: 'tenant-skyline', dealName: 'High-Performance Insulated Facade Contract', customerName: 'Related Companies NYC', amount: 650000, stage: 'closed_won', closeDate: '2026-10-12', probability: 100, businessType: 'industry' },

  // Aura Grand (Total Won: $340,000)
  { id: 'sale-aur-1', tenantId: 'tenant-auragrand', dealName: 'Annual Tech CEO Retreat & Exclusive Resort Buyout', customerName: 'Sequoia Founders Circle', amount: 240000, stage: 'closed_won', closeDate: '2026-10-02', probability: 100, businessType: 'shop' },
  { id: 'sale-aur-2', tenantId: 'tenant-auragrand', dealName: 'High-Society Autumn Wedding & Villa Conclave', customerName: 'Kensington Private Family Trust', amount: 100000, stage: 'closed_won', closeDate: '2026-10-19', probability: 100, businessType: 'shop' },

  // CyberShield (Total Won: $880,000)
  { id: 'sale-cs-1', tenantId: 'tenant-cybershield', dealName: 'Enterprise 50,000-Seat Zero-Trust Sensor License', customerName: 'JPMorgan Chase SecOps', amount: 560000, stage: 'closed_won', closeDate: '2026-10-10', probability: 100, businessType: 'software' },
  { id: 'sale-cs-2', tenantId: 'tenant-cybershield', dealName: 'Automated Cloud SIEM & Telemetry Retainer', customerName: 'Palantir Government Services', amount: 320000, stage: 'closed_won', closeDate: '2026-10-24', probability: 100, businessType: 'software' },

  // Artisan Roasters (Total Won: $185,000)
  { id: 'sale-art-1', tenantId: 'tenant-artisanroast', dealName: '14-Store Corporate Franchise Bean Supply Agreement', customerName: 'Rocky Mountain Cafe Group', amount: 125000, stage: 'closed_won', closeDate: '2026-10-08', probability: 100, businessType: 'shop' },
  { id: 'sale-art-2', tenantId: 'tenant-artisanroast', dealName: 'Boutique Hotel In-Room Coffee Service Program', customerName: 'Boutique Hotel Collective', amount: 60000, stage: 'closed_won', closeDate: '2026-10-21', probability: 100, businessType: 'shop' },

  // Luxe Atelier (Total Won: $290,000)
  { id: 'sale-lux-1', tenantId: 'tenant-luxeatelier', dealName: 'Met Gala & Cannes Film Festival Custom Wardrobe', customerName: 'CAA Celebrity Client Guild', amount: 180000, stage: 'closed_won', closeDate: '2026-09-28', probability: 100, businessType: 'ecommerce' },
  { id: 'sale-lux-2', tenantId: 'tenant-luxeatelier', dealName: 'Fall Trunk Show VIP Pre-Orders Consignment', customerName: 'Harrods London Department Store', amount: 110000, stage: 'closed_won', closeDate: '2026-10-16', probability: 100, businessType: 'ecommerce' },

  // VoltMotors (Total Won: $1,650,000)
  { id: 'sale-vm-1', tenantId: 'tenant-voltmotors', dealName: '20-Unit Electric Last-Mile Delivery Chassis Batch', customerName: 'Deutsche Post DHL Fleet', amount: 1100000, stage: 'closed_won', closeDate: '2026-10-01', probability: 100, businessType: 'factory' },
  { id: 'sale-vm-2', tenantId: 'tenant-voltmotors', dealName: 'Municipal Zero-Emission Transit Chassis Pilot', customerName: 'Stockholm Regional Transit Board', amount: 550000, stage: 'closed_won', closeDate: '2026-10-18', probability: 100, businessType: 'factory' },

  // AeroSpace (Total Won: $1,950,000)
  { id: 'sale-aero-1', tenantId: 'tenant-aerospace', dealName: 'Commercial Turbofan Titanium Blisk Batch (80 Units)', customerName: 'Pratt & Whitney Commercial Aero', amount: 1250000, stage: 'closed_won', closeDate: '2026-09-20', probability: 100, businessType: 'factory' },
  { id: 'sale-aero-2', tenantId: 'tenant-aerospace', dealName: 'Defense Fly-by-Wire Actuator Retrofit Program', customerName: 'General Dynamics Defense Systems', amount: 700000, stage: 'closed_won', closeDate: '2026-10-14', probability: 100, businessType: 'factory' },

  // TerraGro (Total Won: $720,000)
  { id: 'sale-tg-1', tenantId: 'tenant-terragro', dealName: 'Export Grain Cargo Vessel Charter (Hard Red Wheat)', customerName: 'Cargill International Commodities', amount: 480000, stage: 'closed_won', closeDate: '2026-10-04', probability: 100, businessType: 'industry' },
  { id: 'sale-tg-2', tenantId: 'tenant-terragro', dealName: 'Food-Grade Non-GMO Soybean Processing Lot', customerName: 'Kikkoman Soy Products USA', amount: 240000, stage: 'closed_won', closeDate: '2026-10-17', probability: 100, businessType: 'industry' },

  // CineWave (Total Won: $540,000)
  { id: 'sale-cw-1', tenantId: 'tenant-cinewave', dealName: 'Sci-Fi Feature Film Stage A LED Volume Booking', customerName: 'Paramount Global Pictures', amount: 360000, stage: 'closed_won', closeDate: '2026-10-06', probability: 100, businessType: 'software' },
  { id: 'sale-cw-2', tenantId: 'tenant-cinewave', dealName: 'Cloud VFX Render Farm Retainer (Post-Production)', customerName: 'A24 Independent Films', amount: 180000, stage: 'closed_won', closeDate: '2026-10-23', probability: 100, businessType: 'software' },
];

/**
 * Curated customers for the 12 businesses
 */
export const EXTENDED_CUSTOMERS = [
  // BioGenix
  { id: 'cust-bg-1', tenantId: 'tenant-biogenix', name: 'Memorial Sloan Kettering Center', email: 'genomics@mskcc.org', company: 'Memorial Sloan Kettering', phone: '+1 212-555-0199', status: 'active', lifetimeValue: 420000, businessType: 'manufacturing' },
  { id: 'cust-bg-2', tenantId: 'tenant-biogenix', name: 'Novartis Oncology Labs', email: 'procurement@novartis.com', company: 'Novartis Pharmaceuticals', phone: '+41 61 324 1111', status: 'active', lifetimeValue: 230000, businessType: 'manufacturing' },

  // Solaris
  { id: 'cust-sol-1', tenantId: 'tenant-solaris', name: 'Arizona Public Power Service', email: 'clean-energy@aps.com', company: 'APS Utility Corp', phone: '+1 602-555-8844', status: 'active', lifetimeValue: 820000, businessType: 'industry' },
  { id: 'cust-sol-2', tenantId: 'tenant-solaris', name: 'Intel Ocotillo Semiconductor Campus', email: 'facilities@intel.com', company: 'Intel Corporation', phone: '+1 480-555-2233', status: 'active', lifetimeValue: 420000, businessType: 'industry' },

  // Vanguard
  { id: 'cust-van-1', tenantId: 'tenant-vanguard', name: 'Whole Foods Regional Hub', email: 'supplychain@wholefoods.com', company: 'Whole Foods Market', phone: '+1 512-555-4400', status: 'active', lifetimeValue: 290000, businessType: 'industry' },
  { id: 'cust-van-2', tenantId: 'tenant-vanguard', name: 'Magna International Freight', email: 'logistics@magna.com', company: 'Magna International', phone: '+1 905-555-6677', status: 'active', lifetimeValue: 190000, businessType: 'industry' },

  // Skyline
  { id: 'cust-sky-1', tenantId: 'tenant-skyline', name: 'Hudson Yards Development Corp', email: 'epc@hudsonyards.com', company: 'Hudson Yards Joint Venture', phone: '+1 212-555-3300', status: 'active', lifetimeValue: 1450000, businessType: 'industry' },
  { id: 'cust-sky-2', tenantId: 'tenant-skyline', name: 'Related Companies NYC', email: 'construction@related.com', company: 'Related Companies', phone: '+1 212-555-7799', status: 'active', lifetimeValue: 650000, businessType: 'industry' },

  // Aura Grand
  { id: 'cust-aur-1', tenantId: 'tenant-auragrand', name: 'Sequoia Founders Circle', email: 'events@sequoiacap.com', company: 'Sequoia Capital Operations', phone: '+1 650-555-9000', status: 'active', lifetimeValue: 240000, businessType: 'shop' },
  { id: 'cust-aur-2', tenantId: 'tenant-auragrand', name: 'Kensington Private Family Trust', email: 'concierge@kensingtontrust.co.uk', company: 'Kensington Family Office', phone: '+44 20 7946 0888', status: 'active', lifetimeValue: 100000, businessType: 'shop' },

  // CyberShield
  { id: 'cust-cs-1', tenantId: 'tenant-cybershield', name: 'JPMorgan Chase SecOps', email: 'cyberdefense@jpmchase.com', company: 'JPMorgan Chase & Co.', phone: '+1 212-555-9911', status: 'active', lifetimeValue: 560000, businessType: 'software' },
  { id: 'cust-cs-2', tenantId: 'tenant-cybershield', name: 'Palantir Government Services', email: 'telemetry@palantir.gov', company: 'Palantir Technologies', phone: '+1 703-555-4422', status: 'active', lifetimeValue: 320000, businessType: 'software' },

  // Artisan Roasters
  { id: 'cust-art-1', tenantId: 'tenant-artisanroast', name: 'Rocky Mountain Cafe Group', email: 'franchise@rockymtncafes.com', company: 'Rocky Mountain Hospitality Group', phone: '+1 303-555-2244', status: 'active', lifetimeValue: 125000, businessType: 'shop' },
  { id: 'cust-art-2', tenantId: 'tenant-artisanroast', name: 'Boutique Hotel Collective', email: 'procurement@boutiquehotels.org', company: 'Boutique Hotel Collective', phone: '+1 303-555-7788', status: 'active', lifetimeValue: 60000, businessType: 'shop' },

  // Luxe Atelier
  { id: 'cust-lux-1', tenantId: 'tenant-luxeatelier', name: 'CAA Celebrity Client Guild', email: 'vipstyling@caa.com', company: 'Creative Artists Agency', phone: '+1 424-555-1000', status: 'active', lifetimeValue: 180000, businessType: 'ecommerce' },
  { id: 'cust-lux-2', tenantId: 'tenant-luxeatelier', name: 'Harrods London Department Store', email: 'luxurybuying@harrods.com', company: 'Harrods Ltd.', phone: '+44 20 7730 1234', status: 'active', lifetimeValue: 110000, businessType: 'ecommerce' },

  // VoltMotors
  { id: 'cust-vm-1', tenantId: 'tenant-voltmotors', name: 'Deutsche Post DHL Fleet', email: 'greenfleet@dhl.com', company: 'Deutsche Post DHL Group', phone: '+49 228 1820', status: 'active', lifetimeValue: 1100000, businessType: 'factory' },
  { id: 'cust-vm-2', tenantId: 'tenant-voltmotors', name: 'Stockholm Regional Transit Board', email: 'upphandling@sl.se', company: 'Storstockholms Lokaltrafik', phone: '+46 8 600 1000', status: 'active', lifetimeValue: 550000, businessType: 'factory' },

  // AeroSpace
  { id: 'cust-aero-1', tenantId: 'tenant-aerospace', name: 'Pratt & Whitney Commercial Aero', email: 'supplychain@prattwhitney.com', company: 'Pratt & Whitney (RTX)', phone: '+1 860-555-8800', status: 'active', lifetimeValue: 1250000, businessType: 'factory' },
  { id: 'cust-aero-2', tenantId: 'tenant-aerospace', name: 'General Dynamics Defense Systems', email: 'contracts@gendyn.com', company: 'General Dynamics Corp', phone: '+1 703-555-3000', status: 'active', lifetimeValue: 700000, businessType: 'factory' },

  // TerraGro
  { id: 'cust-tg-1', tenantId: 'tenant-terragro', name: 'Cargill International Commodities', email: 'grain-trading@cargill.com', company: 'Cargill Inc.', phone: '+1 952-555-6000', status: 'active', lifetimeValue: 480000, businessType: 'industry' },
  { id: 'cust-tg-2', tenantId: 'tenant-terragro', name: 'Kikkoman Soy Products USA', email: 'agribuying@kikkoman.com', company: 'Kikkoman Foods Inc.', phone: '+1 262-555-9000', status: 'active', lifetimeValue: 240000, businessType: 'industry' },

  // CineWave
  { id: 'cust-cw-1', tenantId: 'tenant-cinewave', name: 'Paramount Global Pictures', email: 'physicalproduction@paramount.com', company: 'Paramount Pictures Studios', phone: '+1 323-555-5000', status: 'active', lifetimeValue: 360000, businessType: 'software' },
  { id: 'cust-cw-2', tenantId: 'tenant-cinewave', name: 'A24 Independent Films', email: 'postproduction@a24films.com', company: 'A24 Media LLC', phone: '+1 646-555-2400', status: 'active', lifetimeValue: 180000, businessType: 'software' },
];

/**
 * Curated inventory stock for the 12 businesses
 */
export const EXTENDED_STOCK = [
  // BioGenix
  { id: 'stk-bg-1', tenantId: 'tenant-biogenix', productName: 'NanoSeq-48 DNA Sequencing Cartridge Pack', sku: 'SKU-BIO-001', warehouse: 'Cryo Cleanroom Vault A', currentStock: 45, reservedStock: 10, minThreshold: 10, status: 'in_stock', businessType: 'manufacturing' },
  { id: 'stk-bg-2', tenantId: 'tenant-biogenix', productName: 'Automated Microfluidic Cell Sorter Pipette', sku: 'SKU-BIO-003', warehouse: 'Instrument Staging Berth 2', currentStock: 12, reservedStock: 2, minThreshold: 3, status: 'in_stock', businessType: 'manufacturing' },

  // Solaris
  { id: 'stk-sol-1', tenantId: 'tenant-solaris', productName: 'Bi-Facial 650W Monocrystalline PV Panel (Pallet of 30)', sku: 'SKU-SOL-101', warehouse: 'Solar Staging Yard Berth 4', currentStock: 80, reservedStock: 20, minThreshold: 15, status: 'in_stock', businessType: 'industry' },

  // Vanguard
  { id: 'stk-van-1', tenantId: 'tenant-vanguard', productName: 'Cross-Docking & Pallet Storage (Per Month Slot)', sku: 'SKU-VAN-201', warehouse: 'Hub 01 Central Cross-Dock', currentStock: 1200, reservedStock: 150, minThreshold: 100, status: 'in_stock', businessType: 'industry' },

  // Skyline
  { id: 'stk-sky-1', tenantId: 'tenant-skyline', productName: 'Pre-Cast Reinforced Concrete Grade-A Column', sku: 'SKU-SKY-301', warehouse: 'Concrete Casting Yard East', currentStock: 60, reservedStock: 12, minThreshold: 10, status: 'in_stock', businessType: 'industry' },

  // Aura Grand
  { id: 'stk-aur-1', tenantId: 'tenant-auragrand', productName: 'Presidential Oceanfront Villa Nightly Booking', sku: 'SKU-AUR-401', warehouse: 'Villa Inventory Pool', currentStock: 6, reservedStock: 1, minThreshold: 1, status: 'in_stock', businessType: 'shop' },

  // CyberShield
  { id: 'stk-cs-1', tenantId: 'tenant-cybershield', productName: 'Enterprise Zero-Trust Endpoint Sensor (Annual)', sku: 'SKU-CS-501', warehouse: 'Digital License Key Server', currentStock: 5000, reservedStock: 800, minThreshold: 500, status: 'in_stock', businessType: 'software' },

  // Artisan Roasters
  { id: 'stk-art-1', tenantId: 'tenant-artisanroast', productName: 'Ethiopian Yirgacheffe Washed Grade 1 (25kg Sack)', sku: 'SKU-ART-601', warehouse: 'Roastery Silo Room B', currentStock: 110, reservedStock: 15, minThreshold: 20, status: 'in_stock', businessType: 'shop' },

  // Luxe Atelier
  { id: 'stk-lux-1', tenantId: 'tenant-luxeatelier', productName: 'Full-Grain Italian Calfskin Structured Tote', sku: 'SKU-LUX-702', warehouse: 'Rue Saint-Honoré Stockroom', currentStock: 35, reservedStock: 5, minThreshold: 8, status: 'in_stock', businessType: 'ecommerce' },

  // VoltMotors
  { id: 'stk-vm-1', tenantId: 'tenant-voltmotors', productName: 'VoltDrive 180kW Electric Delivery Chassis', sku: 'SKU-VM-801', warehouse: 'Assembly Hall Berth 5', currentStock: 18, reservedStock: 4, minThreshold: 4, status: 'in_stock', businessType: 'factory' },

  // AeroSpace
  { id: 'stk-aero-1', tenantId: 'tenant-aerospace', productName: '5-Axis Titanium Jet Turbine Blisk (Stage 2)', sku: 'SKU-AERO-901', warehouse: 'Mil-Spec Curing Vault C', currentStock: 14, reservedStock: 2, minThreshold: 3, status: 'in_stock', businessType: 'factory' },

  // TerraGro
  { id: 'stk-tg-1', tenantId: 'tenant-terragro', productName: 'Grade #1 Hard Red Winter Wheat (100 Metric Ton Lot)', sku: 'SKU-TG-011', warehouse: 'Mississippi River Silo 4', currentStock: 45, reservedStock: 8, minThreshold: 10, status: 'in_stock', businessType: 'industry' },

  // CineWave
  { id: 'stk-cw-1', tenantId: 'tenant-cinewave', productName: 'Cloud GPU Raytracing Farm Render Units (10,000 hrs)', sku: 'SKU-CW-112', warehouse: 'Compute Cluster AWS-West', currentStock: 50, reservedStock: 5, minThreshold: 10, status: 'in_stock', businessType: 'software' },
];

/**
 * Balance & Ledger profiles for initial setup of the 12 businesses.
 * Used to seed real distinct balances in the Chart of Accounts so that
 * Financials calculations (EBITDA, Net Profit, Net Worth, ROI, Valuation)
 * are calculated mathematically and distinctly for every business!
 */
export const EXTENDED_LEDGER_PROFILES = {
  'tenant-biogenix': {
    cash: 420000,
    ar: 230000,
    inventory: 170000,
    ap: 48800,
    equity: 550000,
    revenue: 650000,
    cogs: 180000,
    expenses: 110000,
  },
  'tenant-solaris': {
    cash: 850000,
    ar: 420000,
    inventory: 580000,
    ap: 112000,
    equity: 1200000,
    revenue: 1240000,
    cogs: 440000,
    expenses: 160000,
  },
  'tenant-vanguard': {
    cash: 195000,
    ar: 190000,
    inventory: 50000,
    ap: 47300,
    equity: 280000,
    revenue: 480000,
    cogs: 210000,
    expenses: 85000,
  },
  'tenant-skyline': {
    cash: 1400000,
    ar: 650000,
    inventory: 1350000,
    ap: 280000,
    equity: 2400000,
    revenue: 2100000,
    cogs: 820000,
    expenses: 320000,
  },
  'tenant-auragrand': {
    cash: 280000,
    ar: 100000,
    inventory: 80000,
    ap: 40700,
    equity: 360000,
    revenue: 340000,
    cogs: 85000,
    expenses: 74000,
  },
  'tenant-cybershield': {
    cash: 480000,
    ar: 320000,
    inventory: 20000,
    ap: 33200,
    equity: 520000,
    revenue: 880000,
    cogs: 120000,
    expenses: 140000,
  },
  'tenant-artisanroast': {
    cash: 72000,
    ar: 60000,
    inventory: 48000,
    ap: 17600,
    equity: 110000,
    revenue: 185000,
    cogs: 62000,
    expenses: 38000,
  },
  'tenant-luxeatelier': {
    cash: 135000,
    ar: 110000,
    inventory: 85000,
    ap: 38300,
    equity: 180000,
    revenue: 290000,
    cogs: 88000,
    expenses: 64000,
  },
  'tenant-voltmotors': {
    cash: 1100000,
    ar: 550000,
    inventory: 750000,
    ap: 248000,
    equity: 1700000,
    revenue: 1650000,
    cogs: 680000,
    expenses: 280000,
  },
  'tenant-aerospace': {
    cash: 1250000,
    ar: 700000,
    inventory: 850000,
    ap: 198500,
    equity: 2000000,
    revenue: 1950000,
    cogs: 720000,
    expenses: 310000,
  },
  'tenant-terragro': {
    cash: 380000,
    ar: 240000,
    inventory: 270000,
    ap: 64500,
    equity: 620000,
    revenue: 720000,
    cogs: 310000,
    expenses: 125000,
  },
  'tenant-cinewave': {
    cash: 340000,
    ar: 180000,
    inventory: 60000,
    ap: 59000,
    equity: 420000,
    revenue: 540000,
    cogs: 140000,
    expenses: 95000,
  },
  // Clean State Testing Account: explicitly ZERO across everything
  'tenant-empty': {
    cash: 0,
    ar: 0,
    inventory: 0,
    ap: 0,
    equity: 0,
    revenue: 0,
    cogs: 0,
    expenses: 0,
  },
};
