import { useEffect, useRef, useState } from "react";
import type { AppointedRole, LeadRole } from "./roles";

type LeadPerson = {
  uid: string;
  legalName: string;
  leadRoles: readonly LeadRole[];
};

export function LeadChoice({
  role,
  label,
  detail = "",
  shaded = true,
  people,
  current,
  onChange,
}: {
  role: AppointedRole;
  label: string;
  detail?: string;
  shaded?: boolean;
  people: readonly LeadPerson[];
  current: string;
  onChange: (uid: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const chosen = people.find((person) => person.uid === current);
  const ordered = [...people].sort((a, b) => a.legalName.localeCompare(b.legalName));

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && root.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
    };
  }, [open]);

  return (
    <div ref={root} className="relative flex flex-col gap-1.5 text-sm font-medium text-muted">
      {label}
      {detail !== "" && <span className="font-normal">{detail}</span>}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
        }}
        className="rounded-lg border border-line bg-paper px-3 py-3 text-left text-base font-normal text-ink"
      >
        {chosen?.legalName || "Choose a lead"}
      </button>
      {open && (
        <ul className="absolute top-full z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-line bg-paper">
          <li>
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-base font-normal text-ink"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Choose a lead
            </button>
          </li>
          {ordered.map((person) => {
            const volunteered = shaded && person.leadRoles.includes(role as LeadRole);
            return (
              <li key={person.uid}>
                <button
                  type="button"
                  className={`block w-full px-3 py-2 text-left text-base font-normal text-ink ${shaded ? (volunteered ? "bg-sage/20" : "bg-danger/20") : ""}`}
                  onClick={() => {
                    onChange(person.uid);
                    setOpen(false);
                  }}
                >
                  {person.legalName || "Registered"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
