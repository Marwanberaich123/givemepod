import { Router, Request, Response } from 'express';
import { db, Project } from '../db';
import { getAuthenticatedUser } from './auth';
import { aiPodService } from '../ai';
import JSZip from 'jszip';
import crypto from 'crypto';

const router = Router();

// Middleware ensuring user has permanent access or is admin
function requireActiveEntitlement(req: Request, res: Response, next: () => void): any {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!user.has_permanent_access && user.role !== 'ADMIN') {
    return res.status(403).json({
      locked: true,
      error: 'Permanent access entitlement required to access this tool.'
    });
  }

  next();
}

// 1. Get All Projects (Filtered, Sorted)
router.get('/', (req: Request, res: Response): any => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { status, search, sort } = req.query;

  let list = Array.from(db.projects.values()).filter(p => {
    // Row level security: user can see own projects or sample projects
    return p.user_id === user.id || p.is_sample;
  });

  if (status && status !== 'all') {
    list = list.filter(p => p.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.niche.toLowerCase().includes(q) ||
      p.product_type.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sort === 'oldest') {
    list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } else if (sort === 'score') {
    list.sort((a, b) => (b.opportunity_score || 0) - (a.opportunity_score || 0));
  } else {
    // Newest first default
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return res.json({ projects: list });
});

// 2. Get Single Project
router.get('/:id', (req: Request, res: Response): any => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const project = db.projects.get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  // Security check
  if (project.user_id !== user.id && !project.is_sample && user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied' });
  }

  return res.json({ project });
});

