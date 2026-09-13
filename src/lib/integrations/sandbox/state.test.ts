import { describe, expect, test } from "bun:test";
import {
  getSandboxServiceStatus,
  listSandboxServiceStatuses,
  resetSandboxServiceStatuses,
  setSandboxServiceStatus,
} from "./state";

describe("sandbox service-state controls", () => {
  test("starts with every demonstration service online", () => {
    resetSandboxServiceStatuses();
    expect(listSandboxServiceStatuses().every((item) => item.status === "online")).toBe(true);
  });

  test("can isolate one simulated outage without affecting other services", () => {
    resetSandboxServiceStatuses();
    setSandboxServiceStatus("nid", "offline");

    expect(getSandboxServiceStatus("nid")).toBe("offline");
    expect(getSandboxServiceStatus("bank")).toBe("online");
  });

  test("reset restores a clean presentation environment", () => {
    setSandboxServiceStatus("medical", "degraded");
    resetSandboxServiceStatuses();
    expect(getSandboxServiceStatus("medical")).toBe("online");
  });
});
