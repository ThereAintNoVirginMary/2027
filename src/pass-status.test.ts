import { describe, expect, it } from "vitest";
import { vehiclePassMark } from "./pass-status";

describe("vehicle pass mark", () => {
  it("stays green when a pass is not required", () => {
    expect(vehiclePassMark(false, false)).toEqual({
      ok: true,
      label: "no vehicle pass needed",
    });
  });

  it("turns green once a required pass is recorded", () => {
    expect(vehiclePassMark(true, true)).toEqual({ ok: true, label: "has vehicle pass" });
  });

  it("turns red while a required pass is missing", () => {
    expect(vehiclePassMark(true, false)).toEqual({ ok: false, label: "no vehicle pass yet" });
  });
});
