
import React from 'react';
import type { Subscription } from '../types';
import SubscriptionCard from './SubscriptionCard';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onCancel: (id: string) => void;
  onRenew: (subscription: Subscription) => void;
  isExpired?: boolean;
  emptyState?: React.ReactNode;
}

const DefaultEmptyState = () => (
    <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-slate-700">No subscriptions yet!</h2>
        <p className="mt-2 text-slate-500">Click "Add Subscription" to get started.</p>
    </div>
);

const SubscriptionList: React.FC<SubscriptionListProps> = ({ subscriptions, onEdit, onDelete, onCancel, onRenew, isExpired = false, emptyState = <DefaultEmptyState /> }) => {
  if (subscriptions.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subscriptions.map(sub => (
        <SubscriptionCard 
          key={sub.id} 
          subscription={sub} 
          onEdit={onEdit} 
          onDelete={onDelete}
          onCancel={onCancel}
          onRenew={onRenew}
          isExpired={isExpired}
        />
      ))}
    </div>
  );
};

export default SubscriptionList;
