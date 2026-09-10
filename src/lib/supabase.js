import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import 'expo-sqlite/localStorage/install';

const supabaseUrl = 'https://qansdfyosecfhzewtnvk.supabase.co';
const supabasePublishableKey = 'sb_publishable_FixDGQL-y_2pcR-33XlJcg_8DE_5yqs';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});