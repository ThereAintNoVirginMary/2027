import { type ReactNode } from "react";

export function vehiclePassMark(
  needsPass: boolean,
  hasPass: boolean,
): { ok: boolean; label: string } {
  if (!needsPass) return { ok: true, label: "no vehicle pass needed" };
  if (hasPass) return { ok: true, label: "has vehicle pass" };
  return { ok: false, label: "no vehicle pass yet" };
}

export function PassCard({
  needsPass,
  hasPass,
  children,
}: {
  needsPass: boolean;
  hasPass: boolean;
  children: ReactNode;
}) {
  const mark = vehiclePassMark(needsPass, hasPass);
  const tone = mark.ok ? "border-sage bg-sage/10" : "border-danger bg-danger/10";
  const labelTone = mark.ok ? "bg-sage" : "bg-danger";
  return (
    <li className={`relative rounded-lg border px-4 py-3 pb-10 ${tone}`}>
      {children}
      <span
        className={`absolute right-3 bottom-3 rounded-full px-2 py-0.5 text-xs font-medium text-white ${labelTone}`}
      >
        {mark.label}
      </span>
    </li>
  );
}
