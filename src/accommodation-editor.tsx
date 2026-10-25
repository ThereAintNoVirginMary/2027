import { ACCOMMODATION_TYPES, type AccommodationType } from "./accommodations";
import { type DirectoryEntry } from "./registration";
import { Field, Notice, PrimaryButton, QuietButton, inputClass } from "./ui";

export type Draft = {
  id: string;
  label: string;
  type: AccommodationType;
  length: string;
  width: string;
  vehiclePass: boolean;
  occupantUids: string[];
};

export function blankDraft(): Draft {
  return {
    id: crypto.randomUUID(),
    label: "",
    type: "rv",
    length: "",
    width: "",
    vehiclePass: false,
    occupantUids: [],
  };
}

export function AccommodationEditor({
  draft,
  directory,
  query,
  matches,
  error,
  onChange,
  onQuery,
  onSave,
  onCancel,
}: {
  draft: Draft;
  directory: DirectoryEntry[];
  query: string;
  matches: DirectoryEntry[];
  error: string | null;
  onChange: (draft: Draft) => void;
  onQuery: (query: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-line bg-paper p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Label">
          <input
            className={inputClass}
            value={draft.label}
            onChange={(event) => {
              onChange({ ...draft, label: event.target.value });
            }}
          />
        </Field>
        <Field label="Type">
          <select
            className={inputClass}
            value={draft.type}
            onChange={(event) => {
              onChange({ ...draft, type: event.target.value as AccommodationType });
            }}
          >
            {ACCOMMODATION_TYPES.map(([type, label]) => (
              <option key={type} value={type}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Length (ft)">
          <input
            className={inputClass}
            inputMode="decimal"
            value={draft.length}
            onChange={(event) => {
              onChange({ ...draft, length: event.target.value });
            }}
          />
        </Field>
        <Field label="Width (ft)">
          <input
            className={inputClass}
            inputMode="decimal"
            value={draft.width}
            onChange={(event) => {
              onChange({ ...draft, width: event.target.value });
            }}
          />
        </Field>
      </div>
      {draft.type === "rv" && (
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={draft.vehiclePass}
            onChange={(event) => {
              onChange({ ...draft, vehiclePass: event.target.checked });
            }}
          />
          I have a vehicle pass for this RV. Check this once you have the pass.
        </label>
      )}
      <Field label="People who sleep here">
        <input
          className={inputClass}
          placeholder="Search registered people"
          value={query}
          onChange={(event) => {
            onQuery(event.target.value);
          }}
        />
      </Field>
      <ul className="flex flex-col gap-1">
        {matches.map((person) => (
          <li key={person.uid}>
            <button
              type="button"
              className="text-left text-sm"
              onClick={() => {
                if (!draft.occupantUids.includes(person.uid)) {
                  onChange({ ...draft, occupantUids: [...draft.occupantUids, person.uid] });
                }
                onQuery("");
              }}
            >
              {person.legalName} · {person.email}
            </button>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        {draft.occupantUids.map((personUid) => {
          const person = directory.find((entry) => entry.uid === personUid);
          return (
            <button
              key={personUid}
              type="button"
              className="rounded-full border border-line px-3 py-1 text-sm"
              onClick={() => {
                onChange({
                  ...draft,
                  occupantUids: draft.occupantUids.filter((item) => item !== personUid),
                });
              }}
            >
              {person?.legalName ?? "Registered"} ×
            </button>
          );
        })}
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex gap-4">
        <PrimaryButton onClick={onSave}>Save place</PrimaryButton>
        <QuietButton onClick={onCancel}>Cancel</QuietButton>
      </div>
    </div>
  );
}
