import { useState } from "react";
import { type User } from "firebase/auth";
import { AccommodationsSection } from "./accommodations-section";
import { AvailabilitySection } from "./availability-section";
import { logOut } from "./auth";
import { PersonSection } from "./person-section";
import { useRegistration } from "./registration";
import { RolesSection } from "./roles-section";
import { QuietButton, Notice } from "./ui";
import { VehiclesSection } from "./vehicles-section";
import { AdminPage } from "./admin-page";

export function CampApp({ user }: { user: User }) {
  const email = user.email ?? "";
  const data = useRegistration(user.uid, email);
  const [page, setPage] = useState<"registration" | "appointments">("registration");
  if (!data.ready) {
    return <p className="px-4 py-10 text-muted">Loading…</p>;
  }
  if (data.loadError) {
    return (
      <main className="mx-auto max-w-xl px-4 py-10">
        <Notice tone="error">{data.loadError}</Notice>
      </main>
    );
  }

  const owned = data.accommodations.filter((item) => item.ownerUid === user.uid);
  const admin = data.person?.admin === true;

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-8 px-4 py-8">
      <header className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold">There Ain't No Virgin Mary</h1>
          <QuietButton
            onClick={() => {
              void logOut();
            }}
          >
            Sign out
          </QuietButton>
        </div>
        <p className="text-muted">2027 camp registration</p>
        {admin && (
          <div className="flex gap-2">
            <PageChip
              active={page === "registration"}
              label="Registration"
              onClick={() => {
                setPage("registration");
              }}
            />
            <PageChip
              active={page === "appointments"}
              label="Appointments"
              onClick={() => {
                setPage("appointments");
              }}
            />
          </div>
        )}
      </header>
      {page === "appointments" && admin ? (
        <AdminPage />
      ) : (
        <div className="flex flex-col gap-10">
          <PersonSection uid={user.uid} email={email} person={data.person} />
          <AccommodationsSection
            uid={user.uid}
            owned={owned}
            all={data.accommodations}
            directory={data.directory}
            profileSaved={data.person !== null}
          />
          <VehiclesSection
            uid={user.uid}
            vehicles={data.vehicles}
            profileSaved={data.person !== null}
          />
          <AvailabilitySection uid={user.uid} person={data.person} />
          <RolesSection uid={user.uid} person={data.person} />
        </div>
      )}
    </main>
  );
}

function PageChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm ${active ? "border-rust bg-rust text-white" : "border-line bg-paper"}`}
    >
      {label}
    </button>
  );
}
