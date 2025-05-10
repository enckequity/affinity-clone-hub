
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
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    // Parse request body
    const requestData = await req.json();
    const { priceId, planName } = requestData;
    
    if (!priceId) {
      const errorMsg = "Price ID is required";
      logStep("Validation error", { message: errorMsg });
      return new Response(JSON.stringify({ error: errorMsg }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    logStep("Request data", { priceId, planName });

    // Create a Supabase client using the anon key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      const errorMsg = "STRIPE_SECRET_KEY is not set";
      logStep("Configuration error", { message: errorMsg });
      return new Response(JSON.stringify({ error: errorMsg }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
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

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      // Create a new customer
      try {
        const newCustomer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id
          }
        });
        customerId = newCustomer.id;
        logStep("Created new customer", { customerId });
      } catch (err) {
        const errorMsg = `Error creating Stripe customer: ${err instanceof Error ? err.message : String(err)}`;
        logStep("Stripe API error", { message: errorMsg });
        return new Response(JSON.stringify({ error: errorMsg }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
    }

    // Create checkout session
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${req.headers.get("origin")}/settings?tab=billing&status=success`,
        cancel_url: `${req.headers.get("origin")}/settings?tab=billing&status=canceled`,
        subscription_data: {
          metadata: {
            userId: user.id,
            planName: planName || 'Unknown'
          }
        }
      });

      logStep("Created checkout session", { sessionId: session.id, url: session.url });

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (err) {
      // This catches errors like invalid price ID
      const errorMsg = err instanceof Error ? err.message : String(err);
      logStep("Stripe checkout error", { message: errorMsg });
      return new Response(JSON.stringify({ error: errorMsg }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
