import { saveAvailability } from "./availability";
import { type Person } from "./person";
import { Notice, Section, ToggleRow } from "./ui";

export function AvailabilitySection({ uid, person }: { uid: string; person: Person | null }) {
  if (!person) {
    return (
      <Section
        title="When you can be there"
        hint="Setup Access Passes are limited and assigned later."
      >
        <Notice tone="error">Save your details first.</Notice>
      </Section>
    );
  }

  return (
    <Section
      title="When you can be there"
      hint="Setup Access Passes are limited and assigned later."
    >
      <ToggleRow
        title="I can come early for build"
        hint="This is not a promise of an early pass."
        checked={person.earlyBuild}
        onChange={(earlyBuild) => {
          void saveAvailability(uid, earlyBuild, person.lateTeardown);
        }}
      />
      <ToggleRow
        title="I can stay late for teardown"
        checked={person.lateTeardown}
        onChange={(lateTeardown) => {
          void saveAvailability(uid, person.earlyBuild, lateTeardown);
        }}
      />
    </Section>
  );
}
