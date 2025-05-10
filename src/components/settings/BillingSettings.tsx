
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { PlusCircle, CheckCircle, Loader2, RefreshCw, AlertCircle, CreditCard as CreditCardIcon } from "lucide-react";
import { format } from 'date-fns';
import { useSubscription, SubscriptionStatus } from '@/hooks/use-subscription';

// Define the price IDs for each plan
const PLAN_PRICE_IDS = {
  basic: 'price_1RN0uSH5uTyBP7nHvxZowhIu', 
  professional: 'price_1RN0upH5uTyBP7nHVwGiuEy1', 
  enterprise: 'price_1RN0v3H5uTyBP7nHLSUpOLyO'
};

export function BillingSettings() {
  const { status, checkSubscription, createCheckout, openCustomerPortal } = useSubscription();
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleCheckoutBasic = () => {
    createCheckout(PLAN_PRICE_IDS.basic, 'Basic');
  };

  const handleCheckoutProfessional = () => {
    createCheckout(PLAN_PRICE_IDS.professional, 'Professional');
  };

  const handleCheckoutEnterprise = () => {
    createCheckout(PLAN_PRICE_IDS.enterprise, 'Enterprise');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>
            Manage your subscription and billing information
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={checkSubscription}
            disabled={status.isLoading}
          >
            {status.isLoading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Refresh
          </Button>
          {status.subscribed && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={openCustomerPortal}
            >
              Manage Subscription
            </Button>
          )}
        </div>
      </CardHeader>
      
      {status.error && (
        <CardContent>
          <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error checking subscription status</p>
              <p className="text-sm mt-1">{status.error}</p>
              <p className="text-sm mt-2">Make sure your Stripe integration is properly configured and that valid price IDs are used.</p>
            </div>
          </div>
        </CardContent>
      )}
      
      <CardContent className="space-y-4">
        {status.isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p>Checking subscription status...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PricingCard 
              title="Basic" 
              description="For individuals"
              price="$9"
              period="user / month"
              yearlyPrice="$108 / year"
              features={[
                "Basic CRM features",
                "100 contacts",
                "Basic reporting"
              ]}
              isCurrentPlan={status.subscription_tier === 'Basic'}
              onAction={status.subscription_tier === 'Basic' ? openCustomerPortal : handleCheckoutBasic}
              actionText={status.subscription_tier === 'Basic' ? 'Manage Plan' : status.subscribed ? 'Switch to Basic' : 'Subscribe'}
              actionVariant={status.subscription_tier === 'Basic' ? 'outline' : 'default'}
            />
            
            <PricingCard 
              title="Professional" 
              description="For growing teams"
              price="$29"
              period="user / month"
              yearlyPrice="$348 / year"
              features={[
                "Unlimited contacts",
                "Advanced reporting",
                "Email integration"
              ]}
              isCurrentPlan={status.subscription_tier === 'Professional'}
              onAction={status.subscription_tier === 'Professional' ? openCustomerPortal : handleCheckoutProfessional}
              actionText={status.subscription_tier === 'Professional' ? 'Manage Plan' : status.subscribed ? 'Switch to Professional' : 'Subscribe'}
              actionVariant={status.subscription_tier === 'Professional' ? 'outline' : 'default'}
            />
            
            <PricingCard 
              title="Enterprise" 
              description="For large organizations"
              price="$89"
              period="user / month"
              yearlyPrice="$1,068 / year"
              features={[
                "All Professional features",
                "Advanced security",
                "Dedicated support"
              ]}
              isCurrentPlan={status.subscription_tier === 'Enterprise'}
              onAction={status.subscription_tier === 'Enterprise' ? openCustomerPortal : handleCheckoutEnterprise}
              actionText={status.subscription_tier === 'Enterprise' ? 'Manage Plan' : status.subscribed ? 'Switch to Enterprise' : 'Subscribe'}
              actionVariant={status.subscription_tier === 'Enterprise' ? 'outline' : 'default'}
            />
          </div>
        )}
        
        {status.subscribed && (
          <>
            <div className="mt-4 p-4 bg-primary/10 rounded-md">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Active Subscription</h3>
                  <p className="text-sm text-muted-foreground">
                    You are currently subscribed to the {status.subscription_tier} plan.
                    {status.subscription_end && (
                      <> Your subscription renews on {formatDate(status.subscription_end)}.</>
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            <Separator />
          </>
        )}
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Payment Information</h3>
          <div className="flex justify-between items-center p-4 border rounded-md">
            <div className="flex items-center gap-3">
              <CreditCardIcon className="h-10 w-10 p-2 bg-muted rounded-md" />
              <div>
                <p className="font-medium">Add payment method</p>
                <p className="text-sm text-muted-foreground">Add a credit card or other payment method</p>
              </div>
            </div>
            <Button variant="outline" onClick={openCustomerPortal}>Manage Payment</Button>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-2">Billing History</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {status.subscribed ? (
                <TableRow>
                  <TableCell>{formatDate(status.subscription_end ? new Date(new Date(status.subscription_end).getTime() - (365 * 24 * 60 * 60 * 1000)).toISOString() : null)}</TableCell>
                  <TableCell>{status.subscription_tier} Plan (Annual)</TableCell>
                  <TableCell>
                    {status.subscription_tier === 'Basic' && '$108.00'}
                    {status.subscription_tier === 'Professional' && '$348.00'}
                    {status.subscription_tier === 'Enterprise' && '$1,068.00'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="link" size="sm" className="h-auto p-0" onClick={openCustomerPortal}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    No billing history available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

interface PricingCardProps {
  title: string;
  description: string;
  price: string;
  period: string;
  yearlyPrice: string;
  features: string[];
  isCurrentPlan: boolean;
  onAction: () => void;
  actionText: string;
  actionVariant: "default" | "outline";
}

function PricingCard({ 
  title, 
  description, 
  price, 
  period, 
  yearlyPrice, 
  features, 
  isCurrentPlan, 
  onAction, 
  actionText,
  actionVariant 
}: PricingCardProps) {
  return (
    <Card className={`border-2 ${isCurrentPlan ? 'border-primary' : ''}`}>
      <CardHeader className="pb-2 relative">
        {isCurrentPlan && (
          <Badge className="absolute top-2 right-2">Current Plan</Badge>
        )}
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-1">{price}<span className="text-sm text-muted-foreground font-normal"> / {period}</span></div>
        <p className="text-sm text-muted-foreground mb-4">
          Billed annually ({yearlyPrice})
        </p>
        <ul className="space-y-2 text-sm">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <PlusCircle className="h-4 w-4 mr-2 text-green-500" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          variant={actionVariant} 
          onClick={onAction}
        >
          {actionText}
        </Button>
      </CardFooter>
    </Card>
  );
}
