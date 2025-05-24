import { User } from "firebase/auth";
import { ReactNode } from "react";

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}


