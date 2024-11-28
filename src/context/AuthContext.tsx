// context/AuthContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/router";

interface User {
  email: string;
  role: string;
  id: string;
}

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profileImage?: File | null;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const { msg, at, rt, role, id } = await res.json();
      setUser({ email, role, id });
      router.push("/");
    } else {
      throw new Error("Invalid credentials");
    }
  };

  const signup = async (data: SignupData) => {
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);

      if (data.role) {
        formData.append("role", data.role)
      }

      if (data.profileImage) {
        formData.append("profileImage", data.profileImage);
      }

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        router.push("/login"); // Redirect to login after signup
      } else {
        const error = await res.json();
        throw new Error(error.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      throw error; // Ensure errors propagate to the UI
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  };

  useEffect(() => {
    // Auto-login user if token is valid
    const initializeUser = async () => {
      try {
        const res = await fetch("/api/auth/refresh", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setUser({ email: data.email, role: data.role });
        }
      } catch (error) {
        console.error("Auto-login failed:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  if (loading) {
    //TODO: CHANGE ALL LOADING TEXTS TO BE LOADING SPINNERS 
    <div className="flex justify-center items-center">
      <div className="loading loading-ring loading-lg"></div>
    </div>
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

