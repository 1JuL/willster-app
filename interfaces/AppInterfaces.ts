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

export interface Notebook {
  id: string;
  title: string;
  createdAt?: string;

}

export interface CameraOCRProps {
  onTextExtracted?: (text: string) => void;
  onImageSelected?: (imageUrl: string) => void;
  characterImageSource?: any;
}

export interface Props {
  visible: boolean;
  notebooks: Notebook[];
  isSaving: boolean;
  onSelect: (id: string, title: string) => void;
  onClose: () => void;
}

export interface Note {
  id: string;
  title: string;
  content: string;
}
export interface GameInfo {
  type: "quiz" | "hangman" | "memory";
  title: string;
  icon: string;
  score: number;
}