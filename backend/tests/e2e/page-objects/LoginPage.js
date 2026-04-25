import BasePage from './BasePage';

class LoginPage extends BasePage {
  constructor() {
    super();
    this.elements = {
      ...this.elements,
      // Login form elements
      emailInput: 'input[name="email"], input[type="email"]',
      passwordInput: 'input[name="password"], input[type="password"]',
      loginBtn: 'button[type="submit"], .login-btn, button:contains("Login")',
      rememberMeCheckbox: 'input[name="rememberMe"], input[type="checkbox"]',
      forgotPasswordLink: 'a[href*="forgot-password"], .forgot-password-link',
      registerLink: 'a[href*="register"], .register-link',
      
      // Social login elements
      socialLogin: '[data-testid="social-login"]',
      googleLoginBtn: '[data-testid="login-google"], .google-login',
      githubLoginBtn: '[data-testid="login-github"], .github-login',
      
      // 2FA elements
      twoFactorInput: '[data-testid="2fa-code"], input[name="twoFactorCode"]',
      twoFactorVerifyBtn: '[data-testid="verify-2fa-login"], .verify-2fa-btn',
      
      // Error elements
      emailError: '.email-error, [data-testid="email-error"]',
      passwordError: '.password-error, [data-testid="password-error"]',
      generalError: '.login-error, [data-testid="login-error"]',
      
      // Loading elements
      loginLoading: '.login-loading, [data-testid="login-loading"]',
      
      // Form validation
      validationErrors: '.validation-error, .error-message'
    };
  }

  // Visit login page
  visit() {
    cy.visit('/login');
    this.waitForPageLoad();
    return this;
  }

  // Fill login form
  fillLoginForm(email, password, rememberMe = false) {
    this.type(this.elements.emailInput, email);
    this.type(this.elements.passwordInput, password);
    
    if (rememberMe) {
      this.check(this.elements.rememberMeCheckbox);
    }
    
    return this;
  }

  // Submit login form
  submitLogin() {
    this.click(this.elements.loginBtn);
    return this;
  }

  // Complete login process
  login(email, password, rememberMe = false) {
    this.fillLoginForm(email, password, rememberMe);
    this.submitLogin();
    return this;
  }

  // Login with test credentials
  loginWithTestCredentials() {
    const testUser = Cypress.env('testUser');
    return this.login(testUser.email, testUser.password);
  }

  // Click forgot password
  clickForgotPassword() {
    this.click(this.elements.forgotPasswordLink);
    return this;
  }

  // Click register link
  clickRegister() {
    this.click(this.elements.registerLink);
    return this;
  }

  // Social login methods
  loginWithGoogle() {
    this.click(this.elements.googleLoginBtn);
    return this;
  }

  loginWithGithub() {
    this.click(this.elements.githubLoginBtn);
    return this;
  }

  // 2FA methods
  enterTwoFactorCode(code) {
    this.type(this.elements.twoFactorInput, code);
    return this;
  }

  verifyTwoFactor() {
    this.click(this.elements.twoFactorVerifyBtn);
    return this;
  }

  // Complete 2FA login
  completeTwoFactorLogin(code) {
    this.enterTwoFactorCode(code);
    this.verifyTwoFactor();
    return this;
  }

  // Validation methods
  shouldShowEmailError(message) {
    this.shouldContainText(this.elements.emailError, message);
    return this;
  }

  shouldShowPasswordError(message) {
    this.shouldContainText(this.elements.passwordError, message);
    return this;
  }

  shouldShowLoginError(message) {
    this.shouldContainText(this.elements.generalError, message);
    return this;
  }

  shouldShowValidationError(message) {
    this.shouldContainText(this.elements.validationErrors, message);
    return this;
  }

  shouldShowMultipleValidationErrors(errors) {
    errors.forEach(error => {
      this.shouldShowValidationError(error);
    });
    return this;
  }

  // State checking methods
  shouldBeOnLoginPage() {
    this.urlShouldContain('/login');
    return this;
  }

  shouldNotBeOnLoginPage() {
    this.urlShouldNotContain('/login');
    return this;
  }

  shouldShowLoginForm() {
    this.shouldBeVisible(this.elements.emailInput);
    this.shouldBeVisible(this.elements.passwordInput);
    this.shouldBeVisible(this.elements.loginBtn);
    return this;
  }

