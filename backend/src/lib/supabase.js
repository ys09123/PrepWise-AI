const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Create the client for the backend
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = { supabase };

