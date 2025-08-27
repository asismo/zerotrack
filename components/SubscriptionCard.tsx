
import React from 'react';
import type { Subscription } from '../types';
import { EditIcon, TrashIcon, CancelIcon, RenewIcon } from './icons';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onCancel: (id: string) => void;
  onRenew: (subscription: Subscription) => void;
  isExpired?: boolean;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription, onEdit, onDelete, onCancel, onRenew, isExpired = false }) => {
  const { serviceProvider, amount, billingCycle, renewalDate, details } = subscription;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const renewal = new Date(renewalDate);
  // Adjust for timezone offset to compare dates correctly
  renewal.setMinutes(renewal.getMinutes() + renewal.getTimezoneOffset());
  const daysUntilRenewal = Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  let renewalInfo;
  let renewalColor = 'text-slate-500';

  const formattedRenewalDate = new Date(renewalDate).toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
  });

  if (isExpired) {
    renewalInfo = `Expired on ${formattedRenewalDate}`;
    renewalColor = 'text-slate-400';
  } else if (daysUntilRenewal < 0) {
    renewalInfo = `Expired ${Math.abs(daysUntilRenewal)} days ago`;
    renewalColor = 'text-slate-400';
  } else if (daysUntilRenewal === 0) {
    renewalInfo = `Renews today`;
    renewalColor = 'text-red-500 font-bold';
  } else if (daysUntilRenewal <= 7) {
    renewalInfo = `Renews in ${daysUntilRenewal} ${daysUntilRenewal === 1 ? 'day' : 'days'}`;
    renewalColor = 'text-amber-600 font-semibold';
  } else {
    renewalInfo = `Renews in ${daysUntilRenewal} days`;
  }
  
  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col ${isExpired ? 'filter grayscale opacity-75' : ''}`}>
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-slate-800 tracking-wide">{serviceProvider}</h3>
          <p className="text-xl font-bold text-lime-600">
            €{amount.toFixed(2)}
            <span className="text-sm font-normal text-slate-500 capitalize">/{billingCycle === 'one-time' ? 'once' : billingCycle.slice(0, 2)}</span>
          </p>
        </div>
        <p className={`mt-2 text-sm font-medium ${renewalColor}`}>{renewalInfo}</p>
        {!isExpired && <p className="text-xs text-slate-400">Next bill on: {formattedRenewalDate}</p>}

        {details && <p className="mt-4 text-sm text-slate-600 bg-slate-50 p-3 rounded-md">{details}</p>}
      </div>
      <div className="bg-slate-50 p-4 flex justify-between items-center gap-2">
        {!isExpired ? (
            <div className="flex items-center gap-2">
                <button onClick={() => onCancel(subscription.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-100 hover:bg-red-200 rounded-md transition-colors">
                    <CancelIcon className="w-4 h-4" />
                    <span>Cancel</span>
                </button>
                {billingCycle !== 'one-time' && (
                    <button onClick={() => onRenew(subscription)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-green-600 bg-green-100 hover:bg-green-200 rounded-md transition-colors">
                        <RenewIcon className="w-4 h-4" />
                        <span>Renew</span>
                    </button>
                )}
            </div>
        ) : <div />} {/* Empty div to keep edit/delete buttons aligned to the right */}
        
        <div className="flex items-center gap-2">
            <button onClick={() => onEdit(subscription)} className="p-2 text-slate-500 hover:text-lime-600 hover:bg-lime-100 rounded-full transition-colors" aria-label={`Edit ${serviceProvider}`}>
                <EditIcon className="w-5 h-5" />
            </button>
            <button onClick={() => onDelete(subscription.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors" aria-label={`Delete ${serviceProvider}`}>
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;