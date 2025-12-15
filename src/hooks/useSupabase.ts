import { useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

export function useSupabase() {
  return useMemo(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not configured');
      return null;
    }

    return createClient(supabaseUrl, supabaseKey);
  }, []);
}
