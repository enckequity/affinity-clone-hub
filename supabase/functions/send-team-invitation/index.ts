
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get invitation details from request body
    const { invitationId, email, role, message } = await req.json();
    
    if (!invitationId || !email) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: invitationId and email are required'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase client with service role key (needed for authentication operations)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get the invitation details from the database
    const { data: invitation, error: invitationError } = await supabase
      .from('team_invitations')
      .select(`
        id, 
        email, 
        role, 
        organization_id,
        organization:organizations!inner(name),
        inviter:profiles!inner(
          first_name, 
          last_name, 
          user:auth.users!inner(email)
        )
      `)
      .eq('id', invitationId)
      .single();

    if (invitationError || !invitation) {
      console.error('Error fetching invitation:', invitationError);
      return new Response(
        JSON.stringify({ error: 'Could not find invitation' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate a signup URL with invitation token
    const signUpURL = `${Deno.env.get('PUBLIC_SITE_URL') || supabaseUrl}/register?invitation=${invitationId}`;
    
    // In a real implementation, you would send an email here
    // For now, we'll just log the details and return success
    console.log(`
      Invitation sent:
      - From: ${invitation.inviter.first_name} ${invitation.inviter.last_name} (${invitation.inviter.user.email})
      - To: ${email}
      - Organization: ${invitation.organization.name}
      - Role: ${role}
      - Signup URL: ${signUpURL}
      - Message: ${message || "No message included"}
    `);

    // Here you would integrate with an email service like SendGrid, AWS SES, etc.
    // For example with SendGrid:
    // const emailData = {
    //   to: email,
    //   from: 'noreply@yourdomain.com',
    //   subject: `Join ${invitation.organization.name} on CapitalMCRM`,
    //   text: `You've been invited to join ${invitation.organization.name} as a ${role}. Click here to accept: ${signUpURL}`,
    //   html: `<p>You've been invited to join ${invitation.organization.name} as a ${role}.</p><p><a href="${signUpURL}">Click here to accept</a></p>`,
    // };
    // await sendEmail(emailData);

    // Update the invitation with sent information
    await supabase
      .from('team_invitations')
      .update({
        last_sent_at: new Date().toISOString(),
        status: 'sent'
      })
      .eq('id', invitationId);

    return new Response(
      JSON.stringify({ success: true, message: 'Invitation sent successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing invitation:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      }
    );
  }
});
