import { describe, expect, test } from "bun:test";
import { DEMONSTRATION_CLAIMS } from "@/lib/demonstration/data-pack";
import { normalizeDemonstrationReportingRows } from "./service";
import {
  loadManagementReportingSource,
  type ReportingDataReader,
} from "./source";

const liveRows = normalizeDemonstrationReportingRows(DEMONSTRATION_CLAIMS).map(
  (row) => ({ ...row, synthetic: false }),
);

const liveReader: ReportingDataReader = {
  read: async () => liveRows,
};

describe("OWC protected management reporting source", () => {
  test("demonstration mode always uses the deterministic synthetic claim pack", async () => {
    const result = await loadManagementReportingSource({
      mode: "demonstration",
      liveReader,
    });

    expect(result.available).toBe(true);
    expect(result.environment).toBe("DEMONSTRATION");
    expect(result.syntheticData).toBe(true);
    expect(result.recordCount).toBe(20);
    expect(result.rows.every((row) => row.synthetic === true)).toBe(true);
  });

  test("live mode reads only from the supplied protected live reader", async () => {
    const result = await loadManagementReportingSource({
      mode: "live",
      liveReader,
    });

    expect(result.available).toBe(true);
    expect(result.environment).toBe("LIVE");
    expect(result.syntheticData).toBe(false);
    expect(result.recordCount).toBe(20);
    expect(result.rows.every((row) => row.synthetic !== true)).toBe(true);
  });

  test("live mode fails closed when no live reporting source is configured", async () => {
    const result = await loadManagementReportingSource({
      mode: "live",
      liveReader: null,
    });

    expect(result.available).toBe(false);
    expect(result.environment).toBe("LIVE");
    expect(result.syntheticData).toBe(false);
    expect(result.recordCount).toBe(0);
    expect(result.rows).toEqual([]);
    expect(result.reason).toContain("unavailable");
  });

  test("does not silently fall back from a failed live source to demonstration data", async () => {
    const failingReader: ReportingDataReader = {
      read: async () => {
        throw new Error("database unavailable");
      },
    };

    const result = await loadManagementReportingSource({
      mode: "live",
      liveReader: failingReader,
    });

    expect(result.available).toBe(false);
    expect(result.environment).toBe("LIVE");
    expect(result.recordCount).toBe(0);
    expect(result.rows).toEqual([]);
    expect(result.reason).toContain("unavailable");
  });
});
