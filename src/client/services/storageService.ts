import { STORAGE_KEYS } from '../../common/constants/config';
import { User } from '../../common/types';

/**
 * Centralized storage service for managing localStorage operations
 * Note: Auth tokens are now handled via HttpOnly cookies for security
 */
class StorageService {
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
   * Check if user is authenticated (has stored user data)
   */
  isAuthenticated(): boolean {
    return !!this.getUser();
  }
}

export const storageService = new StorageService();
