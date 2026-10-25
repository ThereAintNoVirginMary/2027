import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CampApp } from "./app";
import { AuthScreen, VerifyScreen } from "./auth-screen";
import { useAuthUser } from "./auth";
import "./styles.css";

function Root() {
  const user = useAuthUser();
  if (user === undefined) return <p className="px-4 py-10 text-muted">Loading…</p>;
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
