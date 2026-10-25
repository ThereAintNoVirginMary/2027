import { type SubmitEvent, useState } from "react";
import {
  authErrorMessage,
  createAccount,
  logOut,
  reloadUser,
  resendVerification,
  sendReset,
  signIn,
} from "./auth";
import { Field, Notice, PrimaryButton, QuietButton, inputClass } from "./ui";
import { type User } from "firebase/auth";

type Mode = "sign-in" | "create" | "reset";

export function AuthScreen() {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setPending(true);
    try {
      if (mode === "sign-in") await signIn(email, password);
      else if (mode === "create") {
        await createAccount(email, password);
        setMessage("Check your email and confirm the address, then come back.");
      } else {
        await sendReset(email);
        setMessage("Password reset sent.");
      }
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  const title =
    mode === "sign-in" ? "Sign in" : mode === "create" ? "Create an account" : "Reset password";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold">There Ain't No Virgin Mary</h1>
        <p className="mt-1 text-muted">2027 camp registration</p>
      </div>
      <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Field label="Email">
          <input
            className={inputClass}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            required
          />
        </Field>
        {mode !== "reset" && (
          <Field label="Password">
            <input
              className={inputClass}
              type="password"
              autoComplete={mode === "create" ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              required
              minLength={6}
            />
          </Field>
        )}
        {error && <Notice tone="error">{error}</Notice>}
        {message && <Notice tone="ok">{message}</Notice>}
        <PrimaryButton type="submit" disabled={pending}>
          {pending ? "Working…" : title}
        </PrimaryButton>
      </form>
      <div className="flex gap-4">
        {mode !== "sign-in" && (
          <QuietButton
            onClick={() => {
              setMode("sign-in");
            }}
          >
            Sign in
          </QuietButton>
        )}
        {mode !== "create" && (
          <QuietButton
            onClick={() => {
              setMode("create");
            }}
          >
            Create an account
          </QuietButton>
        )}
        {mode !== "reset" && (
          <QuietButton
            onClick={() => {
              setMode("reset");
            }}
          >
            Forgot password
          </QuietButton>
        )}
      </div>
    </main>
  );
}

export function VerifyScreen({ user }: { user: User }) {
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">Confirm your email</h1>
      <p className="text-muted">
        A confirmation link was sent to {user.email}. Camp details stay closed until that link is
        opened.
      </p>
      {note && <Notice tone="ok">{note}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex gap-3">
        <PrimaryButton
          onClick={() => {
            void resendVerification(user)
              .then(() => {
                setNote("Sent again.");
              })
              .catch((caught: unknown) => {
                setError(authErrorMessage(caught));
              });
          }}
        >
          Send again
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            void reloadUser(user).then((verified) => {
              if (!verified) setError("That address is not confirmed yet.");
            });
          }}
        >
          I have confirmed it
        </PrimaryButton>
      </div>
      <QuietButton
        onClick={() => {
          void logOut();
        }}
      >
        Sign out
      </QuietButton>
    </main>
  );
}
