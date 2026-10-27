import { describe, expect, it } from "vitest";
import { accommodationError } from "./accommodations";
import { personError, emptyPerson } from "./person";
import { HELP_ROLES, LEAD_ROLES, isHelpRole, isLeadRole } from "./roles";

describe("registration checks", () => {
  it("requires a legal name", () => {
    expect(personError(emptyPerson("a@example.com"))).toBe("Enter your legal name.");
  });

  it("requires a WhatsApp number with a country code", () => {
    const person = emptyPerson("a@example.com");
    person.legalName = "Aurel Gruber";
    person.whatsapp = "079 000 00 00";
    expect(personError(person)).toBe(
      "Start your WhatsApp number with the country code, like +41 79 000 00 00.",
    );
    person.whatsapp = "+41 79 000 00 00";
    person.emergencyName = "Sam Hale";
    person.emergencyPhone = "+41 79 000 00 01";
    expect(personError(person)).toBeNull();
  });

  it("keeps a vehicle pass on an RV only", () => {
    expect(
      accommodationError({
        label: "White RV",
        type: "rv",
        lengthFt: 32,
        widthFt: 8,
        vehiclePass: true,
      }),
    ).toBeNull();
    expect(
      accommodationError({
        label: "Cargo",
        type: "trailer",
        lengthFt: 12,
        widthFt: 6,
        vehiclePass: true,
      }),
    ).toBe("Only an RV takes a vehicle pass.");
  });

  it("offers build as a lead role and not as help", () => {
    expect(isLeadRole("build")).toBe(true);
    expect(isHelpRole("build")).toBe(false);
    expect(isHelpRole("sound")).toBe(true);
    expect(LEAD_ROLES.find(([id]) => id === "container")?.[1]).toBe(
      "Container shipping coordination",
    );
    expect(HELP_ROLES.find(([id]) => id === "burlesque")?.[1]).toBe("Burlesque show");
  });
});