  shouldShowTwoFactorForm() {
    this.shouldBeVisible(this.elements.twoFactorInput);
    this.shouldBeVisible(this.elements.twoFactorVerifyBtn);
    return this;
  }

  shouldShowSocialLoginOptions() {
    this.shouldBeVisible(this.elements.socialLogin);
    this.shouldBeVisible(this.elements.googleLoginBtn);
    this.shouldBeVisible(this.elements.githubLoginBtn);
    return this;
  }

  shouldShowForgotPasswordLink() {
    this.shouldBeVisible(this.elements.forgotPasswordLink);
    return this;
  }

  shouldShowRegisterLink() {
    this.shouldBeVisible(this.elements.registerLink);
    return this;
  }

  // Loading states
  shouldShowLoginLoading() {
    this.shouldBeVisible(this.elements.loginLoading);
    this.shouldBeDisabled(this.elements.loginBtn);
    return this;
  }

  shouldNotShowLoginLoading() {
    this.shouldNotBeVisible(this.elements.loginLoading);
    this.shouldBeEnabled(this.elements.loginBtn);
    return this;
  }

  // Form validation states
  shouldRequireEmail() {
    this.click(this.elements.loginBtn);
    this.shouldShowEmailError('Email is required');
    return this;
  }

  shouldRequirePassword() {
    this.click(this.elements.loginBtn);
    this.shouldShowPasswordError('Password is required');
    return this;
  }

  shouldValidateEmailFormat() {
    this.type(this.elements.emailInput, 'invalid-email');
    this.click(this.elements.loginBtn);
    this.shouldShowEmailError('Please enter a valid email');
    return this;
  }

  // Authentication state checking
  shouldBeLoggedIn() {
    this.shouldNotBeOnLoginPage();
    this.shouldBeVisible(this.elements.userMenu);
    this.shouldBeVisible(this.elements.userName);
    return this;
  }

  shouldBeLoggedOut() {
    this.shouldBeOnLoginPage();
    this.shouldNotBeVisible(this.elements.userMenu);
    return this;
  }

  // Error handling
  shouldHandleInvalidCredentials() {
    this.login('invalid@example.com', 'wrongpassword');
    this.shouldShowLoginError('Invalid credentials');
    this.shouldBeOnLoginPage();
    return this;
  }

  shouldHandleNetworkError() {
    // Mock network error
    cy.intercept('POST', '/api/auth/login', { forceNetworkError: true });
    
    this.loginWithTestCredentials();
    this.shouldShowLoginError('Network error');
    return this;
  }

  // Accessibility methods
  checkLoginPageAccessibility() {
    this.checkAccessibility();
    
    // Specific accessibility checks for login form
    cy.get(this.elements.emailInput).should('have.attr', 'aria-label').or('have.attr', 'placeholder');
    cy.get(this.elements.passwordInput).should('have.attr', 'aria-label').or('have.attr', 'placeholder');
    cy.get(this.elements.loginBtn).should('have.attr', 'type', 'submit');
    
    return this;
  }

  // Responsive design
  checkResponsiveDesign() {
    this.checkResponsive(() => {
      this.shouldShowLoginForm();
      
      // Check mobile-specific elements
      if (Cypress.config('viewportWidth') < 768) {
        // Mobile-specific checks
        cy.get(this.elements.emailInput).should('be.visible');
        cy.get(this.elements.passwordInput).should('be.visible');
      } else {
        // Desktop-specific checks
        cy.get(this.elements.socialLogin).should('be.visible');
      }
    });
    
    return this;
  }

  // Security checks
  shouldHaveSecurePasswordInput() {
    cy.get(this.elements.passwordInput).should('have.attr', 'type', 'password');
    return this;
  }

  shouldHaveProperFormAttributes() {
    cy.get('form').should('have.attr', 'method', 'post');
    cy.get(this.elements.loginBtn).should('have.attr', 'type', 'submit');
    return this;
  }

  // Performance checks
  shouldLoadQuickly() {
    const startTime = Date.now();
    this.visit();
    this.shouldShowLoginForm();
    
    cy.then(() => {
      const loadTime = Date.now() - startTime;
      expect(loadTime).to.be.lessThan(3000); // Should load in less than 3 seconds
    });
    
    return this;
  }
}

export default LoginPage;
