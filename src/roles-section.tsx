import { HELP_ROLES, LEAD_ROLES, saveWillingness, type HelpRole, type LeadRole } from "./roles";
import { type Person } from "./person";
import { Notice, Section } from "./ui";

function RoleLine({
  label,
  detail,
  active,
  onClick,
}: {
  label: string;
  detail: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-wrap items-baseline gap-x-3 rounded-lg border px-3 py-2 text-left text-sm ${active ? "border-rust bg-rust text-white" : "border-line bg-paper"}`}
    >
      <span className="font-medium">{label}</span>
      <span className={active ? "text-white/80" : "text-muted"}>{detail}</span>
    </button>
  );
}

export function RolesSection({ uid, person }: { uid: string; person: Person | null }) {
  if (!person) {
    return (
      <Section
        title="What you can take on"
        hint="Willingness only. An admin appoints one lead per role."
      >
        <Notice tone="error">Save your details first.</Notice>
      </Section>
    );
  }
  const current = person;

  function toggleLead(role: LeadRole) {
    const leadRoles = current.leadRoles.includes(role)
      ? current.leadRoles.filter((item) => item !== role)
      : [...current.leadRoles, role];
    void saveWillingness(uid, leadRoles, current.helpRoles);
  }

  function toggleHelp(role: HelpRole) {
    const helpRoles = current.helpRoles.includes(role)
      ? current.helpRoles.filter((item) => item !== role)
      : [...current.helpRoles, role];
    void saveWillingness(uid, current.leadRoles, helpRoles);
  }

  return (
    <Section
      title="What you can take on"
      hint="Willingness only. An admin appoints one lead per role."
    >
      <div className="flex flex-col gap-2">
        <p className="font-medium">I could be the lead for</p>
        <div className="flex flex-col gap-2">
          {LEAD_ROLES.map(([role, label, detail]) => (
            <RoleLine
              key={role}
              label={label}
              detail={detail}
              active={current.leadRoles.includes(role)}
              onClick={() => {
                toggleLead(role);
              }}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-medium">I can contribute to</p>
        <div className="flex flex-col gap-2">
          {HELP_ROLES.map(([role, label, detail]) => (
            <RoleLine
              key={role}
              label={label}
              detail={detail}
              active={current.helpRoles.includes(role)}
              onClick={() => {
                toggleHelp(role);
              }}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