// 3. Build POD Product (The Multi-Step Wizard Engine)
router.post('/build-wizard', requireActiveEntitlement, async (req: Request, res: Response): Promise<any> => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const {
    productType,
    quantity,
    style,
    customStyle,
    audienceGender,
    audienceAge,
    audienceOccupation,
    includeTrends,
    mode // 'full' or 'research_only'
  } = req.body;

  const chosenStyle = customStyle ? customStyle.trim() : (style || 'Minimalist');
  const chosenType = productType || 'T-Shirt';
  const qty = Math.min(4, Math.max(1, Number(quantity) || 3));

  try {
    // Step A: Market research and opportunity analysis
    const research = await aiPodService.researchTrendAndOpportunity({
      productType: chosenType,
      style: chosenStyle,
      gender: audienceGender || 'Unisex',
      ageRange: audienceAge || '25–34',
      nicheInterest: audienceOccupation || 'Everyday lifestyle'
    });

    // Step B: Generate product concepts
    const concepts = await aiPodService.generateProductConcepts({
      productType: chosenType,
      quantity: qty,
      style: chosenStyle,
      gender: audienceGender || 'Unisex',
      ageRange: audienceAge || '25–34',
      nicheInterest: audienceOccupation || 'Creative enthusiasts'
    });

    const primaryConcept = concepts[0];
    primaryConcept.selected = true;

    // Step C: Scan risk on primary concept
    const risk = await aiPodService.scanRisk(
      `${primaryConcept.name}: ${primaryConcept.headline}`,
      `Print-on-demand ${chosenType} in ${chosenStyle} style`
    );

    // Initial project instance
    const projectId = crypto.randomUUID();
    const newProject: Project = {
      id: projectId,
      user_id: user.id,
      title: primaryConcept.name,
      product_type: chosenType,
      niche: audienceOccupation || 'General Lifestyle',
      design_style: chosenStyle,
      target_audience: {
        gender: audienceGender || 'Unisex',
        age_range: audienceAge || '25–34',
        occupation_interest: audienceOccupation || 'Creative lifestyle'
      },
      concepts_requested: qty,
      include_trends: includeTrends !== false,
      status: mode === 'research_only' ? 'concept' : 'ready',
      opportunity_score: research.opportunityBreakdown.overall_score,
      opportunity_breakdown: research.opportunityBreakdown,
      risk_level: risk.overall_risk,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      concepts,
      selected_concept_id: primaryConcept.id,
      risk,
      mockups: [],
      pinterest: [],
      market_research: research.researchSummary
    };

    if (mode === 'research_only') {
      db.projects.set(newProject.id, newProject);
      db.save();
      db.logAudit(user.id, user.email, 'PROJECT_BUILD_RESEARCH', `Researched: ${newProject.title}`);
      return res.json({ project: newProject });
    }

    // Full Pipeline Build:
    // Step D: Generate Design and Production Prompts
    const design = await aiPodService.generateDesignData(primaryConcept, chosenStyle);
    newProject.design = design;

    // Step E: Generate Mockup Factory (11 Mockups Workflow)
    const mockups = await aiPodService.generateMockupPrompts({
      productType: chosenType,
      designTitle: primaryConcept.name,
      style: chosenStyle
    });
    newProject.mockups = mockups;

    // Step F: Generate Etsy SEO Listing
    const seo = await aiPodService.generateEtsyListing({
      productType: chosenType,
      concept: primaryConcept,
      style: chosenStyle
    });
    newProject.seo = seo;

    // Step G: Calculate Profitability
    const suggestedPrice = seo.price_range?.suggested || 38;
    const estimatedCost = chosenType === 'Hoodie' ? 21.50 : chosenType === 'Mug' ? 6.80 : 12.50;
    const shippingCharged = 4.99;
    const shippingCost = 5.20;
    const marketplaceFee = suggestedPrice * 0.065;
    const paymentFee = 0.25 + (suggestedPrice * 0.03);
    const adSpend = 4.50;
    const grossRev = suggestedPrice + shippingCharged;
    const totalFees = estimatedCost + shippingCost + marketplaceFee + paymentFee + adSpend;
    const netProfit = Number((grossRev - totalFees).toFixed(2));
    const profitMargin = Number(((netProfit / grossRev) * 100).toFixed(1));

    newProject.profit = {
      currency: 'USD',
      selling_price: suggestedPrice,
      product_cost: estimatedCost,
      shipping_charged: shippingCharged,
      shipping_expense: shippingCost,
      marketplace_fee_percent: 6.5,
      payment_processing_fixed: 0.25,
      payment_processing_percent: 3.0,
      ad_spend: adSpend,
      other_costs: 0.50,
      gross_revenue: Number(grossRev.toFixed(2)),
      total_fees: Number(totalFees.toFixed(2)),
      net_profit: netProfit,
      profit_margin: profitMargin
    };

    // Step H: Pinterest Content Factory (5 Pins)
    const pins = await aiPodService.generatePinterestFactory({
      productType: chosenType,
      concept: primaryConcept
    });
    newProject.pinterest = pins;

    // Save full package!
    db.projects.set(newProject.id, newProject);
    db.save();
    db.logAudit(user.id, user.email, 'PROJECT_BUILD_FULL', `Completed full build for ${newProject.title}`);

    return res.json({ project: newProject });
  } catch (err: any) {
    console.error('Wizard pipeline error:', err);
    return res.status(500).json({ error: 'Failed to complete product wizard. Please retry.' });
  }
});

// 4. Update Project (e.g. status, concept selection, title)
router.patch('/:id', (req: Request, res: Response): any => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const project = db.projects.get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  if (project.user_id !== user.id && user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { title, status, selected_concept_id, profit, seo } = req.body;
  if (title) project.title = title;
  if (status) project.status = status;
  if (selected_concept_id) project.selected_concept_id = selected_concept_id;
  if (profit) project.profit = { ...project.profit, ...profit };
  if (seo) project.seo = { ...project.seo, ...seo };

  project.updated_at = new Date().toISOString();
  db.projects.set(project.id, project);
  db.save();

  return res.json({ project });
});

// 5. Delete Project
router.delete('/:id', (req: Request, res: Response): any => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const project = db.projects.get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  if (project.user_id !== user.id && user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied' });
  }

  db.projects.delete(project.id);
  db.save();
  db.logAudit(user.id, user.email, 'PROJECT_DELETE', `Deleted project ${project.title}`);

  return res.json({ success: true });
});

