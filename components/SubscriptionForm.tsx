import React, { useState, useEffect } from 'react';
import type { Subscription, BillingCycle } from '../types';

interface SubscriptionFormProps {
  onSave: (subscription: Omit<Subscription, 'id'> | Subscription) => void;
  onClose: () => void;
  subscriptionToEdit?: Subscription | null;
}

const InputField: React.FC<{label: string, id: string, error?: string, children: React.ReactNode}> = ({label, id, error, children}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ onSave, onClose, subscriptionToEdit }) => {
  const [serviceProvider, setServiceProvider] = useState('');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [details, setDetails] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (subscriptionToEdit) {
      setServiceProvider(subscriptionToEdit.serviceProvider);
      setAmount(String(subscriptionToEdit.amount));
      setStartDate(subscriptionToEdit.startDate);
      setRenewalDate(subscriptionToEdit.renewalDate);
      setBillingCycle(subscriptionToEdit.billingCycle);
      setDetails(subscriptionToEdit.details);
    } else {
      // Set default start date to today and clear other fields
      const today = new Date().toISOString().split('T')[0];
      setServiceProvider('');
      setAmount('');
      setStartDate(today);
      setRenewalDate('');
      setBillingCycle('monthly');
      setDetails('');
    }
  }, [subscriptionToEdit]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!serviceProvider.trim()) newErrors.serviceProvider = 'Service provider is required';
    if (!amount || isNaN(Number(amount.replace(',', '.'))) || Number(amount.replace(',', '.')) < 0) newErrors.amount = 'Enter a valid amount';
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!renewalDate) newErrors.renewalDate = 'Renewal date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    const subscriptionData = {
      serviceProvider,
      amount: parseFloat(amount.replace(',', '.')),
      startDate,
      renewalDate,
      billingCycle,
      details,
    };
    
    if (subscriptionToEdit) {
      onSave({ ...subscriptionData, id: subscriptionToEdit.id });
    } else {
      onSave(subscriptionData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField label="Service Provider" id="serviceProvider" error={errors.serviceProvider}>
        <input type="text" id="serviceProvider" value={serviceProvider} onChange={(e) => setServiceProvider(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500" />
      </InputField>

      <div className="grid grid-cols-2 gap-4">
        <InputField label="Amount (€)" id="amount" error={errors.amount}>
          <input type="text" inputMode="decimal" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500" />
        </InputField>

        <InputField label="Billing Cycle" id="billingCycle">
          <select id="billingCycle" value={billingCycle} onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 bg-white">
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="one-time">One-time</option>
          </select>
        </InputField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InputField label="Start Date" id="startDate" error={errors.startDate}>
          <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500" />
        </InputField>
        <InputField label="Renewal Date" id="renewalDate" error={errors.renewalDate}>
          <input type="date" id="renewalDate" value={renewalDate} onChange={(e) => setRenewalDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500" />
        </InputField>
      </div>

      <InputField label="Details (Optional)" id="details">
        <textarea id="details" value={details} onChange={(e) => setDetails(e.target.value)} rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"></textarea>
      </InputField>

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onClose}
          className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 font-semibold transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="px-4 py-2 bg-lime-600 text-white rounded-md hover:bg-lime-700 font-semibold transition-colors shadow-sm">
          {subscriptionToEdit ? 'Update' : 'Save'} Subscription
        </button>
      </div>
    </form>
  );
};

export default SubscriptionForm;