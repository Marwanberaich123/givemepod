import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  google_id: string;
  email: string;
  name: string;
  avatar: string;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'SUSPENDED';
  created_at: string;
  last_active: string;
  has_permanent_access: boolean;
  active_code_masked?: string;
  preferences?: {
    platform?: string;
    experience?: string;
    favorite_product?: string;
  };
}

export interface AccessCode {
  id: string;
  code_hash: string;
  masked_code: string;
  status: 'AVAILABLE' | 'ACTIVE' | 'REVOKED';
  assigned_user_id?: string;
  created_at: string;
  activated_at?: string;
  last_used_at?: string;
  revoked_at?: string;
  created_by: string;
  notes?: string;
}

export interface AccessEntitlement {
  id: string;
  user_id: string;
  access_code_id: string;
  granted_at: string;
  is_active: boolean;
}

export interface ProductConcept {
  id: string;
  name: string;
  target_customer: string;
  product_type: string;
  design_angle: string;
  headline: string;
  visual_direction: string;
  keyword_cluster: string[];
  why_interesting: string;
  risks: string;
  recommended_platforms: string[];
  selected?: boolean;
}

export interface MockupItem {
  id: string;
  mockup_number: number;
  category: 'front' | 'lifestyle' | 'closeup' | 'flatlay' | 'studio' | 'outdoor' | 'desk' | 'home' | 'gift' | 'model' | 'detail';
  purpose: string;
  scene: string;
  camera: string;
  lighting: string;
  composition: string;
  product_placement: string;
  prompt: string;
  negative_prompt: string;
  image_url?: string;
}

export interface DesignData {
  title: string;
  design_concept: string;
  prompt: string;
  negative_prompt: string;
  print_specs: string;
  color_palette: string[];
  transparent_bg_required: boolean;
  artwork_url?: string;
  mode: 'generated' | 'prompt_only';
}

export interface RiskAnalysis {
  overall_risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'NEEDS_REVIEW';
  score: number; // 0-100 (100 is safest)
  detected_evidence: string[];
  ai_inference: string[];
  recommendations: string[];
  disclaimer: string;
  checked_at: string;
}

export interface SeoListing {
  title: string;
  tags: string[];
  description: string;
  short_description: string;
  materials: string;
  personalization: string;
  alt_text: string[];
  faq: { q: string; a: string }[];
  price_range: { min: number; max: number; suggested: number };
  keyword_groups: {
    primary: string[];
    secondary: string[];
    long_tail: string[];
    buyer_intent: string[];
    seasonal: string[];
  };
}

export interface ProfitCalc {
  currency: string;
  selling_price: number;
  product_cost: number;
  shipping_charged: number;
  shipping_expense: number;
  marketplace_fee_percent: number;
  payment_processing_fixed: number;
  payment_processing_percent: number;
  ad_spend: number;
  other_costs: number;
  gross_revenue: number;
  total_fees: number;
  net_profit: number;
  profit_margin: number;
}

export interface PinterestPin {
  id: string;
  pin_title: string;
  pin_description: string;
  target_keywords: string[];
  cta: string;
  board: string;
  image_concept: string;
}

export interface OpportunityBreakdown {
  search_demand: number;
  competition: number;
  trend_momentum: number;
  niche_specificity: number;
  commercial_intent: number;
  seasonality: number;
  profit_potential: number;
  ip_risk_score: number;
  overall_score: number;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  product_type: string;
  niche: string;
  design_style: string;
  target_audience: {
    gender: string;
    age_range: string;
    occupation_interest: string;
  };
  concepts_requested: number;
  include_trends: boolean;
  status: 'research' | 'concept' | 'design' | 'mockups' | 'listing' | 'ready' | 'archived';
  opportunity_score: number;
  opportunity_breakdown?: OpportunityBreakdown;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'NEEDS_REVIEW';
  is_sample?: boolean;
  created_at: string;
  updated_at: string;
  concepts: ProductConcept[];
  selected_concept_id?: string;
  design?: DesignData;
  mockups: MockupItem[];
  risk?: RiskAnalysis;
  seo?: SeoListing;
  profit?: ProfitCalc;
  pinterest: PinterestPin[];
  market_research?: {
    source: string;
    timestamp: string;
    dataType: string;
    summary: string;
    trendVelocity: string;
    searchVolumeSignal: string;
    commonPatterns: string[];
    marketGaps: string[];
  };
}

