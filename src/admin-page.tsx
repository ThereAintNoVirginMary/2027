import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { appointLead, clearLead } from "./admin";
import { parseAccommodation, type Accommodation } from "./accommodations";
import { db } from "./firebase";
import { parsePerson, type Person } from "./person";
import { LEAD_ROLES, isLeadRole, leadLabel, type LeadRole } from "./roles";
import { Section } from "./ui";

type RosterRow = Person & { uid: string };

export function AdminPage() {
  const [people, setPeople] = useState<RosterRow[]>([]);
  const [places, setPlaces] = useState<Accommodation[]>([]);
  const [leads, setLeads] = useState<Partial<Record<LeadRole, string>>>({});

  useEffect(() => {
    const unsubs = [
      onSnapshot(collection(db, "people"), (snap) => {
        setPeople(
          snap.docs.map((item) => {
            const raw: unknown = item.data();
            const email =
              typeof raw === "object" &&
              raw !== null &&
              "email" in raw &&
              typeof raw.email === "string"
                ? raw.email
                : "";
            return { uid: item.id, ...parsePerson(raw, email) };
          }),
        );
      }),
      onSnapshot(collection(db, "accommodations"), (snap) => {
        setPlaces(
          snap.docs.flatMap((item) => {
            const parsed = parseAccommodation(item.id, item.data());
            return parsed ? [parsed] : [];
          }),
        );
      }),
      onSnapshot(collection(db, "leads"), (snap) => {
        const next: Partial<Record<LeadRole, string>> = {};
        for (const item of snap.docs) {
          if (!isLeadRole(item.id)) continue;
          const raw: unknown = item.data();
          const uid =
            typeof raw === "object" && raw !== null && "uid" in raw && typeof raw.uid === "string"
              ? raw.uid
              : "";
          if (uid !== "") next[item.id] = uid;
        }
        setLeads(next);
      }),
    ];
    return () => {
      for (const unsub of unsubs) unsub();
    };
  }, []);

  const unticketed = people.filter((person) => !person.hasTicket).length;

  return (
    <div className="flex flex-col gap-10">
      <Section
        title="Roster"
        hint="Visible to admins. Members see names for the occupant list, not phone numbers."
      >
        <p className="text-sm text-muted">
          {people.length} people · {unticketed} without a ticket
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Ticket</th>
                <th className="py-2 pr-4 font-medium">Sleeping in</th>
                <th className="py-2 pr-4 font-medium">Early</th>
                <th className="py-2 font-medium">Late</th>
              </tr>
            </thead>
            <tbody>
              {people.map((person) => {
                const bed = places.find((place) => place.occupantUids.includes(person.uid));
                return (
                  <tr key={person.uid} className="border-t border-line">
                    <td className="py-2 pr-4">{person.legalName}</td>
                    <td className="py-2 pr-4">{person.hasTicket ? "Yes" : "No"}</td>
                    <td className="py-2 pr-4">{bed?.label ?? "—"}</td>
                    <td className="py-2 pr-4">{person.earlyBuild ? "Yes" : "No"}</td>
                    <td className="py-2">{person.lateTeardown ? "Yes" : "No"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
      <Section
        title="Appointed leads"
        hint="One person per role. Anyone registered can be chosen. Volunteers for that role are green."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {LEAD_ROLES.map(([role]) => (
            <LeadChoice
              key={role}
              role={role}
              label={leadLabel(role)}
              people={people}
              current={leads[role] ?? ""}
              onChange={(uid) => {
                if (uid === "") void clearLead(role);
                else void appointLead(role, uid);
              }}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}

function LeadChoice({
  role,
  label,
  people,
  current,
  onChange,
}: {
  role: LeadRole;
  label: string;
  people: RosterRow[];
  current: string;
  onChange: (uid: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const chosen = people.find((person) => person.uid === current);
  const ordered = [...people].sort((a, b) => a.legalName.localeCompare(b.legalName));

  return (
    <div className="relative flex flex-col gap-1.5 text-sm font-medium text-muted">
      {label}
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
            const volunteered = person.leadRoles.includes(role);
            return (
              <li key={person.uid}>
                <button
                  type="button"
                  className={`block w-full px-3 py-2 text-left text-base font-normal ${volunteered ? "bg-sage text-white" : "text-ink"}`}
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
