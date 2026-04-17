import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co'; // Replace with actual URL
const supabaseKey = 'your-anon-key'; // Replace with actual key

export const supabase = createClient(supabaseUrl, supabaseKey);