
import React, { useState, useMemo, useEffect } from 'react';
import type { Subscription, SortKey } from './types';
import { useSubscriptions } from './hooks/useSubscriptions';
import SubscriptionList from './components/SubscriptionList';
import Modal from './components/Modal';
import SubscriptionForm from './components/SubscriptionForm';
import HistoryCard from './components/HistoryCard';
import HelpModal from './components/HelpModal';
import { PlusIcon, AlertTriangleIcon, EuroIcon, CheckCircleIcon, ArchiveIcon, ZeroIcon, QuestionMarkCircleIcon } from './components/icons';

const App: React.FC = () => {
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription, loading } = useSubscriptions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [subscriptionToEdit, setSubscriptionToEdit] = useState<Subscription | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('renewalDate');

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  useEffect(() => {
    subscriptions.forEach(sub => {
      const renewalDate = new Date(sub.renewalDate);
      renewalDate.setMinutes(renewalDate.getMinutes() + renewalDate.getTimezoneOffset());

      const daysUntilRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilRenewal > 0 && daysUntilRenewal <= 3) {
        const notifiedKey = `notified_${sub.id}_${sub.renewalDate}`;
        if (!localStorage.getItem(notifiedKey)) {
          if (Notification.permission === 'granted') {
            new Notification('Subscription Reminder', {
              body: `${sub.serviceProvider} renews in ${daysUntilRenewal} day(s) for €${sub.amount}.`,
              tag: sub.id // Use a tag to prevent duplicate notifications for the same sub
            });
            localStorage.setItem(notifiedKey, 'true');
          }
        }
      }
    });
  }, [subscriptions, today]);


  const openAddModal = () => {
    setSubscriptionToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (subscription: Subscription) => {
    setSubscriptionToEdit(subscription);
    setIsModalOpen(true);
  };
  
  const openHelpModal = () => setIsHelpModalOpen(true);
  const closeHelpModal = () => setIsHelpModalOpen(false);


  const closeModal = () => {
    setIsModalOpen(false);
    setSubscriptionToEdit(null);
  };

  const handleSave = (subscriptionData: Omit<Subscription, 'id'> | Subscription) => {
    if ('id' in subscriptionData) {
      updateSubscription(subscriptionData);
    } else {
      addSubscription(subscriptionData);
    }
    closeModal();
  };
  
  const handleCancelSubscription = (id: string) => {
    const sub = subscriptions.find(s => s.id === id);
    if (sub) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const cancelledSub = {
        ...sub,
        renewalDate: yesterday.toISOString().split('T')[0],
      };
      updateSubscription(cancelledSub);
    }
  };

  const handleRenewSubscription = (subscription: Subscription) => {
      const currentRenewalDate = new Date(subscription.renewalDate);
      // Adjust for timezone to prevent off-by-one day errors
      currentRenewalDate.setMinutes(currentRenewalDate.getMinutes() + currentRenewalDate.getTimezoneOffset());
      
      let nextRenewalDate = new Date(currentRenewalDate);

      if (subscription.billingCycle === 'monthly') {
          nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 1);
      } else if (subscription.billingCycle === 'yearly') {
          nextRenewalDate.setFullYear(nextRenewalDate.getFullYear() + 1);
      } else {
          // Do not renew 'one-time' subscriptions
          return;
      }

      const renewedSub = {
          ...subscription,
          renewalDate: nextRenewalDate.toISOString().split('T')[0],
      };
      updateSubscription(renewedSub);
  };

  const { activeSubscriptions, expiredSubscriptions } = useMemo(() => {
    const active: Subscription[] = [];
    const expired: Subscription[] = [];
    subscriptions.forEach(sub => {
      const renewalDate = new Date(sub.renewalDate);
      renewalDate.setMinutes(renewalDate.getMinutes() + renewalDate.getTimezoneOffset());
      if (renewalDate < today) {
        expired.push(sub);
      } else {
        active.push(sub);
      }
    });
    return { activeSubscriptions: active, expiredSubscriptions: expired };
  }, [subscriptions, today]);

  const sortedActiveSubscriptions = useMemo(() => {
    return [...activeSubscriptions].sort((a, b) => {
        switch (sortKey) {
            case 'renewalDate':
                return new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime();
            case 'serviceProvider':
                return a.serviceProvider.localeCompare(b.serviceProvider);
            case 'amount':
                return b.amount - a.amount;
            default:
                return 0;
        }
    });
  }, [activeSubscriptions, sortKey]);
  
  const groupedExpiredSubscriptions = useMemo(() => {
    const groups: { [year: string]: Subscription[] } = {};
    
    const sortedExpired = [...expiredSubscriptions].sort((a, b) => new Date(b.renewalDate).getTime() - new Date(a.renewalDate).getTime());

    sortedExpired.forEach(sub => {
        const year = new Date(sub.renewalDate).getFullYear().toString();
        if (!groups[year]) {
            groups[year] = [];
        }
        groups[year].push(sub);
    });
    return Object.entries(groups).sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA));
  }, [expiredSubscriptions]);


  const totalMonthlyCost = useMemo(() => {
    return activeSubscriptions.reduce((total, sub) => {
      if (sub.billingCycle === 'monthly') {
        return total + sub.amount;
      }
      if (sub.billingCycle === 'yearly') {
        return total + sub.amount / 12;
      }
      return total;
    }, 0);
  }, [activeSubscriptions]);
  
  const nextRenewal = useMemo(() => {
    if (sortedActiveSubscriptions.length === 0) return null;
    return sortedActiveSubscriptions[0];
  }, [sortedActiveSubscriptions]);
  
  const urgentSubscriptions = useMemo(() => {
    return activeSubscriptions.filter(sub => {
        const renewalDate = new Date(sub.renewalDate);
        renewalDate.setMinutes(renewalDate.getMinutes() + renewalDate.getTimezoneOffset());
        const daysUntilRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilRenewal >= 0 && daysUntilRenewal <= 3;
    });
  }, [activeSubscriptions, today]);

  const globalSpent = useMemo(() => {
    return expiredSubscriptions.reduce((total, sub) => total + sub.amount, 0);
  }, [expiredSubscriptions]);


  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-10 border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <ZeroIcon className="w-10 h-10" />
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">ZERO Track</h1>
                <p className="text-sm text-slate-500 -mt-1">Never overpay for subscriptions again.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <button onClick={openHelpModal} className="p-2 text-slate-500 hover:text-lime-600 hover:bg-lime-100 rounded-full transition-colors" aria-label="Help">
                  <QuestionMarkCircleIcon className="w-6 h-6" />
               </button>
              <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-lime-600 text-white rounded-lg font-semibold shadow-md hover:bg-lime-700 transition-all transform hover:scale-105">
                <PlusIcon className="w-5 h-5" />
                <span>Add Subscription</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Urgent Alerts */}
        {urgentSubscriptions.length > 0 && (
          <div className="mb-8 space-y-3">
            {urgentSubscriptions.map(sub => (
              <div key={sub.id} className="bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-4 rounded-r-lg shadow-md flex items-center gap-4">
                  <AlertTriangleIcon className="w-6 h-6 text-amber-600" />
                  <div>
                      <p className="font-bold">{sub.serviceProvider} renews soon!</p>
                      <p className="text-sm">You will be charged €{sub.amount.toFixed(2)} on {new Date(sub.renewalDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', timeZone: 'UTC'})}.</p>
                  </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        <div className="flex flex-col gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-sm font-medium text-slate-500 mb-2">Next Renewal</h2>
                {nextRenewal ? (
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{nextRenewal.serviceProvider}</p>
                            <p className="text-sm text-slate-500">
                                {new Date(nextRenewal.renewalDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', timeZone: 'UTC'})}
                            </p>
                        </div>
                        <p className="text-3xl font-bold text-lime-600">€{nextRenewal.amount.toFixed(2)}</p>
                    </div>
                ) : (
                    <p className="text-lg text-slate-500 text-center py-4">No upcoming renewals</p>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md flex items-start gap-4">
                    <div className="bg-lime-100 p-3 rounded-full">
                        <EuroIcon className="w-6 h-6 text-lime-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-medium text-slate-500">Total Monthly Cost</h2>
                        <p className="text-3xl font-bold text-slate-800 mt-1">€{totalMonthlyCost.toFixed(2)}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-full">
                        <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-medium text-slate-500">Active Subscriptions</h2>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{activeSubscriptions.length}</p>
                    </div>
                </div>
            </div>
        </div>


        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Your Active Subscriptions</h2>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm font-medium text-slate-600">Sort by:</label>
            <select id="sort" value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}
                className="bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500">
                <option value="renewalDate">Renewal Date</option>
                <option value="serviceProvider">Name</option>
                <option value="amount">Amount</option>
            </select>
          </div>
        </div>
        
        {loading ? (
            <div className="text-center py-10">Loading subscriptions...</div>
        ) : (
            <SubscriptionList 
              subscriptions={sortedActiveSubscriptions} 
              onEdit={openEditModal} 
              onDelete={deleteSubscription}
              onCancel={handleCancelSubscription}
              onRenew={handleRenewSubscription}
            />
        )}

        {/* History Section */}
        <div className="mt-16">
          <div className="flex items-center gap-4 mb-6 border-t border-slate-200 pt-8">
            <ArchiveIcon className="w-8 h-8 text-slate-500" />
            <h2 className="text-2xl font-bold text-slate-800">Subscription History</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md flex items-start gap-4">
                <div className="bg-slate-100 p-3 rounded-full">
                    <EuroIcon className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                    <h2 className="text-sm font-medium text-slate-500">Total Spent (from expired)</h2>
                    <p className="text-3xl font-bold text-slate-800 mt-1">€{globalSpent.toFixed(2)}</p>
                </div>
            </div>
          </div>
          {loading ? (
              <div className="text-center py-10">Loading history...</div>
          ) : groupedExpiredSubscriptions.length > 0 ? (
                <div className="space-y-8">
                    {groupedExpiredSubscriptions.map(([year, subs]) => (
                        <div key={year}>
                            <h3 className="text-xl font-semibold text-slate-700 pb-2 mb-4 border-b border-slate-200">{year}</h3>
                            <div className="space-y-4">
                                {subs.map(sub => (
                                    <HistoryCard
                                        key={sub.id}
                                        subscription={sub}
                                        onEdit={openEditModal}
                                        onDelete={deleteSubscription}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
          ) : (
            <div className="text-center py-10">
                <p className="mt-2 text-slate-500">Your expired or cancelled subscriptions will appear here.</p>
            </div>
          )}
        </div>
      </main>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={subscriptionToEdit ? 'Edit Subscription' : 'Add New Subscription'}
      >
        <SubscriptionForm 
          onSave={handleSave} 
          onClose={closeModal} 
          subscriptionToEdit={subscriptionToEdit} 
        />
      </Modal>

      <HelpModal isOpen={isHelpModalOpen} onClose={closeHelpModal} />
    </div>
  );
};

export default App;
