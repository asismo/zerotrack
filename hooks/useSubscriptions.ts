
import { useState, useEffect, useCallback } from 'react';
import type { Subscription } from '../types';

const STORAGE_KEY = 'subscriptions';

const FAKE_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'fake-1',
    serviceProvider: 'Netflix',
    amount: 15.49,
    billingCycle: 'monthly',
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
    renewalDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0], // Renews in 2 days
    details: 'Premium plan for 4K streaming.'
  },
  {
    id: 'fake-2',
    serviceProvider: 'Spotify',
    amount: 9.99,
    billingCycle: 'monthly',
    startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0],
    renewalDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split('T')[0], // Renews in 15 days
    details: 'Family plan.'
  },
  {
    id: 'fake-3',
    serviceProvider: 'Adobe Creative Cloud',
    amount: 599.88,
    billingCycle: 'yearly',
    startDate: '2023-01-20',
    renewalDate: new Date(new Date().setDate(new Date().getDate() + 45)).toISOString().split('T')[0], // Renews in 45 days
    details: 'All apps subscription for work.'
  },
    {
    id: 'fake-4',
    serviceProvider: 'Disney+',
    amount: 139.99,
    billingCycle: 'yearly',
    startDate: '2022-12-01',
    renewalDate: '2023-12-01', // Expired in 2023
    details: 'Yearly subscription for movies.'
  },
  {
    id: 'fake-5',
    serviceProvider: 'Amazon Prime',
    amount: 14.99,
    billingCycle: 'monthly',
    startDate: '2023-08-10',
    renewalDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString().split('T')[0], // Expired 5 days ago (this year)
    details: 'Includes Prime Video and fast shipping.'
  },
   {
    id: 'fake-6',
    serviceProvider: 'Microsoft 365',
    amount: 99.99,
    billingCycle: 'yearly',
    startDate: '2021-11-15',
    renewalDate: '2022-11-15', // Expired in 2022
    details: 'Family plan with Office apps.'
  },
  {
    id: 'fake-7',
    serviceProvider: 'Canva Pro',
    amount: 119.40,
    billingCycle: 'yearly',
    startDate: '2022-03-01',
    renewalDate: '2023-03-01', // Expired in 2023
    details: 'Design tool for marketing materials.'
  }
];

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedSubscriptions = localStorage.getItem(STORAGE_KEY);
      if (storedSubscriptions) {
        setSubscriptions(JSON.parse(storedSubscriptions));
      } else {
        // If no subscriptions are stored, load fake data for demo
        localStorage.setItem(STORAGE_KEY, JSON.stringify(FAKE_SUBSCRIPTIONS));
        setSubscriptions(FAKE_SUBSCRIPTIONS);
      }
    } catch (error) {
      console.error("Failed to load subscriptions from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSubscriptions = useCallback((subs: Subscription[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
      setSubscriptions(subs);
    } catch (error) {
      console.error("Failed to save subscriptions to localStorage", error);
    }
  }, []);

  const addSubscription = useCallback((subscription: Omit<Subscription, 'id'>) => {
    const newSubscription: Subscription = { ...subscription, id: generateId() };
    const updatedSubscriptions = [...subscriptions, newSubscription];
    saveSubscriptions(updatedSubscriptions);
  }, [subscriptions, saveSubscriptions]);

  const updateSubscription = useCallback((updatedSub: Subscription) => {
    const updatedSubscriptions = subscriptions.map(sub => 
      sub.id === updatedSub.id ? updatedSub : sub
    );
    saveSubscriptions(updatedSubscriptions);
  }, [subscriptions, saveSubscriptions]);

  const deleteSubscription = useCallback((id: string) => {
    const updatedSubscriptions = subscriptions.filter(sub => sub.id !== id);
    saveSubscriptions(updatedSubscriptions);
  }, [subscriptions, saveSubscriptions]);

  return { subscriptions, addSubscription, updateSubscription, deleteSubscription, loading };
};