import { useState } from "react";
import { PassCard } from "./pass-status";
import { deleteVehicle, saveVehicle, vehicleError, type Vehicle } from "./vehicles";
import {
  Field,
  Notice,
  PrimaryButton,
  QuietButton,
  Section,
  SoleRepresentative,
  inputClass,
} from "./ui";

type Draft = { id: string; label: string; length: string; width: string; hasPass: boolean };

function blank(): Draft {
  return { id: crypto.randomUUID(), label: "", length: "", width: "", hasPass: false };
}

export function VehiclesSection({
  uid,
  vehicles,
  profileSaved,
}: {
  uid: string;
  vehicles: Vehicle[];
  profileSaved: boolean;
}) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [listing, setListing] = useState(vehicles.length > 0);

  async function save() {
    if (!draft) return;
    const next: Vehicle = {
      id: draft.id,
      ownerUid: uid,
      label: draft.label,
      lengthFt: Number(draft.length),
      widthFt: Number(draft.width),
      hasPass: draft.hasPass,
    };
    const problem = vehicleError(next);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    await saveVehicle(next);
    setDraft(null);
  }

  return (
    <Section
      title="Vehicles"
      hint="Add an RV under accommodation and mark its vehicle pass there. Note that a trailer needs no vehicle pass, but its tow vehicle does and should be listed here."
    >
      <SoleRepresentative
        subject="vehicles"
        checked={listing}
        onChange={(checked) => {
          if (!checked && vehicles.length > 0) {
            window.alert("Remove the vehicles you listed before turning this off.");
            return;
          }
          setListing(checked);
          if (!checked) {
            setDraft(null);
            setError(null);
          }
        }}
      />
      {vehicles.length > 0 && (
        <ul className="flex flex-col gap-3">
          {vehicles.map((vehicle) => (
            <PassCard key={vehicle.id} needsPass hasPass={vehicle.hasPass}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{vehicle.label}</p>
                  <p className="text-sm text-muted">
                    {vehicle.lengthFt} × {vehicle.widthFt} ft
                  </p>
                </div>
                <div className="flex gap-3">
                  <QuietButton
                    onClick={() => {
                      setDraft({
                        id: vehicle.id,
                        label: vehicle.label,
                        length: String(vehicle.lengthFt),
                        width: String(vehicle.widthFt),
                        hasPass: vehicle.hasPass,
                      });
                    }}
                  >
                    Edit
                  </QuietButton>
                  <QuietButton
                    onClick={() => {
                      void deleteVehicle(vehicle.id);
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
        <Notice tone="error">Save your details before adding a vehicle.</Notice>
      )}
      {draft === null && (
        <PrimaryButton
          disabled={!listing || !profileSaved}
          onClick={() => {
            setDraft(blank());
            setError(null);
          }}
        >
          Add a vehicle
        </PrimaryButton>
      )}
      {listing && draft && (
        <div className="flex flex-col gap-4 rounded-lg border border-line bg-paper p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Label">
              <input
                className={inputClass}
                value={draft.label}
                onChange={(event) => {
                  setDraft({ ...draft, label: event.target.value });
                }}
              />
            </Field>
            <Field label="Length (ft)">
              <input
                className={inputClass}
                inputMode="decimal"
                value={draft.length}
                onChange={(event) => {
                  setDraft({ ...draft, length: event.target.value });
                }}
              />
            </Field>
            <Field label="Width (ft)">
              <input
                className={inputClass}
                inputMode="decimal"
                value={draft.width}
                onChange={(event) => {
                  setDraft({ ...draft, width: event.target.value });
                }}
              />
            </Field>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={draft.hasPass}
              onChange={(event) => {
                setDraft({ ...draft, hasPass: event.target.checked });
              }}
            />
            I have a vehicle pass for this vehicle. Check this once you have the pass.
          </label>
          {error && <Notice tone="error">{error}</Notice>}
          <div className="flex gap-4">
            <PrimaryButton
              onClick={() => {
                void save();
              }}
            >
              Save vehicle
            </PrimaryButton>
            <QuietButton
              onClick={() => {
                setDraft(null);
              }}
            >
              Cancel
            </QuietButton>
          </div>
        </div>
      )}
    </Section>
  );
}
