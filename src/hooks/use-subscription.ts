
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    isLoading: true,
    error: null,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setStatus(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) {
        console.error('Error checking subscription:', error);
        setStatus(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to check subscription status',
        }));
        return;
      }

      setStatus({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || null,
        subscription_end: data.subscription_end || null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error('Subscription check error:', err);
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'An unknown error occurred',
      }));
    }
  }, [user]);

  const createCheckout = useCallback(async (priceId: string, planName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, planName },
      });

      if (error) {
        toast({
          title: 'Checkout Error',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      toast({
        title: 'Checkout Error',
        description: err instanceof Error ? err.message : 'Failed to create checkout session',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const openCustomerPortal = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        toast({
          title: 'Portal Error',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Error opening customer portal:', err);
      toast({
        title: 'Portal Error',
        description: err instanceof Error ? err.message : 'Failed to open customer portal',
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user, checkSubscription]);

  return {
    status,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
};
