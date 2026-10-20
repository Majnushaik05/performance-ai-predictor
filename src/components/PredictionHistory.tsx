import React from 'react';
import { PredictionResult } from '../types';
import { History, Trash2, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react';

interface PredictionHistoryProps {
  history: PredictionResult[];
  onClear: () => void;
  onSelectHistorical: (prediction: PredictionResult) => void;
}

export const PredictionHistory: React.FC<PredictionHistoryProps> = ({
  history,
  onClear,
  onSelectHistorical,
}) => {
  if (history.length === 0) {
    return null;
  }

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ai_stock_predictions_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm mt-6">
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Prediction Session Audit Log
            </h3>
            <p className="text-xs text-slate-500">Historical record of evaluated market vectors</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="text-xs px-3 py-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer font-medium"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Log
          </button>
          <button
            type="button"
            onClick={onClear}
            className="text-xs px-3 py-1.5 text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-md border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer font-medium"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            Clear
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono tabular-nums">
          <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Index</th>
              <th className="py-2.5 px-3">Direction</th>
              <th className="py-2.5 px-3">Confidence</th>
              <th className="py-2.5 px-3">Trend Signal</th>
              <th className="py-2.5 px-3">Close / Open</th>
              <th className="py-2.5 px-3">Pattern</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.map((item, idx) => {
              const isBull = item.vectorDirection === 'BULLISH';
              return (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{item.timestamp}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{item.index}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                        isBull
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-rose-50 text-rose-700 border-rose-300'
                      }`}
                    >
                      {isBull ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {item.vectorDirection}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-900 font-bold">{item.confidence.toFixed(2)}%</td>
                  <td className="py-2.5 px-3 text-slate-700 text-[11px] truncate max-w-xs font-sans">
                    {item.trendShift?.headline || 'Standard Vector'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    ₹{item.inputMetrics.close} / ₹{item.inputMetrics.open}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 truncate max-w-xs font-sans">
                    {item.technicalAnalysis.patternDetected}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectHistorical(item)}
                      className="text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer font-bold"
                    >
                      Reload
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