// 6. Duplicate Project
router.post('/:id/duplicate', (req: Request, res: Response): any => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const project = db.projects.get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const cloned: Project = {
    ...JSON.parse(JSON.stringify(project)),
    id: crypto.randomUUID(),
    user_id: user.id,
    title: `${project.title} (Copy)`,
    is_sample: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.projects.set(cloned.id, cloned);
  db.save();

  return res.json({ project: cloned });
});

// 7. Regenerate Single Step (Design, Mockups, SEO, Profit, Pinterest, Risk)
router.post('/:id/step/:stepName', requireActiveEntitlement, async (req: Request, res: Response): Promise<any> => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const project = db.projects.get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const step = req.params.stepName;
  const activeConcept = project.concepts.find(c => c.id === project.selected_concept_id) || project.concepts[0];

  try {
    if (step === 'design') {
      project.design = await aiPodService.generateDesignData(activeConcept, project.design_style);
    } else if (step === 'mockups') {
      project.mockups = await aiPodService.generateMockupPrompts({
        productType: project.product_type,
        designTitle: activeConcept.name,
        style: project.design_style
      });
    } else if (step === 'risk') {
      project.risk = await aiPodService.scanRisk(
        `${activeConcept.name}: ${activeConcept.headline}`,
        `Print-on-demand ${project.product_type}`
      );
      project.risk_level = project.risk.overall_risk;
    } else if (step === 'seo') {
      project.seo = await aiPodService.generateEtsyListing({
        productType: project.product_type,
        concept: activeConcept,
        style: project.design_style
      });
    } else if (step === 'pinterest') {
      project.pinterest = await aiPodService.generatePinterestFactory({
        productType: project.product_type,
        concept: activeConcept
      });
    }

    project.updated_at = new Date().toISOString();
    db.projects.set(project.id, project);
    db.save();

    return res.json({ project });
  } catch (err) {
    console.error(`Error regenerating step ${step}:`, err);
    return res.status(500).json({ error: `Failed to regenerate ${step}` });
  }
});

