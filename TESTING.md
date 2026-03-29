# Testing Documentation

This document provides comprehensive information about the testing infrastructure and practices implemented for the NEPA application.

## Overview

The NEPA application now includes a robust testing suite covering:
- **Unit Tests**: Jest-based unit testing
- **Integration Tests**: API and service integration testing
- **End-to-End Tests**: Cypress E2E testing for user workflows
- **Visual Regression Tests**: Playwright visual testing for UI consistency
- **Security Testing**: Input sanitization and CSP implementation

## Security Enhancements

### Content Security Policy (CSP)
- **Location**: `src/config/security.ts`
- **Implementation**: Comprehensive CSP with nonce-based script execution
- **Features**:
  - Strict script-src with nonce support
  - Limited connect-src to trusted domains
  - Frame-ancestors protection
  - HSTS implementation
  - Additional security headers

### Input Sanitization
- **Location**: `middleware/inputSanitization.ts`
- **Implementation**: DOMPurify-based sanitization with validation
- **Features**:
  - XSS prevention
  - SQL injection protection
  - Email/phone/URL validation
  - Schema-based validation middleware
  - Automatic request/response sanitization

## Testing Structure

```
tests/
├── unit/                    # Unit tests
├── integration/             # Integration tests
├── e2e/                     # End-to-end tests
│   ├── integration/         # E2E test suites
│   ├── page-objects/        # Page Object Model
│   ├── support/             # Custom commands and utilities
│   └── fixtures/            # Test data
├── visual/                  # Visual regression tests
│   ├── components.spec.ts   # Component visual tests
│   ├── utils/              # Visual testing utilities
│   └── visual.config.ts    # Visual test configuration
└── helpers.ts              # Shared test utilities
```

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm run test:unit

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Integration Tests
```bash
# Run integration tests
npm run test:integration

# Run specific integration test
npm test -- tests/integration/auth.test.ts
```

### End-to-End Tests
```bash
# Run E2E tests (headless)
npm run test:e2e

# Run E2E tests (headed)
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug

# Run Cypress tests
npm run test:cypress

# Open Cypress UI
npm run test:cypress:open
```

### Visual Regression Tests
```bash
# Run visual tests
npm run test:visual

# Update visual snapshots
npm run test:visual:update
```

### All Tests
```bash
# Run all test suites
npm run test

# CI mode (no watch, coverage enabled)
npm run test:ci
```

## Test Configuration

### Jest Configuration
- **File**: `jest.config.js`
- **Features**:
  - TypeScript support
  - Coverage reporting
  - Mock configurations
  - Test environment setup

### Cypress Configuration
- **File**: `cypress.config.js`
- **Features**:
  - Multiple viewport testing
  - Video recording on failure
  - Custom commands
  - Environment-specific settings

### Playwright Configuration
- **File**: `tests/visual/visual.config.ts`
- **Features**:
  - Cross-browser testing
  - Screenshot comparison
  - Responsive design testing
  - Animation disabling for consistency

## Test Coverage

### Security Testing
- ✅ CSP implementation validation
- ✅ Input sanitization verification
- ✅ XSS prevention testing
- ✅ SQL injection protection
- ✅ Authentication security
- ✅ Authorization testing

### Authentication Workflow
- ✅ User registration
- ✅ Login/logout functionality
- ✅ Password reset
- ✅ Two-factor authentication
- ✅ Social authentication
- ✅ Session management

### User Workflows
- ✅ Dashboard navigation
- ✅ Profile management
- ✅ Settings configuration
- ✅ Payment processing
- ✅ Search and filtering
- ✅ Notification handling

### Visual Testing
- ✅ Component rendering
- ✅ Responsive design
- ✅ Theme variations
- ✅ Interactive states
- ✅ Error states
- ✅ Loading states

## Page Object Model

### BasePage
- **Location**: `tests/e2e/page-objects/BasePage.js`
- **Purpose**: Common page interactions and utilities
- **Methods**: Navigation, form handling, assertions, accessibility checks

### LoginPage
- **Location**: `tests/e2e/page-objects/LoginPage.js`
- **Purpose**: Login-specific functionality
- **Methods**: Form submission, validation, social login, 2FA

## Test Data Management

### Fixtures
- **Location**: `tests/e2e/fixtures/`
- **Files**:
  - `user-profile.json`: User profile data
  - `dashboard-data.json`: Dashboard statistics
  - `payment-history.json`: Payment transaction data

### Mock APIs
- Automatic API mocking for consistent test data
- Network error simulation
- Response time testing
- Authentication mocking

## Best Practices

