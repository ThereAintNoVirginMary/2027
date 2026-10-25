import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./firebase";

export function useAuthUser(): User | null | undefined {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  return user;
}

export async function signIn(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function createAccount(email: string, password: string): Promise<void> {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await sendEmailVerification(credential.user);
}

export async function sendReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function resendVerification(user: User): Promise<void> {
  await sendEmailVerification(user);
}

export async function reloadUser(user: User): Promise<boolean> {
  await user.reload();
  return user.emailVerified;
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

export function authErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  if (code === "auth/email-already-in-use") return "An account with that email already exists.";
  if (code === "auth/invalid-email") return "Enter a valid email.";
  if (code === "auth/weak-password") return "Use at least 6 characters.";
  if (code === "auth/too-many-requests") return "Too many attempts. Wait a moment and try again.";
  if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password" ||
    code === "auth/user-not-found"
  ) {
    return "That email and password do not match.";
  }
  return "Something went wrong. Try again.";
}
