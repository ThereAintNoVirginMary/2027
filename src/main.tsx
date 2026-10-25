import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CampApp } from "./app";
import { AuthScreen, VerifyScreen } from "./auth-screen";
import { useAuthUser, useVerifiedToken } from "./auth";
import "./styles.css";

function Root() {
  const user = useAuthUser();
  const tokenReady = useVerifiedToken(user);
  if (user === undefined || (user?.emailVerified === true && !tokenReady)) {
    return <p className="px-4 py-10 text-muted">Loading…</p>;
  }
  if (user === null) return <AuthScreen />;
  if (!user.emailVerified) return <VerifyScreen user={user} />;
  return <CampApp user={user} />;
}

const root = document.getElementById("app");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <Root />
    </StrictMode>,
  );
}
