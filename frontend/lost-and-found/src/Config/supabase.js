import { createClient } from '@supabase/supabase-js'; 
 
const supabaseUrl = 'https://cpdnlzklihdxvdpfhtrq.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZG5semtsaWhkeHZkcGZodHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNTEzNjgsImV4cCI6MjA3NjgyNzM2OH0.LCwSfDHmSHWevx4CmvrCgn7z0z84Rsqhhs_sk5pZUIs'; 
export const supabase = createClient(supabaseUrl, supabaseKey); 
