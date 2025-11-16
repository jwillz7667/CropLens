import { createClient } from '@supabase/supabase-js';
import type { Database } from './database-types';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Supabase credentials missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

export const supabase = createClient<Database>(SUPABASE_URL ?? '', SUPABASE_SERVICE_ROLE_KEY ?? '', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const fieldsTable = () => supabase.from('fields');
export const analysesTable = () => supabase.from('analyses');
export const insightsTable = () => supabase.from('insights');
export const integrationsTable = () => supabase.from('integrations');
