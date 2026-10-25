import { useState } from "react";
import { AccommodationEditor, blankDraft, type Draft } from "./accommodation-editor";
import {
  ACCOMMODATION_TYPES,
  OccupantTakenError,
  deleteAccommodation,
  saveAccommodation,
  type Accommodation,
} from "./accommodations";
import { PassCard } from "./pass-status";
import { type DirectoryEntry } from "./registration";
import { Notice, PrimaryButton, QuietButton, Section, SoleRepresentative } from "./ui";

export function AccommodationsSection({
  uid,
  owned,
  all,
  directory,
  profileSaved,
}: {
  uid: string;
  owned: Accommodation[];
  all: Accommodation[];
  directory: DirectoryEntry[];
  profileSaved: boolean;
}) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [listing, setListing] = useState(owned.length > 0);

  const sleeping = all.find((item) => item.occupantUids.includes(uid));
  const matches = directory
    .filter((person) => {
      const haystack = `${person.legalName} ${person.email}`.toLowerCase();
      return query.trim() !== "" && haystack.includes(query.trim().toLowerCase());
    })
    .slice(0, 6);

  async function save() {
    if (!draft) return;
    setError(null);
    const next: Accommodation = {
      id: draft.id,
      ownerUid: uid,
      label: draft.label,
      type: draft.type,
      lengthFt: Number(draft.length),
      widthFt: Number(draft.width),
      vehiclePass: draft.type === "rv" ? draft.vehiclePass : false,
      occupantUids: draft.occupantUids,
    };
    const conflict = next.occupantUids
      .map((personUid) =>
        all.find((item) => item.id !== next.id && item.occupantUids.includes(personUid)),
      )
      .find((item) => item !== undefined);
    if (conflict) {
      setError(`Someone in this list already sleeps in ${conflict.label}.`);
      return;
    }
    const previous = owned.find((item) => item.id === next.id) ?? null;
    try {
      await saveAccommodation(next, previous);
      setDraft(null);
      setQuery("");
    } catch (caught) {
      if (caught instanceof OccupantTakenError) {
        const name = directory.find((person) => person.uid === caught.uid)?.legalName ?? "Someone";
        setError(`${name} already sleeps in another place.`);
      } else {
        setError(caught instanceof Error ? caught.message : "Could not save.");
      }
    }
  }

  return (
    <Section
      title="Accommodation"
      hint="Add every sleeper, including yourself. An RV carries its own vehicle pass."
    >
      <SoleRepresentative
        subject="accommodations"
        checked={listing}
        onChange={(checked) => {
          setListing(checked);
          if (!checked) {
            setDraft(null);
            setError(null);
          }
        }}
      />
      {sleeping && <p className="text-sm text-muted">You are listed in {sleeping.label}.</p>}
      {owned.length > 0 && (
        <ul className="flex flex-col gap-3">
          {owned.map((item) => (
            <PassCard key={item.id} needsPass={item.type === "rv"} hasPass={item.vehiclePass}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-sm text-muted">
                    {ACCOMMODATION_TYPES.find(([type]) => type === item.type)?.[1]} ·{" "}
                    {item.lengthFt} × {item.widthFt} ft
                  </p>
                  <p className="text-sm">
                    {item.occupantUids
                      .map(
                        (personUid) =>
                          directory.find((person) => person.uid === personUid)?.legalName ??
                          "Registered",
                      )
                      .join(", ") || "No one listed yet"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <QuietButton
                    onClick={() => {
                      setDraft({
                        id: item.id,
                        label: item.label,
                        type: item.type,
                        length: String(item.lengthFt),
                        width: String(item.widthFt),
                        vehiclePass: item.vehiclePass,
                        occupantUids: item.occupantUids,
                      });
                    }}
                  >
                    Edit
                  </QuietButton>
                  <QuietButton
                    onClick={() => {
                      void deleteAccommodation(item);
                    }}
                  >
                    Remove
                  </QuietButton>
                </div>
              </div>
            </PassCard>
          ))}
        </ul>
      )}
      {listing && !profileSaved && (
        <Notice tone="error">Save your details before adding a place.</Notice>
      )}
      {listing && profileSaved && draft === null && (
        <PrimaryButton
          onClick={() => {
            setDraft(blankDraft());
            setError(null);
          }}
        >
          Add a place
        </PrimaryButton>
      )}
      {listing && draft && (
        <AccommodationEditor
          draft={draft}
          directory={directory}
          query={query}
          matches={matches}
          error={error}
          onChange={setDraft}
          onQuery={setQuery}
          onSave={() => {
            void save();
          }}
          onCancel={() => {
            setDraft(null);
          }}
        />
      )}
    </Section>
  );
}
