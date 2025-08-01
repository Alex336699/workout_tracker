import { createClient } from "@supabase/supabase-js";

// Replace these with your actual Supabase project details
const supabaseUrl = "https://pctqvywkiziniytwuxkj.supabase.co"; // Replace with your Supabase URL
const supabaseKey = "sb_publishable_eIIg-2rhe1j1Bf4bspesGg_Rm03IHRY"; // Replace with your Supabase Anon Key

export const supabase = createClient(supabaseUrl, supabaseKey);
