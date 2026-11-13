import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ⚠️ ВСТАВЬТЕ СВОИ ДАННЫЕ ИЗ ПРОЕКТА SUPABASE
const SUPABASE_URL = 'https://qnwctsuqbtpspmbtdall.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3AdK8vNSlfcnJBPH_sxYZQ_sRx6fJ_s';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);