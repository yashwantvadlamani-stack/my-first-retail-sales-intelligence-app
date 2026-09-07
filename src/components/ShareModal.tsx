import React, { useState } from 'react';
import { Share2, X, Copy, Check, ExternalLink, Link2, Filter } from 'lucide-react';
import { generateShareableUrl } from '../utils/exporter';
import { FilterState } from '../types/retail';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  darkMode: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  filters,
  darkMode,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = generateShareableUrl(filters);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeFiltersCount =
    filters.timePeriods.length +
    filters.regions.length +
    filters.cities.length +
    filters.stores.length +
    filters.storeFormats.length +
    filters.categories.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="share-app-modal"
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Share Live Dashboard</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Share this interactive instance with synchronized filter state
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-xs text-slate-700 dark:text-slate-300 mb-1.5 block">
              Direct Application Link:
            </label>
            <div className="flex items-center gap-2">
              <div
                className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border font-mono text-[11px] truncate select-all ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <Link2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{shareUrl}</span>
              </div>
              <button
                type="button"
                id="btn-copy-share-url"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          <div
            className={`p-3.5 rounded-xl border text-xs leading-normal ${
              darkMode ? 'bg-slate-800/40 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white mb-1">
              <Filter className="w-3.5 h-3.5 text-blue-500" />
              <span>Embedded State Synchronization:</span>
            </div>
            {activeFiltersCount > 0 ? (
              <p>
                This link preserves your {activeFiltersCount} active filter criteria (Regions, Categories, Weeks, Stores). Anyone opening the link will immediately see the identical analytical breakdown and insights.
              </p>
            ) : (
              <p>
                This link opens the full enterprise retail intelligence view with default unfiltered enterprise datasets.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-medium rounded-lg border ${
              darkMode
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
