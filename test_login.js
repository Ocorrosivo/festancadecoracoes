import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://pzqrqsqggvawbbhgpbbx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cXJxc3FnZ3Zhd2JiaGdwYmJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxOTU5NDcsImV4cCI6MjEwMTc3MTk0N30.6Kxjo9TZPTBBuM41tDSvc_diIwy4SVqYW3rvv7IBj0U";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'festanca.decoracoes@outlook.com',
    password: 'Baudasorte123@'
  });
  
  if (error) {
    console.error("Login failed:", error.message);
  } else {
    console.log("Login successful! Token:", data.session.access_token.substring(0, 20) + "...");
  }
}

testLogin();
