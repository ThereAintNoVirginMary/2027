import { type ReactNode } from "react";

export function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted">{hint}</p>
      </div>
      {children}
    </section>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-muted">
      {label}
      {children}
    </label>
  );
}

export const inputClass =
  "rounded-lg border border-line bg-paper px-3 py-3 text-base font-normal text-ink outline-none focus:border-rust";

export function Notice({ tone, children }: { tone: "ok" | "error"; children: ReactNode }) {
  return <p className={tone === "ok" ? "text-sm text-sage" : "text-sm text-danger"}>{children}</p>;
}

export function PrimaryButton({
  children,
  disabled,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="rounded-full bg-rust px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function QuietButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-sm font-medium text-muted">
      {children}
    </button>
  );
}

export function SoleRepresentative({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 text-sm">
      <input
        type="checkbox"
        className="mt-0.5"
        checked={checked}
        onChange={(event) => {
          onChange(event.target.checked);
        }}
      />
      I am the sole representative for some accommodations/vehicles and no one else will list them
    </label>
  );
}

export function ToggleRow({
  title,
  hint,
  checked,
  onChange,
}: {
  title: string;
  hint: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => {
          onChange(!checked);
        }}
        className={`relative h-7 w-12 shrink-0 rounded-full ${checked ? "bg-rust" : "bg-line"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-paper transition-transform ${checked ? "translate-x-5" : ""}`}
        />
      </button>
    </div>
  );
}
