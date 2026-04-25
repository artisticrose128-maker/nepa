import { signInWithFreighter, isConnected, signTransaction } from "@stellar/freighter-api";

export interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  walletAddress?: string;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username?: string;
  name?: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  requiresTwoFactor?: boolean;
  twoFactorMethods?: string[];
  error?: string;
}

class AuthService {
  private baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
  private token: string | null = null;
  private refreshTokenValue: string | null = null;
  private tokenExpiryTimer: NodeJS.Timeout | null = null;
  private warningShown: { warning: boolean; critical: boolean } = { warning: false, critical: false };

  constructor() {
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage() {
    this.token = localStorage.getItem('authToken');
    this.refreshTokenValue = localStorage.getItem('refreshToken');
  }

  private saveTokensToStorage(token: string, refreshToken: string) {
    this.token = token;
    this.refreshTokenValue = refreshToken;
    localStorage.setItem('authToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    this.startTokenMonitoring();
  }

  private clearTokensFromStorage() {
    this.token = null;
    this.refreshTokenValue = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    this.stopTokenMonitoring();
    this.warningShown = { warning: false, critical: false };
  }

  private startTokenMonitoring() {
    this.stopTokenMonitoring();
    this.warningShown = { warning: false, critical: false };
    
    if (this.token) {
      this.checkTokenStatus();
      // Check token status every 30 seconds
      this.tokenExpiryTimer = setInterval(() => {
        this.checkTokenStatus();
      }, 30000);
    }
  }

  private stopTokenMonitoring() {
    if (this.tokenExpiryTimer) {
      clearInterval(this.tokenExpiryTimer);
      this.tokenExpiryTimer = null;
    }
  }

  private async checkTokenStatus() {
    if (!this.token) return;

    try {
      const response = await fetch(`${this.baseURL}/v1/auth/token-status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const status = await response.json();
        this.handleTokenStatus(status.data);
      } else if (response.status === 401) {
        // Token expired, try to refresh
        await this.handleTokenExpired();
      }
    } catch (error) {
      console.error('Token status check failed:', error);
    }
  }

  private handleTokenStatus(status: any) {
    const { warningLevel, message, actionRequired } = status;
    
    if (warningLevel === 'critical' && !this.warningShown.critical) {
      this.warningShown.critical = true;
      this.showTokenExpiryNotification(message, 'critical', actionRequired);
    } else if (warningLevel === 'warning' && !this.warningShown.warning) {
      this.warningShown.warning = true;
      this.showTokenExpiryNotification(message, 'warning', actionRequired);
    }
  }

  private showTokenExpiryNotification(message: string, level: 'warning' | 'critical', actionRequired: boolean) {
    // Create a custom notification event
    const event = new CustomEvent('tokenExpiry', {
      detail: { message, level, actionRequired }
    });
    window.dispatchEvent(event);

    // Also use browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Session Expiration Warning', {
        body: message,
        icon: level === 'critical' ? '/warning-icon.png' : '/info-icon.png',
        tag: 'token-expiry'
      });
    }
  }

  private async handleTokenExpired() {
    this.stopTokenMonitoring();
    
    if (this.refreshTokenValue) {
      try {
        const refreshResult = await this.refreshToken();
        if (!refreshResult.success) {
          this.showSessionExpiredNotification();
        }
      } catch (error) {
        this.showSessionExpiredNotification();
      }
    } else {
      this.showSessionExpiredNotification();
    }
  }

  private showSessionExpiredNotification() {
    const event = new CustomEvent('sessionExpired', {
      detail: { message: 'Your session has expired. Please log in again.' }
    });
    window.dispatchEvent(event);

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Session Expired', {
        body: 'Your session has expired. Please log in again.',
        icon: '/error-icon.png',
        tag: 'session-expired'
      });
    }
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Registration failed' };
      }

      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.requiresTwoFactor) {
          return {
            success: false,
            requiresTwoFactor: true,
            twoFactorMethods: result.twoFactorMethods,
            error: result.error
          };
        }
        return { success: false, error: result.error || 'Login failed' };
      }

      if (result.token && result.refreshToken) {
        this.saveTokensToStorage(result.token, result.refreshToken);
      }

      return {
        success: true,
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken
      };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async loginWithWallet(): Promise<AuthResponse> {
    try {
      if (!(await isConnected())) {
        return { success: false, error: 'Please install Freighter Wallet' };
      }

      const publicKey = await signInWithFreighter();

      const response = await this.request('/auth/wallet', {
        method: 'POST',
        body: JSON.stringify({ walletAddress: publicKey }),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Wallet login failed' };
      }

      if (result.token && result.refreshToken) {
        this.saveTokensToStorage(result.token, result.refreshToken);
      }

      return {
        success: true,
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken
      };
    } catch (error) {
      return { success: false, error: 'Wallet connection failed' };
    }
  }

  async logout(): Promise<boolean> {
    try {
      if (this.token) {
        await this.request('/auth/logout', {
          method: 'POST',
        });
      }

      this.clearTokensFromStorage();
      return true;
    } catch (error) {
      return false;
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    if (!this.refreshTokenValue) {
      return { success: false, error: 'No refresh token' };
    }

    try {
      const response = await this.request('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshTokenValue }),
      });

      const result = await response.json();

      if (!response.ok) {
        this.clearTokensFromStorage();
        return { success: false, error: result.error || 'Token refresh failed' };
      }

      if (result.token && result.refreshToken) {
        this.saveTokensToStorage(result.token, result.refreshToken);
      }

      return {
        success: true,
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken
      };
    } catch (error) {
      this.clearTokensFromStorage();
      return { success: false, error: 'Network error' };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) {
      return null;
    }

    try {
      const response = await this.request('/user/profile');

      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshResult = await this.refreshToken();
        if (refreshResult.success) {
          // Retry with new token
          const retryResponse = await this.request('/user/profile');
          if (retryResponse.ok) {
            const result = await retryResponse.json();
            return result.user;
          }
        }
        this.clearTokensFromStorage();
        return null;
      }

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      return result.user;
    } catch (error) {
      return null;
    }
  }

  async updateProfile(data: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await this.request('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Profile update failed' };
      }

      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.request('/user/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Password change failed' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async enableTwoFactor(method: string): Promise<{ success: boolean; secret?: string; qrCode?: string; backupCodes?: string[]; error?: string }> {
    try {
      const response = await this.request('/user/2fa/enable', {
        method: 'POST',
        body: JSON.stringify({ method }),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || '2FA enable failed' };
      }

      return {
        success: true,
        secret: result.secret,
        qrCode: result.qrCode,
        backupCodes: result.backupCodes
      };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  getAuthHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }
}

export const authService = new AuthService();