### Test Organization
1. **Descriptive Names**: Use clear, descriptive test names
2. **Arrange-Act-Assert**: Structure tests with AAA pattern
3. **Page Objects**: Use POM for maintainable tests
4. **Custom Commands**: Create reusable custom commands

### Test Data
1. **Isolation**: Each test should be independent
2. **Cleanup**: Clean up test data after each test
3. **Fixtures**: Use fixtures for consistent test data
4. **Environment**: Use environment-specific configurations

### Security Testing
1. **Input Validation**: Test all input validation scenarios
2. **Authentication**: Verify proper authentication flows
3. **Authorization**: Test role-based access control
4. **Data Sanitization**: Verify input sanitization works

### Visual Testing
1. **Consistent Environment**: Use consistent viewport and settings
2. **Animation Control**: Disable animations for stable screenshots
3. **Dynamic Content**: Hide or mock dynamic content
4. **Cross-browser**: Test across multiple browsers

## CI/CD Integration

### GitHub Actions
```yaml
# Example workflow
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run test:ci
      - run: npm run test:e2e
      - run: npm run test:visual
```

### Test Reports
- **Coverage**: Generated in `coverage/` directory
- **Cypress Reports**: HTML reports in `cypress/reports/`
- **Playwright Reports**: HTML reports in `playwright-report/`

## Troubleshooting

### Common Issues

#### Test Timeouts
- Increase timeout in test configuration
- Check for slow-loading elements
- Verify API responses are mocked properly

#### Visual Test Failures
- Update snapshots with `npm run test:visual:update`
- Check for dynamic content affecting screenshots
- Verify consistent test environment

#### E2E Test Flakiness
- Use proper waiting strategies
- Avoid hard-coded waits
- Implement retry logic for network-dependent tests

#### Authentication Issues
- Verify test user credentials
- Check token mocking
- Ensure proper cleanup between tests

### Debugging Tools

#### Cypress Debug
```bash
# Open Cypress in debug mode
npm run test:e2e:debug

# Use browser dev tools
cy.pause()
cy.debug()
```

#### Playwright Debug
```bash
# Run with trace
npx playwright test --trace on

# Debug specific test
npx playwright test --debug
```

#### Jest Debug
```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Performance Considerations

### Test Performance
- **Parallel Execution**: Run tests in parallel where possible
- **Selective Testing**: Run only relevant tests during development
- **Caching**: Cache dependencies and test data
- **Resource Cleanup**: Proper cleanup to prevent memory leaks

### Application Performance
- **Load Testing**: Test application performance under load
- **Memory Testing**: Monitor memory usage during tests
- **Network Testing**: Test slow network conditions
- **Database Testing**: Test database performance

## Security Testing Checklist

### Input Validation
- [ ] All user inputs are sanitized
- [ ] SQL injection protection is active
- [ ] XSS protection is working
- [ ] File upload validation is implemented

### Authentication
- [ ] Password requirements are enforced
- [ ] Session management is secure
- [ ] 2FA is properly implemented
- [ ] Social authentication is secure

### Authorization
- [ ] Role-based access control works
- [ ] Privilege escalation is prevented
- [ ] API endpoints are protected
- [ ] Resource access is properly controlled

### Data Protection
- [ ] Sensitive data is encrypted
- [ ] Data retention policies are followed
- [ ] Privacy controls are implemented
- [ ] Audit logging is active

## Maintenance

### Regular Tasks
1. **Update Dependencies**: Keep testing dependencies updated
2. **Review Coverage**: Maintain test coverage above 80%
3. **Update Snapshots**: Review and update visual snapshots
4. **Clean Up**: Remove obsolete tests and fixtures

### Monitoring
1. **Test Performance**: Monitor test execution times
2. **Flaky Tests**: Identify and fix flaky tests
3. **Coverage Trends**: Track coverage changes over time
4. **Security Updates**: Stay updated on security testing best practices

## Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Cypress Documentation](https://docs.cypress.io/guides/overview/why-cypress)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Page Object Model](https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/)

### Security Resources
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Input Validation Best Practices](https://owasp.org/www-project-cheat-sheets/cheatsheets/Input_Validation_Cheat_Sheet.html)

## Contributing

When adding new tests:
1. Follow the existing test structure
2. Use descriptive test names
3. Include proper assertions
4. Add necessary fixtures
5. Update documentation
6. Ensure tests are not flaky
7. Consider performance implications

For security-related tests:
1. Test all input validation scenarios
2. Verify authentication and authorization
3. Test for common vulnerabilities
4. Include edge cases and error conditions
5. Document security assumptions

---

This testing documentation provides a comprehensive guide for understanding, running, and maintaining the test suite for the NEPA application. Regular updates and maintenance of the testing infrastructure ensure continued code quality and security.
