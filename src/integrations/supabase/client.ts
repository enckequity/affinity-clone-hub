// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nvxeceukxkyqnqztnkep.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52eGVjZXVreGt5cW5xenRua2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NzA1NTksImV4cCI6MjA2MjA0NjU1OX0.J825UwwJsWIzwGae1XCjtd6_yNmWoB-4JPXVS61MMpY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);