import { emailService } from '../services/EmailService';

/**
 * Test script to verify email service functionality
 * Run this script to test if email configuration is working properly
 */

async function testEmailService() {
  console.log('🧪 Testing Email Service...\n');

  // Test 1: Check if email service is configured
  console.log('1. Checking email service configuration...');
  const isConfigured = emailService.isConfigured();
  console.log(`   Configured: ${isConfigured ? '✅ Yes' : '❌ No'}`);

  if (!isConfigured) {
    console.log('\n❌ Email service is not configured. Please set up email environment variables:');
    console.log('   - For AWS SES: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION');
    console.log('   - For SMTP: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD');
    console.log('   - Common: EMAIL_FROM (optional, defaults to noreply@nepa.com)');
    return;
  }

  // Test 2: Test email connection
  console.log('\n2. Testing email connection...');
  const connectionTest = await emailService.testConnection();
  console.log(`   Connection: ${connectionTest.success ? '✅ Success' : '❌ Failed'}`);
  if (connectionTest.error) {
    console.log(`   Error: ${connectionTest.error}`);
  }

  // Test 3: Send test password reset email
  console.log('\n3. Sending test password reset email...');
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';
  const testToken = 'test-reset-token-123456789';
  
  const emailResult = await emailService.sendPasswordResetEmail(
    testEmail,
    testToken,
    'Test User'
  );
  
  console.log(`   Send result: ${emailResult.success ? '✅ Success' : '❌ Failed'}`);
  if ((emailResult as any).messageId) {
    console.log(`   Message ID: ${(emailResult as any).messageId}`);
  }
  if (emailResult.error) {
    console.log(`   Error: ${emailResult.error}`);
  }

  console.log('\n🎉 Email service test completed!');
}

async function testPasswordResetFlow() {
  console.log('\n🔐 Testing Password Reset Flow...\n');

  try {
    // Import authentication service
    const { AuthenticationService } = await import('../services/AuthenticationService');
    const authService = new AuthenticationService();

    const testEmail = process.env.TEST_EMAIL || 'test@example.com';

    // Test 1: Request password reset
    console.log('1. Testing password reset request...');
    const resetRequest = await authService.requestPasswordReset(testEmail);
    console.log(`   Request: ${resetRequest.success ? '✅ Success' : '❌ Failed'}`);
    if (resetRequest.error) {
      console.log(`   Error: ${resetRequest.error}`);
    }

    // Test 2: Verify token (this would fail with test token, but shows the method works)
    console.log('\n2. Testing token verification...');
    const tokenVerification = await authService.verifyResetToken('invalid-token');
    console.log(`   Verification: ${tokenVerification.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`   Valid token: ${tokenVerification.valid ? '✅ Yes' : '❌ No'}`);
    if (tokenVerification.error) {
      console.log(`   Error: ${tokenVerification.error}`);
    }

    console.log('\n🎉 Password reset flow test completed!');
  } catch (error) {
    console.error('❌ Error testing password reset flow:', error);
  }
}

// Run tests
async function runTests() {
  await testEmailService();
  await testPasswordResetFlow();
  
  console.log('\n📋 Test Summary:');
  console.log('- If email service is configured, password reset emails should now work');
  console.log('- The password reset endpoints are available at:');
  console.log('  POST /api/v1/auth/forgot-password');
  console.log('  POST /api/v1/auth/reset-password');
  console.log('  POST /api/v1/auth/verify-reset-token');
  console.log('\n- Make sure to run database migrations to create the PasswordResetToken table');
  console.log('- Configure your email service (AWS SES or SMTP) in the environment variables');
}

// Check if this script is run directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { testEmailService, testPasswordResetFlow };