// 8. Project Export (ZIP, JSON, CSV)
router.get('/:id/export/:format', async (req: Request, res: Response): Promise<any> => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const project = db.projects.get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const format = req.params.format.toLowerCase();

  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${project.title.replace(/[^a-z0-9]/gi, '_')}.json"`);
    return res.send(JSON.stringify(project, null, 2));
  }

  if (format === 'csv') {
    // Generate clean CSV for Etsy / listings
    const rows = [
      ['Title', 'Product Type', 'Price', '13 Tags', 'Materials', 'Description'],
      [
        `"${(project.seo?.title || project.title).replace(/"/g, '""')}"`,
        `"${project.product_type}"`,
        project.profit?.selling_price || 35.00,
        `"${(project.seo?.tags || []).join(', ').replace(/"/g, '""')}"`,
        `"${(project.seo?.materials || '').replace(/"/g, '""')}"`,
        `"${(project.seo?.description || '').replace(/"/g, '""')}"`
      ]
    ];
    const csvContent = rows.map(r => r.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${project.title.replace(/[^a-z0-9]/gi, '_')}.csv"`);
    return res.send(csvContent);
  }

  if (format === 'zip') {
    const zip = new JSZip();

    // 1. Overview and metadata README
    const readme = `# ${project.title} — GiveMePOD Commercial Launch Package
Product Type: ${project.product_type}
Design Style: ${project.design_style}
Opportunity Score: ${project.opportunity_score}/100
Risk Level: ${project.risk_level}
Generated: ${project.created_at}

Contents in this package:
- 01_Design_Artwork_Specs.txt
- 02_Mockups_Prompts_And_List.txt
- 03_Etsy_SEO_Listing.txt
- 04_Pinterest_Content_Factory.txt
- 05_Profit_Margins_Breakdown.txt
- 06_IP_Risk_Screen_Report.txt
- data.json
`;
    zip.file('README.txt', readme);
    zip.file('data.json', JSON.stringify(project, null, 2));

    // 2. Design artwork specs
    if (project.design) {
      const designDoc = `TITLE: ${project.design.title}
CONCEPT: ${project.design.design_concept}

IMAGE GENERATION PROMPT:
${project.design.prompt}

NEGATIVE PROMPT:
${project.design.negative_prompt}

PRINT SPECIFICATIONS:
${project.design.print_specs}
TRANSPARENT BACKGROUND REQUIREMENT: ${project.design.transparent_bg_required ? 'YES (Pure Alpha Channel)' : 'NO'}

COLOR PALETTE:
${(project.design.color_palette || []).join(', ')}
`;
      zip.file('01_Design_Artwork_Specs.txt', designDoc);
    }

    // 3. Mockups prompts
    if (project.mockups && project.mockups.length > 0) {
      let mockupsDoc = `GIVEMEPOD 11-IMAGE MOCKUP FACTORY WORKFLOW\n\n`;
      project.mockups.forEach(m => {
        mockupsDoc += `--------------------------------------------------------\nMOCKUP ${String(m.mockup_number).padStart(2, '0')} — ${m.purpose.toUpperCase()}\nCategory: ${m.category}\nScene: ${m.scene}\nCamera: ${m.camera}\nPrompt: ${m.prompt}\nNegative Prompt: ${m.negative_prompt}\n\n`;
      });
      zip.file('02_Mockups_Prompts_And_List.txt', mockupsDoc);
    }

    // 4. Etsy Listing
    if (project.seo) {
      const seoDoc = `ETSY OPTIMIZED TITLE:
${project.seo.title}

13 ETSY TAGS:
${project.seo.tags.join(', ')}

SUGGESTED PRICE: $${project.seo.price_range?.suggested} (Range: $${project.seo.price_range?.min} - $${project.seo.price_range?.max})

MATERIALS:
${project.seo.materials}

DESCRIPTION:
${project.seo.description}

BUYER FAQ:
${project.seo.faq.map(f => `Q: ${f.q}\nA: ${f.a}`).join('\n\n')}
`;
      zip.file('03_Etsy_SEO_Listing.txt', seoDoc);
    }

    // 5. Pinterest Pins
    if (project.pinterest && project.pinterest.length > 0) {
      let pinDoc = `PINTEREST CONTENT FACTORY (5 VIRAL CONCEPTS)\n\n`;
      project.pinterest.forEach((pin, i) => {
        pinDoc += `PIN ${i + 1}: ${pin.pin_title}\nBoard: ${pin.board}\nCTA: ${pin.cta}\nKeywords: ${pin.target_keywords.join(', ')}\nDescription:\n${pin.pin_description}\n\n`;
      });
      zip.file('04_Pinterest_Content_Factory.txt', pinDoc);
    }

    // 6. Profit
    if (project.profit) {
      const profitDoc = `POD PROFIT MARGIN MATH (${project.profit.currency})
Selling Price: $${project.profit.selling_price}
Customer Shipping Charged: $${project.profit.shipping_charged}
----------------------------------------
Gross Revenue: $${project.profit.gross_revenue}

Estimated Product Cost: $${project.profit.product_cost}
Estimated Shipping Expense: $${project.profit.shipping_expense}
Marketplace Transaction Fees: $${((project.profit.selling_price * project.profit.marketplace_fee_percent) / 100).toFixed(2)}
Payment Processing: $${(project.profit.payment_processing_fixed + (project.profit.selling_price * project.profit.payment_processing_percent / 100)).toFixed(2)}
Estimated Ad Spend: $${project.profit.ad_spend}
Packaging & Overhead: $${project.profit.other_costs}
----------------------------------------
Total Estimated Expenses: $${project.profit.total_fees}
ESTIMATED NET PROFIT: $${project.profit.net_profit}
PROFIT MARGIN: ${project.profit.profit_margin}%
`;
      zip.file('05_Profit_Margins_Breakdown.txt', profitDoc);
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${project.title.replace(/[^a-z0-9]/gi, '_')}_package.zip"`);
    return res.send(zipBuffer);
  }

  return res.status(400).json({ error: 'Unsupported format' });
});

export default router;