export interface AiJob {
  id: string;
  user_id: string;
  project_id: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number;
  current_step: string;
  error?: string;
  created_at: string;
  completed_at?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  details: string;
  timestamp: string;
  ip?: string;
}

export interface SystemConfig {
  emergency_lock: boolean;
  maintenance_mode: boolean;
  maintenance_message: string;
  feature_flags: Record<string, boolean>;
  integrations: {
    pinterest: { connected: boolean; username?: string; connected_at?: string };
    etsy: { connected: boolean; shop_name?: string; connected_at?: string };
    payment: { configured: boolean; provider?: string };
  };
}

export function hashAccessCode(code: string): string {
  const normalized = code.trim().toUpperCase().replace(/[\s-]/g, '');
  return crypto.createHash('sha256').update(`GMP_SALT_${normalized}`).digest('hex');
}

export function maskCode(code: string): string {
  const clean = code.trim().toUpperCase();
  if (clean.length <= 4) return '••••' + clean;
  return '••••••••••••' + clean.slice(-4);
}

class Database {
  private dataDir = path.resolve(process.cwd(), 'server_data');
  private storeFile = path.resolve(this.dataDir, 'store.json');

  public users: Map<string, User> = new Map();
  public accessCodes: Map<string, AccessCode> = new Map();
  public entitlements: Map<string, AccessEntitlement> = new Map();
  public projects: Map<string, Project> = new Map();
  public jobs: Map<string, AiJob> = new Map();
  public auditLogs: AuditLog[] = [];
  public failedAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  public systemConfig: SystemConfig = {
    emergency_lock: false,
    maintenance_mode: false,
    maintenance_message: 'GiveMePOD is temporarily undergoing scheduled maintenance.',
    feature_flags: {
      trend_hunter: true,
      design_generation: true,
      mockup_generation: true,
      pinterest: true,
      etsy: true,
      competitor_research: true,
      ai_advisor: true,
      profit_calculator: true,
      seasonal_planner: true
    },
    integrations: {
      pinterest: { connected: false },
      etsy: { connected: false },
      payment: { configured: false }
    }
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    if (fs.existsSync(this.storeFile)) {
      try {
        const raw = fs.readFileSync(this.storeFile, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users) parsed.users.forEach((u: User) => this.users.set(u.id, u));
        if (parsed.accessCodes) parsed.accessCodes.forEach((c: AccessCode) => this.accessCodes.set(c.id, c));
        if (parsed.entitlements) parsed.entitlements.forEach((e: AccessEntitlement) => this.entitlements.set(e.id, e));
        if (parsed.projects) parsed.projects.forEach((p: Project) => this.projects.set(p.id, p));
        if (parsed.auditLogs) this.auditLogs = parsed.auditLogs;
        if (parsed.systemConfig) this.systemConfig = { ...this.systemConfig, ...parsed.systemConfig };
      } catch (err) {
        console.error('Error loading store.json, re-initializing seeds', err);
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }
  }

  public save() {
    try {
      const serialized = {
        users: Array.from(this.users.values()),
        accessCodes: Array.from(this.accessCodes.values()),
        entitlements: Array.from(this.entitlements.values()),
        projects: Array.from(this.projects.values()),
        auditLogs: this.auditLogs.slice(-500),
        systemConfig: this.systemConfig
      };
      fs.writeFileSync(this.storeFile, JSON.stringify(serialized, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save store.json', err);
    }
  }

  public logAudit(userId: string, userEmail: string, action: string, details: string, ip?: string) {
    const entry: AuditLog = {
      id: crypto.randomUUID(),
      user_id: userId,
      user_email: userEmail,
      action,
      details,
      timestamp: new Date().toISOString(),
      ip
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 500) this.auditLogs.pop();
    this.save();
  }

  private seedInitialData() {
    // 1. Initial admin user
    const adminUser: User = {
      id: 'admin-seed-001',
      google_id: 'google-sub-admin-1',
      email: 'jeanteriitua@gmail.com',
      name: 'Owner Admin',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GiveMePODAdmin',
      role: 'ADMIN',
      status: 'ACTIVE',
      created_at: new Date('2026-09-01T00:00:00Z').toISOString(),
      last_active: new Date().toISOString(),
      has_permanent_access: true,
      active_code_masked: '••••••••••••K2L8',
      preferences: {
        platform: 'Etsy',
        experience: 'Advanced',
        favorite_product: 'All Products'
      }
    };
    this.users.set(adminUser.id, adminUser);

    // 2. Initial batch of cryptographically hashed access codes (never stored in plaintext)
    // The owner's initial codes:
    const initialPlainCodes = [
      'GMP-PRO-2026-A1X9',
      'GMP-VIP-8821-K2L8',
      'GMP-LAUNCH-9912-Q4W7',
      'GMP-SCALE-4451-M8N3',
      'GMP-STUDIO-7723-V9P1',
      'GMP-NEXUS-5510-J6H2',
      'GMP-COMMAND-3341-T8R5',
      'GMP-FOUNDER-1029-B7C4',
      'GMP-ELITE-9904-W2Y6',
      'GMP-ALPHA-6612-E5S8'
    ];

    initialPlainCodes.forEach((code, idx) => {
      const codeHash = hashAccessCode(code);
      const isFirst = idx === 1; // GMP-VIP-8821-K2L8 assigned to admin
      const accessCode: AccessCode = {
        id: `code-${idx + 1}`,
        code_hash: codeHash,
        masked_code: maskCode(code),
        status: isFirst ? 'ACTIVE' : 'AVAILABLE',
        assigned_user_id: isFirst ? adminUser.id : undefined,
        created_at: new Date('2026-09-01T00:00:00Z').toISOString(),
        activated_at: isFirst ? new Date('2026-09-01T00:00:00Z').toISOString() : undefined,
        created_by: 'system_init',
        notes: isFirst ? 'Owner permanent entitlement' : 'Initial batch activation slot'
      };
      this.accessCodes.set(accessCode.id, accessCode);

      if (isFirst) {
        const ent: AccessEntitlement = {
          id: `ent-${accessCode.id}`,
          user_id: adminUser.id,
          access_code_id: accessCode.id,
          granted_at: new Date('2026-09-01T00:00:00Z').toISOString(),
          is_active: true
        };
        this.entitlements.set(ent.id, ent);
      }
    });

    // 3. Seed Sample Projects as required by section 78
    const sampleProjects: Project[] = [
      {
        id: 'sample-project-hoodie',
        user_id: adminUser.id,
        title: 'Minimalist Heavyweight Streetwear Hoodie',
        product_type: 'Hoodie',
        niche: 'Urban Architecture & Minimalism',
        design_style: 'Minimalist Typography & Geometric',
        target_audience: {
          gender: 'Unisex',
          age_range: '25–34',
          occupation_interest: 'Architects, designers, urban creatives'
        },
        concepts_requested: 3,
        include_trends: true,
        status: 'ready',
        opportunity_score: 88,
        opportunity_breakdown: {
          search_demand: 86,
          competition: 54,
          trend_momentum: 92,
          niche_specificity: 89,
          commercial_intent: 88,
          seasonality: 79,
          profit_potential: 91,
          ip_risk_score: 95,
          overall_score: 88
        },
        risk_level: 'LOW',
        is_sample: true,
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        updated_at: new Date().toISOString(),
        concepts: [
          {
            id: 'concept-1',
            name: 'Concrete & Brutalism Coordinates',
            target_customer: 'Design professionals & modern urbanites',
            product_type: 'Hoodie',
            design_angle: 'Raw architectural typography with isometric elevation schematics',
            headline: 'Form Follows Friction',
            visual_direction: 'Monochrome slate ink on heavyweight charcoal cotton, clean grid layout',
            keyword_cluster: ['brutalist hoodie', 'architect streetwear', 'minimalist aesthetic pullover', 'geometry garment'],
            why_interesting: 'Strong overlap between luxury streetwear appeal and niche professional identity',
            risks: 'No trademarked architectural names or registered corporate slogans used.',
            recommended_platforms: ['Etsy', 'Shopify', 'Printify Premium']
          }
        ],
        design: {
          title: 'Concrete & Brutalism Coordinates',
          design_concept: 'Understated modernist architectural layout with subtle hairline grids and clean sans-serif typography reading FORM FOLLOWS FRICTION.',
          prompt: 'Commercial apparel print graphic, brutalist typography layout, minimalist architectural coordinate grid, crisp geometric lines, monochrome ivory ink on pure transparent background, vector precision, high contrast, 300 DPI, print-ready POD artwork',
          negative_prompt: 'mockups, t-shirt outline, fabric wrinkles, human model, colorful gradients, 3D shadows, photo realistic background',
          print_specs: '4500 x 5400 px, 300 DPI, sRGB, Transparent PNG',
          color_palette: ['#F5F5F0', '#E2E8F0', '#94A3B8'],
          transparent_bg_required: true,
          artwork_url: '/src/assets/images/mockup_studio_hoodie_1790680851584.jpg',
          mode: 'generated'
        },
        mockups: [
          {
            id: 'mockup-1',
            mockup_number: 1,
            category: 'front',
            purpose: 'Clean Studio Hero Presentation',
            scene: 'Commercial dark slate studio with diffuse overhead key light',
            camera: 'Eye-level 50mm, f/4 aperture',
            lighting: 'Soft directional studio box from top-left',
            composition: 'Centered product display with generous negative space',
            product_placement: 'Heavyweight charcoal hoodie front center',
            prompt: 'Studio commercial product photography of an oversized streetwear charcoal hoodie neatly laid on a dark slate surface, subtle diffused studio rim lighting, crisp fabric texture, luxury print on demand apparel showcase, high resolution',
            negative_prompt: 'blurry, oversaturated, deformed garment, fake text',
            image_url: '/src/assets/images/mockup_studio_hoodie_1790680851584.jpg'
          },
          {
            id: 'mockup-2',
            mockup_number: 2,
            category: 'lifestyle',
            purpose: 'Urban Workspace Context',
            scene: 'Modern concrete architecture loft desk',
            camera: '35mm editorial lens at 45 degree angle',
            lighting: 'Natural window daylight with soft ambient fill',
            composition: 'Hoodie folded alongside sketch pad and ceramic cup',
            product_placement: 'Foreground left',
            prompt: 'Editorial lifestyle photo of a charcoal streetwear hoodie folded on a minimalist concrete architect workbench near blueprints, soft natural morning window light, high end design aesthetic',
            negative_prompt: 'clutter, distorted objects, low resolution',
            image_url: '/src/assets/images/hero_pod_workspace_1790680840862.jpg'
          }
        ],
        risk: {
          overall_risk: 'LOW',
          score: 95,
          detected_evidence: ['Phrase "Form Follows Friction" is an original philosophical variation', 'No USPTO live registered word marks matched in Class 025 (Apparel)'],
          ai_inference: ['Concept relies on generic architectural design language and open typographic geometry with zero intellectual property conflicts'],
          recommendations: ['Safe for commercial listing on Etsy and Shopify', 'Maintain original wording and avoid referencing proprietary building trademarks'],
          disclaimer: 'GiveMePOD provides automated screening and market analysis. It does not provide legal advice and cannot guarantee that a product is free from intellectual-property claims or marketplace policy violations.',
          checked_at: new Date().toISOString()
        },
        seo: {
          title: 'Brutalist Architecture Hoodie, Minimalist Aesthetic Streetwear Pullover, Architect Gift, Heavyweight Cotton Graphic Sweatshirt',
          tags: [
            'architect hoodie',
            'brutalist design',
            'minimalist apparel',
            'architecture gift',
            'urban streetwear',
            'heavyweight hoodie',
            'modernist clothing',
            'unisex pullover',
            'aesthetic clothes',
            'graphic sweatshirt',
            'dark academia tee',
            'engineer gift',
            'studio garment'
          ],
          description: 'Step into elevated minimalism with this premium heavyweight hoodie crafted for architects, designers, and lovers of structural form. Features precision screen-style typography and brutalist coordinate grid artwork.',
          short_description: 'Architectural precision meets luxury streetwear comfort.',
          materials: '100% Ring-spun Combed Cotton Face, Heavyweight 350 GSM Fleece, Double-needle Stitching',
          personalization: 'Custom back-neck coordinate stamping available upon request.',
          alt_text: [
            'Charcoal brutalist architect hoodie flat lay on slate surface',
            'Close-up of minimalist coordinate grid chest print on cotton fleece'
          ],
          faq: [
            { q: 'What is the fit of this hoodie?', a: 'Relaxed oversized modern streetwear fit. For a standard fit, order true to size; for fitted, size down one.' },
            { q: 'How is the graphic printed?', a: 'Direct-to-Film (DTF) high-resolution print cured for maximum durability and soft hand-feel.' }
          ],
          price_range: { min: 48, max: 68, suggested: 58 },
          keyword_groups: {
            primary: ['architect hoodie', 'brutalist streetwear'],
            secondary: ['minimalist pullover', 'heavyweight aesthetic sweatshirt'],
            long_tail: ['gift for architecture student unisex hoodie', 'dark aesthetic brutalist clothing'],
            buyer_intent: ['buy architect sweatshirt', 'best quality minimalist hoodie'],
            seasonal: ['autumn winter cozy streetwear', 'holiday graduation architect gift']
          }
        },
        profit: {
          currency: 'USD',
          selling_price: 58.00,
          product_cost: 21.50,
          shipping_charged: 4.99,
          shipping_expense: 5.50,
          marketplace_fee_percent: 6.5,
          payment_processing_fixed: 0.25,
          payment_processing_percent: 3.0,
          ad_spend: 6.00,
          other_costs: 1.00,
          gross_revenue: 62.99,
          total_fees: 16.84,
          net_profit: 24.65,
          profit_margin: 39.13
        },
        pinterest: [
          {
            id: 'pin-1',
            pin_title: 'The Architect Streetwear Hoodie Everyone Is Obsessed With',
            pin_description: 'Clean lines, heavyweight comfort, and brutalist typographic perfection. Discover the ultimate apparel piece for designers, engineers, and creators. #architect #streetwear #minimalistfashion',
            target_keywords: ['minimalist hoodie aesthetic', 'architect gifts', 'streetwear outfits men women'],
            cta: 'Tap to Shop the Collection',
            board: 'Modern Minimalist Apparel & Wardrobe',
            image_concept: 'Split layout showing studio product shot on top, aesthetic architect desk moodboard on bottom'
          }
        ],
        market_research: {
          source: 'Etsy & Pinterest Trend Signals',
          timestamp: '2026-09-29T04:20:00Z',
          dataType: 'Live Market Velocity Signal',
          summary: 'High demand for high-GSM heavyweight blanks combined with intellectual/niche professional typography.',
          trendVelocity: 'Rising (+28% MoM search interest)',
          searchVolumeSignal: 'High commercial intent (86/100)',
          commonPatterns: ['Oversized fits', 'Monochrome palettes', 'Quotes from design manifestos'],
          marketGaps: ['Most listings use cheap thin blanks; high-end premium heavy fabrics with architectural precision are underserved.']
        }
      },
      {
        id: 'sample-project-mug',
        user_id: adminUser.id,
        title: 'Minimalist Botanical Ceramic Mug',
        product_type: 'Mug',
        niche: 'Plant Enthusiasts & Coffee Lovers',
        design_style: 'Japandi Fine Line Art',
        target_audience: {
          gender: 'Women',
          age_range: '25–44',
          occupation_interest: 'Plant moms, interior decorators, quiet morning ritualists'
        },
        concepts_requested: 2,
        include_trends: true,
        status: 'ready',
        opportunity_score: 84,
        opportunity_breakdown: {
          search_demand: 81,
          competition: 65,
          trend_momentum: 84,
          niche_specificity: 90,
          commercial_intent: 83,
          seasonality: 85,
          profit_potential: 78,
          ip_risk_score: 98,
          overall_score: 84
        },
        risk_level: 'LOW',
        is_sample: true,
        created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
        updated_at: new Date().toISOString(),
        concepts: [
          {
            id: 'concept-2',
            name: 'Monstera Delicate Venation',
            target_customer: 'Indoor gardening community and aesthetic home coffee enthusiasts',
            product_type: 'Mug',
            design_angle: 'Botanical line study rendered with continuous Japanese ink stroke aesthetic',
            headline: 'Stillness in Bloom',
            visual_direction: 'Warm earthy charcoal line illustration wrapped seamlessly on matte black stoneware',
            keyword_cluster: ['plant mom mug', 'botanical ceramic coffee cup', 'japandi home gift', 'monstera artwork'],
            why_interesting: 'Mugs have high gifting volume and repeat purchase frequency in plant collector communities',
            risks: 'Botanical flora is public domain and zero trademark risk.',
            recommended_platforms: ['Etsy', 'Shopify', 'Printful']
          }
        ],
        design: {
          title: 'Monstera Delicate Venation',
          design_concept: 'Intricate botanical line artwork of a monstera leaf with continuous ink pen texture.',
          prompt: 'Single continuous line art drawing of a delicate tropical monstera leaf, Japandi aesthetic, elegant ink wash nuance, warm cream outlines on pure transparent background, crisp vector sharpness, commercial POD print asset',
          negative_prompt: 'solid background, color fills, messy noise, photo realism, mug silhouette',
          print_specs: '2475 x 1155 px, 300 DPI, sRGB, Transparent PNG',
          color_palette: ['#FAF5EF', '#D4AF37', '#2C3E50'],
          transparent_bg_required: true,
          artwork_url: '/src/assets/images/mockup_ceramic_mug_1790680864069.jpg',
          mode: 'generated'
        },
        mockups: [
          {
            id: 'mockup-m1',
            mockup_number: 1,
            category: 'front',
            purpose: 'Clean Hero Photo for Etsy Search',
            scene: 'Dark polished concrete with morning sunlight',
            camera: '85mm macro lens',
            lighting: 'Warm side rim light highlighting matte texture',
            composition: 'Center right 3/4 angle showing handle and graphic wrap',
            product_placement: 'Center table focus',
            prompt: 'Commercial studio photography of a matte black ceramic coffee mug on a polished dark concrete slab, soft side morning lighting, shallow depth of field, minimalist elegant print on demand product mockup, 8k quality',
            negative_prompt: 'blurry, fake reflections, distorted rim',
            image_url: '/src/assets/images/mockup_ceramic_mug_1790680864069.jpg'
          }
        ],
        risk: {
          overall_risk: 'LOW',
          score: 98,
          detected_evidence: ['Natural botanical subject matter', 'No brand or trademarked terminology'],
          ai_inference: ['Zero IP exposure; completely original botanical drawing'],
          recommendations: ['Approved for immediate listing'],
          disclaimer: 'GiveMePOD provides automated screening and market analysis. It does not provide legal advice and cannot guarantee that a product is free from intellectual-property claims or marketplace policy violations.',
          checked_at: new Date().toISOString()
        },
        seo: {
          title: 'Monstera Leaf Ceramic Coffee Mug, Minimalist Botanical Plant Lover Cup, Japandi Kitchen Decor, Plant Mom Morning Coffee Gift 15oz',
          tags: [
            'plant lover mug',
            'botanical cup',
            'monstera coffee mug',
            'plant mom gift',
            'japandi ceramic',
            'minimalist mug',
            'aesthetic coffee cup',
            'houseplant gifts',
            'large 15oz mug',
            'gardener present',
            'tea mug handmade',
            'nature lover gift',
            'neutral home decor'
          ],
          description: 'Begin your morning ritual surrounded by organic beauty. This 15oz matte ceramic mug features delicate botanical monstera line art, designed for indoor jungle lovers and quiet coffee reflections.',
          short_description: 'An organic botanical study for peaceful morning coffee.',
          materials: 'Lead and BPA-free Ceramic, Microwave and Dishwasher Safe',
          personalization: 'Optional recipient name etched along the opposite handle side.',
          alt_text: ['Matte black ceramic coffee mug with delicate monstera leaf artwork on concrete table'],
          faq: [{ q: 'Is this dishwasher safe?', a: 'Yes, durable top-rack dishwasher and microwave safe.' }],
          price_range: { min: 18, max: 28, suggested: 24 },
          keyword_groups: {
            primary: ['plant mom mug', 'botanical coffee cup'],
            secondary: ['monstera ceramic mug', 'japandi home gift'],
            long_tail: ['best ceramic gift for houseplant lovers', 'minimalist aesthetic plant coffee mug'],
            buyer_intent: ['buy botanical mug', 'order plant lover gift cup'],
            seasonal: ['spring gardener gift', 'mothers day plant mug']
          }
        },
        profit: {
          currency: 'USD',
          selling_price: 24.00,
          product_cost: 6.80,
          shipping_charged: 6.50,
          shipping_expense: 6.20,
          marketplace_fee_percent: 6.5,
          payment_processing_fixed: 0.25,
          payment_processing_percent: 3.0,
          ad_spend: 3.00,
          other_costs: 0.50,
          gross_revenue: 30.50,
          total_fees: 12.65,
          net_profit: 11.05,
          profit_margin: 36.23
        },
        pinterest: [
          {
            id: 'pin-2',
            pin_title: 'The Perfect Morning Coffee Mug for Plant Lovers',
            pin_description: 'Upgrade your quiet morning ritual with this minimalist botanical monstera ceramic mug. Dishwasher safe, high fire ceramic. #plantmom #morningcoffee #aestheticmug #japandi',
            target_keywords: ['plant mom aesthetic', 'ceramic coffee mugs', 'botanical gifts'],
            cta: 'Shop the Botanical Mug',
            board: 'Cozy Morning Coffee Rituals',
            image_concept: 'Close-up of steaming morning brew in cozy sunlit plant room'
          }
        ],
        market_research: {
          source: 'Pinterest Trends & Google Search Signals',
          timestamp: '2026-09-29T04:20:00Z',
          dataType: 'Live Signal',
          summary: 'Plant-themed gift mugs consistently maintain high organic search demand year-round.',
          trendVelocity: 'Stable High',
          searchVolumeSignal: '81/100',
          commonPatterns: ['Cartoon plants with quotes like "Crazy Plant Lady"'],
          marketGaps: ['Mature, sophisticated Japandi line art appeals to higher-income buyers who avoid cliché cartoon text.']
        }
      }
    ];

    sampleProjects.forEach(p => this.projects.set(p.id, p));
    this.save();
  }
}

export const db = new Database();
