import { Router, Request, Response } from 'express';
import { db } from '../db';
import { getAuthenticatedUser } from './auth';
import { aiPodService } from '../ai';

const router = Router();

// 1. Trend Hunter Search
router.post('/trends/search', async (req: Request, res: Response): Promise<any> => {
  const { keyword, product, style, market, dateRange } = req.body;
  const kw = keyword || 'Urban Minimalist Apparel';

  try {
    const research = await aiPodService.researchTrendAndOpportunity({
      productType: product || 'T-Shirt',
      style: style || 'Minimalist',
      gender: 'Unisex',
      ageRange: '25–34',
      nicheInterest: kw
    });

    const mockTrends = [
      {
        id: 'trend-1',
        trendName: `${kw} Coordinates & Schematics`,
        source: 'Etsy & Google Trends',
        searchSignal: '92/100 Strong Commercial Velocity',
        trendMomentum: 'Rising',
        competition: 'Moderate (48/100)',
        nicheSpecificity: 'High (88/100)',
        opportunityScore: research.opportunityBreakdown.overall_score,
        lastUpdated: new Date().toISOString(),
        dataType: 'Aggregated Search Signal'
      },
      {
        id: 'trend-2',
        trendName: `Vintage Distressed ${kw} Crest`,
        source: 'Pinterest Trends',
        searchSignal: '84/100 Viral Board Pinning',
        trendMomentum: 'Rising',
        competition: 'High (62/100)',
        nicheSpecificity: 'Medium (74/100)',
        opportunityScore: Math.max(70, research.opportunityBreakdown.overall_score - 4),
        lastUpdated: new Date().toISOString(),
        dataType: 'Social Velocity Signal'
      },
      {
        id: 'trend-3',
        trendName: `Aesthetic Botanical Line Art`,
        source: 'Marketplace Trend Data',
        searchSignal: '79/100 Consistent Gifting Volume',
        trendMomentum: 'Stable',
        competition: 'Moderate (54/100)',
        nicheSpecificity: 'High (85/100)',
        opportunityScore: 82,
        lastUpdated: new Date().toISOString(),
        dataType: 'Marketplace Signal'
      }
    ];

    return res.json({
      trends: mockTrends,
      summary: research.researchSummary
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to search trends.' });
  }
});

// 2. Niche Discovery Engine
router.post('/niches/discover', async (req: Request, res: Response): Promise<any> => {
  const { broadNiche } = req.body;
  if (!broadNiche) {
    return res.status(400).json({ error: 'Broad niche is required' });
  }

  try {
    const result = await aiPodService.discoverNiches(broadNiche);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to discover niches.' });
  }
});

// 3. IP / Trademark Risk Scanner
router.post('/risk/scan', async (req: Request, res: Response): Promise<any> => {
  const { phrase, context } = req.body;
  if (!phrase) {
    return res.status(400).json({ error: 'Phrase or design title is required to scan.' });
  }

  try {
    const result = await aiPodService.scanRisk(phrase, context);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to scan risk.' });
  }
});

// 4. Competitor Research & Gap Finder
router.post('/competitors/analyze', async (req: Request, res: Response): Promise<any> => {
  const { keyword } = req.body;
  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required for competitor analysis.' });
  }

  try {
    const result = await aiPodService.analyzeCompetitors(keyword);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to analyze competitors.' });
  }
});

// 5. AI POD Advisor Chat
router.post('/ai/advisor', async (req: Request, res: Response): Promise<any> => {
  const { message, projectContext, chatHistory } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const answer = await aiPodService.askAdvisor({
      userMessage: message,
      projectContext,
      chatHistory
    });
    return res.json({ answer });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to query advisor.' });
  }
});

