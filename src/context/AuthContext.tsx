import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  google_id: string;
  email: string;
  name: string;
  avatar: string;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'SUSPENDED';
  created_at: string;
  last_active: string;
  has_permanent_access: boolean;
  active_code_masked?: string;
  preferences?: {
    platform?: string;
    experience?: string;
    favorite_product?: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isLocked: boolean;
  loginWithKey: (key: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  activateAccessCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updatePreferences: (prefs: { platform?: string; experience?: string; favorite_product?: string }) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('givemepod_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSession = async (currentToken: string | null) => {
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('givemepod_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Session check failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession(token);
  }, []);

  const refreshSession = async () => {
    await fetchSession(token);
  };

  // Login exclusively using the secret access key (A3F9K2L8Z1, etc.)
  const loginWithKey = async (key: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanKey = key.trim().toUpperCase().replace(/[\s-]/g, '');
      const res = await fetch('/api/auth/login-with-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: cleanKey,
          name: name?.trim() || undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('givemepod_token', data.token);
        return { success: true };
      }

      return {
        success: false,
        error: data.error || 'Invalid or unrecognized Secret Access Key.'
      };
    } catch (err) {
      console.error('Key login failed', err);
      return { success: false, error: 'Connection error during authentication.' };
    }
  };

  const activateAccessCode = async (code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/access-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || user?.id || ''}`
        },
        body: JSON.stringify({ code })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to activate code.' };
    } catch (err: any) {
      return { success: false, error: 'Network error activating access code.' };
    }
  };

  const updatePreferences = async (prefs: { platform?: string; experience?: string; favorite_product?: string }) => {
    if (!user) return;
    try {
      const res = await fetch('/api/auth/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || user.id}`
        },
        body: JSON.stringify(prefs)
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => prev ? { ...prev, preferences: data.preferences } : null);
      }
    } catch (err) {
      console.error('Failed to update preferences', err);
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token || ''}` }
      });
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('givemepod_token');
    setToken(null);
    setUser(null);
  };

  const isLocked = Boolean(user && !user.has_permanent_access && user.role !== 'ADMIN');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isLocked,
        loginWithKey,
        activateAccessCode,
        signOut,
        updatePreferences,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
