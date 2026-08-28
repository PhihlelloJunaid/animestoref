import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "animestore-auth";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const signIn = (credentials) => {
    const nextUser = {
      name: credentials.name || credentials.email.split("@")[0],
      email: credentials.email,
      role: credentials.role || "customer",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const signUp = (details) => {
    signIn({ ...details, role: "customer" });
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, signIn, signUp, signOut }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
