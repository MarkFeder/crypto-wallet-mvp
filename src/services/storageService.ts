import { STORAGE_KEYS } from '../constants/config';
import { User } from '../types';

/**
 * Centralized storage service for managing localStorage operations
 */
class StorageService {
  /**
   * Get auth token from storage
   */
  getAuthToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error reading auth token from storage:', error);
      return null;
    }
  }

  /**
   * Set auth token in storage
   */
  setAuthToken(token: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error saving auth token to storage:', error);
    }
  }

  /**
   * Remove auth token from storage
   */
  removeAuthToken(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error removing auth token from storage:', error);
    }
  }

  /**
   * Get user data from storage
   */
  getUser(): User | null {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error reading user from storage:', error);
      return null;
    }
  }

  /**
   * Set user data in storage
   */
  setUser(user: User): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  }

  /**
   * Remove user data from storage
   */
  removeUser(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error('Error removing user from storage:', error);
    }
  }

  /**
   * Clear all auth-related data from storage
   */
  clearAuth(): void {
    this.removeAuthToken();
    this.removeUser();
  }

  /**
   * Clear all storage
   */
  clearAll(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

export const storageService = new StorageService();