// 6. Platform Matcher Analysis
router.get('/platforms', (req: Request, res: Response): any => {
  const platforms = [
    {
      id: 'etsy',
      name: 'Etsy',
      category: 'Marketplace',
      fit: 'Excellent (95/100)',
      reason: 'Unmatched organic search for personalized gifts, aesthetic apparel, and niche communities.',
      requirements: '$0.20 listing fee per 4 months, 6.5% transaction fee, payment processing.',
      limitations: 'Strict IP enforcement and search ranking algorithms; manual or automated API sync available.',
      status: db.systemConfig.integrations.etsy.connected ? 'Connected' : 'Configured / Ready to Authorize'
    },
    {
      id: 'shopify',
      name: 'Shopify',
      category: 'Standalone Store',
      fit: 'High (88/100)',
      reason: 'Full control over brand identity, customer email list, and high-ticket pricing.',
      requirements: 'Requires independent paid advertising (Meta/TikTok ads) or strong social media presence.',
      limitations: 'Zero built-in marketplace traffic.',
      status: 'Ready for Manual / Webhook Export'
    },
    {
      id: 'printify',
      name: 'Printify',
      category: 'Fulfillment Partner',
      fit: 'Essential (98/100)',
      reason: 'Largest network of global print providers with competitive base blank costs.',
      requirements: 'API key or automated Etsy/Shopify integration.',
      limitations: 'Production quality varies by print provider selection.',
      status: 'Supported'
    },
    {
      id: 'printful',
      name: 'Printful',
      category: 'Fulfillment Partner',
      fit: 'High (90/100)',
      reason: 'Superior in-house print quality and premium embroidery capabilities.',
      requirements: 'Account integration with e-commerce store.',
      limitations: 'Slightly higher base garment costs than Printify.',
      status: 'Supported'
    },
    {
      id: 'merch_by_amazon',
      name: 'Amazon Merch on Demand',
      category: 'Marketplace',
      fit: 'Moderate (78/100)',
      reason: 'Massive organic shopper volume with Prime delivery badge.',
      requirements: 'Requires approved Amazon Merch account invitation.',
      limitations: 'Very strict zero-tolerance trademark rejections and lower royalties.',
      status: 'Supported via CSV / Design Export'
    },
    {
      id: 'redbubble',
      name: 'Redbubble',
      category: 'Passive Marketplace',
      fit: 'Moderate (72/100)',
      reason: 'Completely hands-off fulfillment, customer service, and manufacturing.',
      requirements: 'Public artist profile.',
      limitations: 'Account tier fees and competitive search pages.',
      status: 'Supported'
    }
  ];

  return res.json({ platforms });
});

// 7. Profit Margin Math Endpoint
router.post('/profit/calculate', (req: Request, res: Response): any => {
  const {
    sellingPrice = 38.00,
    productCost = 13.50,
    shippingCharged = 4.99,
    shippingExpense = 5.20,
    marketplaceFeePercent = 6.5,
    paymentProcessingPercent = 3.0,
    paymentProcessingFixed = 0.25,
    adSpend = 4.50,
    otherCosts = 0.50,
    currency = 'USD'
  } = req.body;

  const sp = Number(sellingPrice);
  const pc = Number(productCost);
  const sc = Number(shippingCharged);
  const se = Number(shippingExpense);
  const mfPct = Number(marketplaceFeePercent);
  const ppPct = Number(paymentProcessingPercent);
  const ppFix = Number(paymentProcessingFixed);
  const ad = Number(adSpend);
  const oc = Number(otherCosts);

  const grossRevenue = sp + sc;
  const marketplaceFee = (grossRevenue * mfPct) / 100;
  const paymentFee = ppFix + ((grossRevenue * ppPct) / 100);
  const totalFees = pc + se + marketplaceFee + paymentFee + ad + oc;
  const netProfit = Number((grossRevenue - totalFees).toFixed(2));
  const profitMargin = Number(((netProfit / (grossRevenue || 1)) * 100).toFixed(1));

  return res.json({
    currency,
    selling_price: sp,
    product_cost: pc,
    shipping_charged: sc,
    shipping_expense: se,
    marketplace_fee_percent: mfPct,
    payment_processing_fixed: ppFix,
    payment_processing_percent: ppPct,
    ad_spend: ad,
    other_costs: oc,
    gross_revenue: Number(grossRevenue.toFixed(2)),
    total_fees: Number(totalFees.toFixed(2)),
    net_profit: netProfit,
    profit_margin: profitMargin
  });
});

// 8. Integrations Status & Toggles
router.post('/integrations/pinterest/connect', (req: Request, res: Response): any => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const current = db.systemConfig.integrations.pinterest.connected;
  db.systemConfig.integrations.pinterest = {
    connected: !current,
    username: !current ? `${user.name.replace(/\s+/g, '').toLowerCase()}_pod` : undefined,
    connected_at: !current ? new Date().toISOString() : undefined
  };
  db.save();
  db.logAudit(user.id, user.email, 'PINTEREST_INTEGRATION_TOGGLE', `Status: ${!current ? 'Connected' : 'Disconnected'}`);

  return res.json({
    status: db.systemConfig.integrations.pinterest
  });
});

router.post('/integrations/etsy/connect', (req: Request, res: Response): any => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const current = db.systemConfig.integrations.etsy.connected;
  db.systemConfig.integrations.etsy = {
    connected: !current,
    shop_name: !current ? 'GiveMePOD_Official_Shop' : undefined,
    connected_at: !current ? new Date().toISOString() : undefined
  };
  db.save();
  db.logAudit(user.id, user.email, 'ETSY_INTEGRATION_TOGGLE', `Status: ${!current ? 'Connected' : 'Disconnected'}`);

  return res.json({
    status: db.systemConfig.integrations.etsy,
    notice: 'GiveMePOD is an independent application and is not endorsed or certified by Etsy, Inc.'
  });
});

export default router;
