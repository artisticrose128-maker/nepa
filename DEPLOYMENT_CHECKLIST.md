# Password Reset Deployment Checklist

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Or if you prefer yarn
yarn install
```

### 2. Database Setup
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migration
npx prisma db push

# Verify database schema
npx prisma studio
```

### 3. Email Configuration

#### Option A: AWS SES (Recommended)
```bash
# Set up AWS credentials
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key" 
export AWS_REGION="us-east-1"
export EMAIL_FROM="noreply@nepa.com"
export FRONTEND_URL="https://your-app.com"
```

#### Option B: SMTP
```bash
# Set up SMTP configuration
export SMTP_HOST="smtp.gmail.com"
export SMTP_PORT="587"
export SMTP_USER="your-email@gmail.com"
export SMTP_PASSWORD="your-app-password"
export EMAIL_FROM="noreply@nepa.com"
export FRONTEND_URL="https://your-app.com"
```

### 4. Test the Implementation
```bash
# Set test email
export TEST_EMAIL="your-test-email@example.com"

# Run the test script
npx ts-node tests/test-password-reset.ts
```

### 5. Start the Application
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## ✅ Pre-Deployment Checklist

### Dependencies
- [ ] `nodemailer` installed (for SMTP support)
- [ ] `@aws-sdk/client-ses` installed (for AWS SES support)
- [ ] `@prisma/client` installed and generated
- [ ] All TypeScript dependencies installed

### Database
- [ ] Database is running and accessible
- [ ] `PasswordResetToken` table exists
- [ ] Database migrations applied
- [ ] Prisma client generated

### Configuration
- [ ] Email service configured (AWS SES or SMTP)
- [ ] `EMAIL_FROM` environment variable set
- [ ] `FRONTEND_URL` environment variable set
- [ ] JWT secrets configured
- [ ] Database URL configured

### Security
- [ ] Rate limiting configured for auth endpoints
- [ ] CORS properly configured
- [ ] Environment variables are secure
- [ ] Database connections use SSL
- [ ] Email templates don't contain sensitive information

### Testing
- [ ] Email service connection test passes
- [ ] Password reset request works
- [ ] Token validation works
- [ ] Password reset flow completes successfully
- [ ] Error handling works correctly

## 🔧 Troubleshooting Guide

### Common Issues

#### 1. "Cannot find module 'nodemailer'"
**Solution**: Install missing dependencies
```bash
npm install nodemailer @types/nodemailer
```

#### 2. "Email service not configured"
**Solution**: Check environment variables
```bash
# Verify AWS SES config
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY
echo $AWS_REGION

# Or verify SMTP config
echo $SMTP_HOST
echo $SMTP_PORT
echo $SMTP_USER
```

#### 3. Database errors
**Solution**: Run database migrations
```bash
npx prisma db push
npm run prisma:generate
```

#### 4. AWS SES not sending emails
**Solution**: Verify SES configuration
- Check AWS credentials are valid
- Verify SES is verified for production use
- Check email sending limits
- Verify FROM email is verified in SES

#### 5. SMTP authentication failed
**Solution**: Check SMTP settings
- Verify username and password
- Check if app password is required (Gmail)
- Verify port and security settings
- Check firewall rules

### Debug Mode

Enable debug logging:
```bash
export LOG_LEVEL="debug"
npm run dev
```

### Test Email Service

Run isolated email test:
```bash
npx ts-node -e "
import { emailService } from './services/EmailService';
emailService.testConnection().then(console.log);
"
```

## 📊 Monitoring Setup

### Key Metrics to Monitor
1. Email delivery success rate
2. Password reset request frequency
3. Token validation failures
4. Authentication service errors
5. Database connection health

### Alert Configuration
Set up alerts for:
- Email service failures
- High password reset request rates
- Database connection issues
- Authentication errors

### Log Monitoring
Monitor logs for:
- Email sending failures
- Token validation errors
- Rate limiting triggers
- Security events

## 🔒 Security Review

### Before Production
- [ ] Review email templates for security issues
- [ ] Verify rate limiting is effective
- [ ] Test token expiration logic
- [ ] Verify session invalidation works
- [ ] Test account lockout functionality
- [ ] Review audit logging

### Post-Deployment
- [ ] Monitor for unusual password reset activity
- [ ] Check email delivery rates
- [ ] Verify error rates are low
- [ ] Review security logs

## 📱 Frontend Integration

### Required Frontend Changes
1. **Forgot Password Page**
   - Form to submit email
   - Call `POST /api/v1/auth/forgot-password`
   - Show success message

2. **Reset Password Page**
   - Verify token with `POST /api/v1/auth/verify-reset-token`
   - Form to submit new password
   - Call `POST /api/v1/auth/reset-password`

3. **Error Handling**
   - Handle expired tokens
   - Show appropriate error messages
   - Redirect to login after success

### Example Frontend Code
```javascript
// Request password reset
async function requestPasswordReset(email) {
  const response = await fetch('/api/v1/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return response.json();
}

// Reset password
async function resetPassword(token, newPassword) {
  const response = await fetch('/api/v1/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  });
  return response.json();
}
```

## 🎯 Success Criteria

The password reset implementation is successful when:

1. **Email Delivery**: Users receive password reset emails within 30 seconds
2. **Security**: Tokens expire after 1 hour and can only be used once
3. **User Experience**: Clear instructions and error messages
4. **Reliability**: 99%+ email delivery success rate
5. **Performance**: API responses under 500ms
6. **Monitoring**: All key metrics are being tracked

## 📞 Support

If you encounter issues during deployment:

1. Check the troubleshooting guide above
2. Review the implementation documentation
3. Check application logs for detailed error messages
4. Verify all environment variables are set correctly
5. Test with the provided test script

The password reset functionality is now fully implemented and ready for production deployment!
