import { describe, expect, it } from "vitest";
import { accommodationError } from "./accommodations";
import { personError, emptyPerson } from "./person";
import { isHelpRole, isLeadRole } from "./roles";

describe("registration checks", () => {
  it("requires a legal name", () => {
    expect(personError(emptyPerson("a@example.com"))).toBe("Enter your legal name.");
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
  });
});
