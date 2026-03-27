import { Router } from 'express';
import { AuthenticationController } from '../../controllers/v1/AuthenticationController';
import { ApiResponseMiddleware } from '../../middleware/ApiResponseMiddleware';
import { ApiVersioning } from '../../middleware/ApiVersioning';
import { RequestValidation } from '../../middleware/RequestValidation';
import { RateLimiting } from '../../middleware/RateLimiting';

const router = Router();
const authController = new AuthenticationController();

// Apply API versioning middleware
router.use(ApiVersioning.versionMiddleware);

// Apply response middleware
router.use(ApiResponseMiddleware.attachHelpers);

// Apply rate limiting
router.use('/register', RateLimiting.RateLimiters.auth);
router.use('/login', RateLimiting.RateLimiters.auth);
router.use('/wallet', RateLimiting.RateLimiters.auth);
router.use('/refresh', RateLimiting.RateLimiters.auth);
router.use('/forgot-password', RateLimiting.RateLimiters.auth);
router.use('/reset-password', RateLimiting.RateLimiters.auth);
router.use('/verify-reset-token', RateLimiting.RateLimiters.auth);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Creates a new user account with email verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Authenticate user
 *     description: Authenticates a user and returns JWT tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/wallet:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Authenticate with wallet
 *     description: Authenticates a user using wallet address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [walletAddress]
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 pattern: '^0x[a-fA-F0-9]{40}$'
 *                 description: Ethereum wallet address
 *     responses:
 *       200:
 *         description: Wallet authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Invalid wallet address
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/wallet', authController.loginWithWallet);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh JWT token
 *     description: Refreshes an expired JWT token using a refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/refresh', authController.refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout user
 *     description: Invalidates the user JWT token
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current user profile
 *     description: Retrieves the authenticated user profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/me', authController.getProfile);

/**
 * @swagger
 * /auth/2fa/enable:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Enable two-factor authentication
 *     description: Enables two-factor authentication for the user
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [method]
 *             properties:
 *               method:
 *                 type: string
 *                 enum: [totp, sms, email]
 *                 description: Two-factor authentication method
 *     responses:
 *       200:
 *         description: Two-factor authentication enabled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid method or 2FA setup failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/2fa/enable', authController.enableTwoFactor);

/**
 * @swagger
 * /auth/2fa/verify:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify two-factor authentication
 *     description: Verifies a two-factor authentication code
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: Object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *                 length: 6
 *                 description: Two-factor authentication code
 *     responses:
 *       200:
 *         description: Two-factor authentication verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/2fa/verify', authController.verifyTwoFactor);

/**
 * @swagger
 * /auth/2fa/disable:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Disable two-factor authentication
 *     description: Disables two-factor authentication for the user
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: Object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User password for verification
 *     responses:
 *       200:
 *         description: Two-factor authentication disabled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/2fa/disable', authController.disableTwoFactor);

/**
 * @swagger
 * /auth/methods:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get authentication methods
 *     description: Retrieves available authentication methods for the user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Authentication methods retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/methods', authController.getAuthMethods);

/**
 * @swagger
 * /auth/check-email:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Check email availability
 *     description: Checks if an email address is available for registration
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *         required: true
 *         description: Email address to check
 *     responses:
 *       200:
 *         description: Email availability status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid email format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/check-email', authController.checkEmailAvailability);

/**
 * @swagger
 * /auth/check-username:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Check username availability
 *     description: Checks if a username is available for registration
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *           minLength: 3
 *           maxLength: 30
 *           pattern: '^[a-zA-Z0-9]+$'
 *         required: true
 *         description: Username to check
 *     responses:
 *       200:
 *         description: Username availability status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid username format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/check-username', authController.checkUsernameAvailability);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Request password reset
 *     description: Sends a password reset link to the user's email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *     responses:
 *       200:
 *         description: Password reset email sent (always returns success for security)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Reset password with token
 *     description: Resets user password using a valid reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token from email
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]'
 *                 description: New password (must contain uppercase, lowercase, number, and special character)
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid token or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @swagger
 * /auth/verify-reset-token:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify password reset token
 *     description: Checks if a password reset token is valid and not expired
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token to verify
 *     responses:
 *       200:
 *         description: Token verification result
 * /auth/token-status:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get token status and expiration information
 *     description: Retrieves the current status of the authentication token including expiration warnings
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 valid:
 *                   type: boolean
 *                 email:
 *                   type: string
 *                   description: User's email (only if token is valid)
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       429:
 *         description: Rate limit exceeded
 *                 valid:
 *                   type: boolean
 *                   description: Whether the token is valid
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *                   description: Token expiration time
 *                 timeUntilExpiry:
 *                   type: number
 *                   description: Time until token expires in milliseconds
 *                 warningLevel:
 *                   type: string
 *                   enum: [none, warning, critical, expired]
 *                   description: Warning level for token expiration
 *                 message:
 *                   type: string
 *                   description: User-friendly message about token status
 *                 actionRequired:
 *                   type: boolean
 *                   description: Whether immediate action is required
 *       401:
 *         description: Token expired or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/verify-reset-token', authController.verifyResetToken);
router.get('/token-status', authController.getTokenStatus);

export default router;
