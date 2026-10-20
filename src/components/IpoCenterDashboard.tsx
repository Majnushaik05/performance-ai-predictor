import React, { useState } from 'react';
import { TOP_IPOS } from '../data/marketData';
import { IpoItem } from '../types';
import {
  Rocket,
  Sparkles,
  Clock,
  Award,
  CheckCircle2,
  X,
  ExternalLink,
  Shield,
} from 'lucide-react';

export const IpoCenterDashboard: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'Open Now' | 'Upcoming' | 'Recently Listed'>('Open Now');
  const [activeIpoToApply, setActiveIpoToApply] = useState<IpoItem | null>(null);
  const [appliedLots, setAppliedLots] = useState<number>(1);
  const [upiId, setUpiId] = useState('');
  const [applySuccessToast, setApplySuccessToast] = useState<string | null>(null);

  const filteredIpos = TOP_IPOS.filter((ipo) => {
    if (filter === 'ALL') return true;
    return ipo.status === filter;
  });

  const openCount = TOP_IPOS.filter((i) => i.status === 'Open Now').length;
  const upcomingCount = TOP_IPOS.filter((i) => i.status === 'Upcoming').length;
  const recentCount = TOP_IPOS.filter((i) => i.status === 'Recently Listed').length;

  const handleConfirmApply = () => {
    if (!activeIpoToApply) return;
    setApplySuccessToast(
      `IPO Mandate created for ${activeIpoToApply.companyName}! Application for ${appliedLots} lot(s) submitted.`
    );
    setActiveIpoToApply(null);
    setUpiId('');
    setAppliedLots(1);
    setTimeout(() => setApplySuccessToast(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {applySuccessToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-sm flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{applySuccessToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setApplySuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header with Categorized Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Rocket className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Top IPO Center & Grey Market Premium (GMP)
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verified Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time GMP tracking, live bidding subscriptions, upcoming mainboard issues, and historical listing day track records.
          </p>
        </div>

        {/* Separate Clean Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setFilter('Open Now')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filter === 'Open Now'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            Open Now ({openCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter('Upcoming')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filter === 'Upcoming'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Upcoming ({upcomingCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter('Recently Listed')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filter === 'Recently Listed'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Recently Listed ({recentCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
              filter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Issues ({TOP_IPOS.length})
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredIpos.map((ipo) => {
          const isHighGmp = ipo.gmpPercent >= 30;
          const isRecentlyListed = ipo.status === 'Recently Listed';
          const isOpenNow = ipo.status === 'Open Now';
          const isUpcoming = ipo.status === 'Upcoming';

          return (
            <div
              key={ipo.id}
              className={`bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                isOpenNow
                  ? 'border-emerald-300'
                  : isRecentlyListed
                  ? 'border-slate-200'
                  : 'border-blue-200'
              }`}
            >
              <div>
                {/* Status Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                        isOpenNow
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 animate-pulse'
                          : isUpcoming
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {isOpenNow
                        ? '🟢 Bidding Open'
                        : isUpcoming
                        ? `📅 Opens ${ipo.openDate}`
                        : `🏁 Listed on ${ipo.listingDate}`}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 font-sans">
                    {ipo.sector}
                  </span>
                </div>

                {/* Company Name & Symbol */}
                <div className="mt-3">
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                    {ipo.companyName}
                  </h3>
                  <span className="text-xs font-mono font-bold text-slate-400">{ipo.symbol}</span>
                </div>

                {/* Numbers Grid */}
                {isRecentlyListed ? (
                  /* Track Record Specific Numbers */
                  <div className="grid grid-cols-2 gap-2 my-4 text-xs font-numbers">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-sans text-slate-400 block">Issue Price</span>
                      <span className="font-bold text-slate-900">₹{ipo.issuePrice}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200">
                      <span className="text-[10px] font-sans text-purple-700 block">Listing Price</span>
                      <span className="font-black text-purple-900">₹{ipo.listingPrice}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 col-span-2">
                      <span className="text-[10px] font-sans text-emerald-700 block">
                        Listing Day Pop / Gain
                      </span>
                      <span className="font-black text-emerald-800 text-base">
                        {ipo.listingGainPercent && ipo.listingGainPercent > 0 ? '+' : ''}
                        {ipo.listingGainPercent}% Listing Gain
                      </span>
                      {ipo.currentMarketPrice && (
                        <span className="text-[11px] text-slate-500 font-sans block mt-0.5">
                          Current Market Price: ₹{ipo.currentMarketPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Live / Upcoming Numbers Grid */
                  <div className="grid grid-cols-2 gap-2 my-4 text-xs font-numbers">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-sans text-slate-400 block">Price Band</span>
                      <span className="font-bold text-slate-900">{ipo.priceBand}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-sans text-slate-400 block">Issue Size</span>
                      <span className="font-bold text-slate-900">{ipo.issueSize}</span>
                    </div>
                    <div
                      className={`p-2.5 rounded-lg border ${
                        isHighGmp
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <span className="text-[10px] font-sans text-slate-400 block">
                        Grey Market Premium
                      </span>
                      <span className="font-black text-emerald-700 text-sm">
                        +₹{ipo.gmpPrice} ({ipo.gmpPercent}%)
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-sans text-slate-400 block">
                        {isOpenNow ? 'Live Subscription' : 'Bidding Window'}
                      </span>
                      <span className="font-bold text-slate-900">{ipo.subscription}</span>
                    </div>
                  </div>
                )}

                {/* AI Recommendation Box */}
                <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    AI Verdict: {ipo.aiRecommendation}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {ipo.verdictDetail}
                  </p>
                </div>
              </div>

              {/* Action / Timeline Footer */}
              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between font-numbers">
                {isOpenNow ? (
                  <>
                    <span className="text-emerald-700 font-bold font-sans">
                      Closes: {ipo.closeDate}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveIpoToApply(ipo)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <span>Apply via UPI</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </>
                ) : isUpcoming ? (
                  <>
                    <span className="flex items-center gap-1 font-sans">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Window: {ipo.openDate} - {ipo.closeDate}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveIpoToApply(ipo)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Pre-Apply
                    </button>
                  </>
                ) : (
                  <>
                    <span className="font-sans text-slate-500">
                      Listing Date: {ipo.listingDate}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold font-sans text-[10px]">
                      Historical Record
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Apply / Bid Simulator Modal */}
      {activeIpoToApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Mainboard IPO Application
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {activeIpoToApply.companyName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveIpoToApply(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 font-numbers">
                <div className="flex justify-between text-slate-600">
                  <span className="font-sans">Cut-off Price:</span>
                  <span className="font-bold text-slate-900">{activeIpoToApply.priceBand}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-sans">Lot Size:</span>
                  <span className="font-bold text-slate-900">
                    {activeIpoToApply.lotSize || 15} shares per lot
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-sans">Minimum Retail Investment:</span>
                  <span className="font-bold text-emerald-700">
                    {activeIpoToApply.minInvestment || '₹14,800'}
                  </span>
                </div>
              </div>

              {/* Number of Lots Selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Lots</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 5, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setAppliedLots(num)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        appliedLots === num
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {num} {num === 1 ? 'Lot' : 'Lots'}
                    </button>
                  ))}
                </div>
              </div>

              {/* UPI ID input */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">UPI ID for ASBA Mandate</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. mobile@okhdfcbank or user@ybl"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-[11px] text-emerald-800">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Funds remain in your bank account blocked via NPCI UPI Mandate until allotment.
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveIpoToApply(null)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApply}
                className="flex-1 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Rocket className="w-3.5 h-3.5" />
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
