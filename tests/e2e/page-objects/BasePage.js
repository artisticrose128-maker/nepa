class BasePage {
  constructor() {
    this.elements = {
      // Common elements
      header: '[data-testid="header"]',
      footer: '[data-testid="footer"]',
      navigation: '[data-testid="navigation"]',
      sidebar: '[data-testid="sidebar"]',
      mainContent: '[data-testid="main-content"]',
      
      // User related
      userMenu: '[data-testid="user-menu"]',
      userName: '[data-testid="user-name"]',
      userAvatar: '[data-testid="user-avatar"]',
      logoutBtn: '[data-testid="logout"]',
      
      // Forms
      form: 'form',
      submitBtn: 'button[type="submit"]',
      cancelBtn: 'button[type="button"], .cancel-btn',
      
      // Loading
      loading: '.loading, .spinner, [data-loading="true"]',
      
      // Notifications
      toast: '.toast, .notification, [data-testid="toast"]',
      error: '.error, .error-message, [data-testid="error"]',
      success: '.success, .success-message, [data-testid="success"]',
      
      // Search
      searchInput: '[data-testid="search-input"]',
      searchBtn: '[data-testid="search-btn"]',
      searchResults: '[data-testid="search-results"]',
      
      // Common buttons
      refreshBtn: '[data-testid="refresh-btn"]',
      backBtn: '[data-testid="back-btn"]',
      nextBtn: '[data-testid="next-btn"]',
      saveBtn: '[data-testid="save-btn"]',
      editBtn: '[data-testid="edit-btn"]',
      deleteBtn: '[data-testid="delete-btn"]',
      
      // Modal
      modal: '.modal, [data-testid="modal"]',
      modalClose: '.modal-close, [data-testid="modal-close"]',
      modalConfirm: '.modal-confirm, [data-testid="modal-confirm"]',
      modalCancel: '.modal-cancel, [data-testid="modal-cancel"]'
    };
  }

  // Navigation methods
  visit(path) {
    cy.visit(path);
    return this;
  }

  waitForPageLoad() {
    cy.waitForPageLoad();
    return this;
  }

  // Element interaction methods
  click(element) {
    cy.get(element).click();
    return this;
  }

  type(element, text) {
    cy.get(element).clear().type(text);
    return this;
  }

  select(element, value) {
    cy.get(element).select(value);
    return this;
  }

  check(element) {
    cy.get(element).check();
    return this;
  }

  uncheck(element) {
    cy.get(element).uncheck();
    return this;
  }

  // Visibility methods
  shouldBeVisible(element) {
    cy.get(element).should('be.visible');
    return this;
  }

  shouldNotBeVisible(element) {
    cy.get(element).should('not.be.visible');
    return this;
  }

  shouldExist(element) {
    cy.get(element).should('exist');
    return this;
  }

  shouldNotExist(element) {
    cy.get(element).should('not.exist');
    return this;
  }

  // Text content methods
  shouldContainText(element, text) {
    cy.get(element).should('contain.text', text);
    return this;
  }

  shouldHaveText(element, text) {
    cy.get(element).should('have.text', text);
    return this;
  }

  shouldHaveValue(element, value) {
    cy.get(element).should('have.value', value);
    return this;
  }

  // State methods
  shouldBeEnabled(element) {
    cy.get(element).should('not.be.disabled');
    return this;
  }

  shouldBeDisabled(element) {
    cy.get(element).should('be.disabled');
    return this;
  }

  shouldBeChecked(element) {
    cy.get(element).should('be.checked');
    return this;
  }

  shouldBeUnchecked(element) {
    cy.get(element).should('not.be.checked');
    return this;
  }

  // URL methods
  urlShouldContain(path) {
    cy.urlShouldContain(path);
    return this;
  }

  urlShouldNotContain(path) {
    cy.urlShouldNotContain(path);
    return this;
  }

  // Form methods
  fillForm(formData) {
    cy.fillForm(formData);
    return this;
  }

  submitForm() {
    cy.get(this.elements.submitBtn).click();
    return this;
  }

  // Loading methods
  waitForLoading() {
    cy.waitForLoading();
    return this;
  }

  shouldNotBeLoading() {
    cy.get(this.elements.loading).should('not.exist');
    return this;
  }

  // Toast/notification methods
  checkToast(message, type = 'success') {
    cy.checkToast(message, type);
    return this;
  }

  checkError(message) {
    cy.get(this.elements.error).should('be.visible').should('contain.text', message);
    return this;
  }

  checkSuccess(message) {
    cy.get(this.elements.success).should('be.visible').should('contain.text', message);
    return this;
  }

  // Modal methods
  openModal() {
    cy.get(this.elements.modal).should('be.visible');
    return this;
  }

  closeModal() {
    cy.get(this.elements.modalClose).click();
    cy.get(this.elements.modal).should('not.exist');
    return this;
  }

  confirmModal() {
    cy.get(this.elements.modalConfirm).click();
    return this;
  }

  cancelModal() {
    cy.get(this.elements.modalCancel).click();
    return this;
  }

  // Search methods
  search(query) {
    cy.get(this.elements.searchInput).clear().type(query);
    cy.get(this.elements.searchBtn).click();
    return this;
  }

  shouldHaveSearchResults() {
    cy.get(this.elements.searchResults).should('be.visible');
    return this;
  }

  shouldHaveNoSearchResults() {
    cy.get(this.elements.searchResults).should('not.exist');
    return this;
  }

  // Accessibility methods
  checkAccessibility() {
    cy.checkAccessibility();
    return this;
  }

  // Responsive methods
  checkResponsive(testFunction) {
    cy.checkResponsive(testFunction);
    return this;
  }

  // Utility methods
  wait(ms) {
    cy.wait(ms);
    return this;
  }

  reload() {
    cy.reload();
    return this;
  }

  goBack() {
    cy.go('back');
    return this;
  }

  goForward() {
    cy.go('forward');
    return this;
  }

  // API methods
  waitForApi(alias) {
    cy.waitForApi(alias);
    return this;
  }

  mockApiResponse(method, url, response) {
    cy.intercept(method, url, response).as('mockResponse');
    return this;
  }

  // Authentication methods
  login(email, password) {
    cy.login(email, password);
    return this;
  }

  logout() {
    cy.logout();
    return this;
  }

  mockAuth(userData) {
    cy.mockAuth(userData);
    return this;
  }

  // File upload methods
  uploadFile(selector, fileName) {
    cy.uploadFile(selector, fileName);
    return this;
  }

  // Validation methods
  checkValidationErrors(errors) {
    cy.checkValidationErrors(errors);
    return this;
  }

  // Data-testid helper methods
  getByTestId(testId) {
    return cy.get(`[data-testid="${testId}"]`);
  }

  clickByTestId(testId) {
    cy.clickByTestId(testId);
    return this;
  }

  typeByTestId(testId, text) {
    cy.typeByTestId(testId, text);
    return this;
  }

  // Get element by data-testid
  getElement(testId) {
    return cy.get(`[data-testid="${testId}"]`);
  }

  // Check if element exists by data-testid
  elementExists(testId) {
    return cy.get(`[data-testid="${testId}"]`).should('exist');
  }

  // Check if element is visible by data-testid
  elementVisible(testId) {
    return cy.get(`[data-testid="${testId}"]`).should('be.visible');
  }
}

export default BasePage;
