import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Percent,
  RefreshCw,
  Info
} from 'lucide-react';

export const ProfitCalculatorView: React.FC = () => {
  const { t } = useLanguage();

  const [currency, setCurrency] = useState('USD');
  const [sellingPrice, setSellingPrice] = useState(38.00);
  const [productCost, setProductCost] = useState(13.50);
  const [shippingCharged, setShippingCharged] = useState(4.99);
  const [shippingExpense, setShippingExpense] = useState(5.20);
  const [marketplaceFeePct, setMarketplaceFeePct] = useState(6.5);
  const [paymentFixed, setPaymentFixed] = useState(0.25);
  const [paymentPct, setPaymentPct] = useState(3.0);
  const [adSpend, setAdSpend] = useState(4.50);
  const [otherCosts, setOtherCosts] = useState(0.50);

  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
    AUD: 'A$',
    MAD: 'MAD '
  };

  const symbol = currencySymbols[currency] || '$';

  // Math
  const grossRevenue = sellingPrice + shippingCharged;
  const marketplaceFee = (grossRevenue * marketplaceFeePct) / 100;
  const paymentFee = paymentFixed + ((grossRevenue * paymentPct) / 100);
  const totalFees = productCost + shippingExpense + marketplaceFee + paymentFee + adSpend + otherCosts;
  const netProfit = Number((grossRevenue - totalFees).toFixed(2));
  const profitMargin = Number(((netProfit / (grossRevenue || 1)) * 100).toFixed(1));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {t('profit.title', 'POD Profit Calculator')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('profit.subtitle', 'Calculate real net margins considering manufacturing costs, shipping, Etsy/Shopify fees, and ad spend.')}
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono">
          {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'MAD'].map(cur => (
            <button
              key={cur}
              onClick={() => setCurrency(cur)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                currency === cur ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {cur}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form Inputs */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#111724] border border-slate-800 space-y-6">
          <h3 className="text-sm font-semibold text-white">Pricing & Production Costs</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">{t('profit.sellingPrice', 'Selling Price')}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">{symbol}</span>
                <input
                  type="number"
                  step="0.01"
                  value={sellingPrice}
                  onChange={e => setSellingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 pl-8 pr-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">{t('profit.productCost', 'Base Product Cost (Printify / Printful)')}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">{symbol}</span>
                <input
                  type="number"
                  step="0.01"
                  value={productCost}
                  onChange={e => setProductCost(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 pl-8 pr-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">{t('profit.shippingCost', 'Shipping Charged to Customer')}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">{symbol}</span>
                <input
                  type="number"
                  step="0.01"
                  value={shippingCharged}
                  onChange={e => setShippingCharged(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 pl-8 pr-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">{t('profit.shippingExpense', 'Actual Shipping Expense (Provider)')}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">{symbol}</span>
                <input
                  type="number"
                  step="0.01"
                  value={shippingExpense}
                  onChange={e => setShippingExpense(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 pl-8 pr-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">{t('profit.marketplaceFee', 'Marketplace Fee (%) - Etsy 6.5%')}</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={marketplaceFeePct}
                  onChange={e => setMarketplaceFeePct(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">{t('profit.adSpend', 'Estimated Ad Spend Per Unit')}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">{symbol}</span>
                <input
                  type="number"
                  step="0.01"
                  value={adSpend}
                  onChange={e => setAdSpend(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 pl-8 pr-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Margin Breakdown Output */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-[#131b2e] to-[#0e1422] border border-slate-800 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
              Unit Economics Analysis
            </span>

            <div className="space-y-1">
              <span className="text-xs text-slate-400">Net Profit Per Order</span>
              <div className="text-3xl font-extrabold font-mono text-emerald-400 tabular-nums">
                {symbol}{netProfit.toFixed(2)}
              </div>
              <div className="text-xs font-mono text-slate-300">
                Net Margin: <strong className="text-white">{profitMargin}%</strong>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Gross Revenue:</span>
                <strong className="font-mono text-white">{symbol}{grossRevenue.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Product Base Cost:</span>
                <span className="font-mono text-rose-400">-{symbol}{productCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Net Shipping Balance:</span>
                <span className="font-mono text-slate-300">{symbol}{(shippingCharged - shippingExpense).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Marketplace & Payment Fees:</span>
                <span className="font-mono text-amber-400">-{symbol}{(marketplaceFee + paymentFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Ad Spend Allocation:</span>
                <span className="font-mono text-amber-400">-{symbol}{adSpend.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>{t('profit.estimatesDisclaimer', 'All figures are estimated guidelines based on standard seller fee schedules.')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
