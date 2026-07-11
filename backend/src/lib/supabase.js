const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase environment variables.\n' +
    'Ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in your .env file.'
  );
}

// Create the client for the backend
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = { supabase };
