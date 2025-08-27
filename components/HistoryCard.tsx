import React, { useState } from 'react';
import type { Subscription } from '../types';
import { EditIcon, TrashIcon, ChevronDownIcon } from './icons';

interface HistoryCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ subscription, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { serviceProvider, amount, renewalDate, details, billingCycle } = subscription;

  const formattedRenewalDate = new Date(renewalDate).toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
  });

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        aria-expanded={isExpanded}
        aria-controls={`history-details-${subscription.id}`}
      >
        <div>
            <h4 className="font-bold text-slate-800">{serviceProvider}</h4>
            <p className="text-sm text-slate-500">Expired on {formattedRenewalDate}</p>
        </div>
        <div className="flex items-center gap-4">
             <p className="font-bold text-slate-600">
                €{amount.toFixed(2)}
                <span className="text-xs font-normal text-slate-500 capitalize">/{billingCycle === 'one-time' ? 'once' : billingCycle.slice(0, 2)}</span>
            </p>
            <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isExpanded && (
        <div id={`history-details-${subscription.id}`} className="px-4 pb-4 border-t border-slate-200 animate-fade-in-down">
          {details && <p className="mt-4 text-sm text-slate-600 bg-slate-50 p-3 rounded-md">{details}</p>}
           <div className="flex items-center justify-end gap-2 mt-4">
                <button onClick={() => onEdit(subscription)} className="p-2 text-slate-500 hover:text-lime-600 hover:bg-lime-100 rounded-full transition-colors" aria-label={`Edit ${serviceProvider}`}>
                    <EditIcon className="w-5 h-5" />
                </button>
                <button onClick={() => onDelete(subscription.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors" aria-label={`Delete ${serviceProvider}`}>
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default HistoryCard;
