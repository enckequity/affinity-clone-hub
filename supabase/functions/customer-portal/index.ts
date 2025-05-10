
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      const errorMsg = "STRIPE_SECRET_KEY is not set";
      logStep("Configuration error", { message: errorMsg });
      return new Response(JSON.stringify({ error: errorMsg }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      const errorMsg = "No authorization header provided";
      logStep("Authentication error", { message: errorMsg });
      return new Response(JSON.stringify({ error: errorMsg }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      const errorMsg = `Authentication error: ${userError.message}`;
      logStep("Authentication error", { message: errorMsg });
      return new Response(JSON.stringify({ error: errorMsg }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    const user = userData.user;
    if (!user?.email) {
      const errorMsg = "User not authenticated or email not available";
      logStep("Authentication error", { message: errorMsg });
      return new Response(JSON.stringify({ error: errorMsg }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get subscriber data from database
    const { data: subscriberData, error: subscriberError } = await supabaseClient
      .from("subscribers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (subscriberError && subscriberError.code !== 'PGRST116') { // Not found is ok
      const errorMsg = `Database error: ${subscriberError.message}`;
      logStep("Database error", { message: errorMsg });
      return new Response(JSON.stringify({ error: errorMsg }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    let customerId;
    
    if (subscriberData?.stripe_customer_id) {
      customerId = subscriberData.stripe_customer_id;
      logStep("Found customer ID from subscribers table", { customerId });
    } else {
      // If not in subscribers table, check Stripe directly
      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      
      if (customers.data.length === 0) {
        const errorMsg = "No Stripe customer found for this user. Please subscribe to a plan first.";
        logStep("Customer not found", { message: errorMsg });
        return new Response(JSON.stringify({ error: errorMsg }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        });
      }
      
      customerId = customers.data[0].id;
      logStep("Found Stripe customer", { customerId });
      
      // Update the subscribers table with the customer ID
      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: customerId,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      logStep("Updated subscribers table with customer ID");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const origin = req.headers.get("origin") || "http://localhost:3000";
    
    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${origin}/settings?tab=billing`,
      });
      
      logStep("Customer portal session created", { sessionId: portalSession.id, url: portalSession.url });

      return new Response(JSON.stringify({ url: portalSession.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (err) {
      // Handle common error where customer portal is not configured in Stripe dashboard
      let errorMsg = err instanceof Error ? err.message : String(err);
      let advice = '';
      
      if (errorMsg.includes('No configuration provided')) {
        advice = ' You need to set up your customer portal in the Stripe dashboard first: https://dashboard.stripe.com/settings/billing/portal';
      }
      
      logStep("ERROR in customer-portal", { message: errorMsg });
      
      return new Response(JSON.stringify({ error: errorMsg + advice }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in customer-portal", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
