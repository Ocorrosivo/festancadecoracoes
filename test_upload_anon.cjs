const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://pzqrqsqggvawbbhgpbbx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cXJxc3FnZ3Zhd2JiaGdwYmJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxOTU5NDcsImV4cCI6MjEwMTc3MTk0N30.6Kxjo9TZPTBBuM41tDSvc_diIwy4SVqYW3rvv7IBj0U";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function runTest() {
  console.log("Signing up test user...");
  const testEmail = `test_${Date.now()}@gmail.com`;
  const testPassword = 'password123';

  // Using anon key to sign up. If email confirmation is required, this might fail to return a session immediately.
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (signUpError) {
    console.error("Failed to sign up user:", signUpError);
    return;
  }
  
  let token = null;
  if (signUpData.session) {
      token = signUpData.session.access_token;
  } else {
      console.log("No session returned. Trying to sign in...");
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
      if (signInError) {
          console.error("Failed to sign in:", signInError);
          return;
      }
      token = signInData.session.access_token;
  }

  console.log("Got token. Preparing upload...");
  
  // Create a dummy image
  const imageBuffer = Buffer.from('dummy image data');
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  
  let body = '';
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="file"; filename="test.jpg"\r\n`;
  body += `Content-Type: image/jpeg\r\n\r\n`;
  body += imageBuffer.toString('binary') + '\r\n';
  
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="admin_token"\r\n\r\n`;
  body += `${token}\r\n`;
  
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="bucket"\r\n\r\n`;
  body += `festanca-storage\r\n`;
  
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="folder"\r\n\r\n`;
  body += `produtos\r\n`;
  body += `--${boundary}--\r\n`;

  console.log("Calling Edge Function...");
  const response = await fetch(`${SUPABASE_URL}/functions/v1/upload-product-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    body: Buffer.from(body, 'binary')
  });

  const responseText = await response.text();
  console.log(`Status: ${response.status}`);
  console.log(`Response: ${responseText}`);
}

runTest();
