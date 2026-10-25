import { useState } from "react";
import { personError, savePerson, type Person } from "./person";
import { Field, Notice, PrimaryButton, Section, ToggleRow, inputClass } from "./ui";

export function PersonSection({
  uid,
  email,
  person,
}: {
  uid: string;
  email: string;
  person: Person | null;
}) {
  const [draft, setDraft] = useState<Person>(
    person ?? {
      legalName: "",
      email,
      whatsapp: "",
      emergencyName: "",
      emergencyPhone: "",
      hasTicket: false,
      earlyBuild: false,
      lateTeardown: false,
      leadRoles: [],
      helpRoles: [],
      admin: false,
    },
  );
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update(patch: Partial<Person>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  async function save() {
    setError(null);
    setNote(null);
    const next = { ...draft, email, admin: person?.admin ?? false };
    const problem = personError(next);
    if (problem) {
      setError(problem);
      return;
    }
    try {
      await savePerson(uid, next);
      setNote("Saved");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save.");
    }
  }

  return (
    <Section
      title="You"
      hint="Legal name and how to reach you. Email is the login and stays fixed."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Legal name">
          <input
            className={inputClass}
            value={draft.legalName}
            onChange={(event) => {
              update({ legalName: event.target.value });
            }}
          />
        </Field>
        <Field label="Email">
          <input className={inputClass} value={email} disabled />
        </Field>
        <Field label="WhatsApp">
          <input
            className={inputClass}
            value={draft.whatsapp}
            onChange={(event) => {
              update({ whatsapp: event.target.value });
            }}
          />
        </Field>
        <Field label="Emergency contact">
          <input
            className={inputClass}
            value={draft.emergencyName}
            onChange={(event) => {
              update({ emergencyName: event.target.value });
            }}
          />
        </Field>
        <Field label="Emergency phone">
          <input
            className={inputClass}
            value={draft.emergencyPhone}
            onChange={(event) => {
              update({ emergencyPhone: event.target.value });
            }}
          />
        </Field>
      </div>
      <ToggleRow
        title="I have a ticket. Check this once you have the ticket."
        checked={draft.hasTicket}
        onChange={(hasTicket) => {
          update({ hasTicket });
        }}
      />
      <div className="flex items-center gap-3">
        <PrimaryButton
          onClick={() => {
            void save();
          }}
        >
          Save
        </PrimaryButton>
        {note && <Notice tone="ok">{note}</Notice>}
        {error && <Notice tone="error">{error}</Notice>}
      </div>
    </Section>
  );
}
