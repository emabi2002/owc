import { DEMONSTRATION_CLAIMS } from "@/lib/demonstration/data-pack";
import { normalizeDemonstrationReportingRows } from "./service";
import type { ManagementReportingRow } from "./types";

export type ReportingSourceMode = "demonstration" | "live";

export type ReportingDataReader = {
  read: () => Promise<readonly ManagementReportingRow[]>;
};

export type ManagementReportingSource = {
  available: boolean;
  environment: "DEMONSTRATION" | "LIVE";
  syntheticData: boolean;
  recordCount: number;
  rows: ManagementReportingRow[];
  reason?: string;
};

export type LoadManagementReportingSourceInput = {
  mode: ReportingSourceMode;
  liveReader: ReportingDataReader | null;
};

function unavailableLiveSource(reason: string): ManagementReportingSource {
  return {
    available: false,
    environment: "LIVE",
    syntheticData: false,
    recordCount: 0,
    rows: [],
    reason,
  };
}

export async function loadManagementReportingSource(
  input: LoadManagementReportingSourceInput,
): Promise<ManagementReportingSource> {
  if (input.mode === "demonstration") {
    const rows = normalizeDemonstrationReportingRows(DEMONSTRATION_CLAIMS);
    return {
      available: true,
      environment: "DEMONSTRATION",
      syntheticData: true,
      recordCount: rows.length,
      rows,
    };
  }

  if (!input.liveReader) {
    return unavailableLiveSource("Live management reporting source is unavailable.");
  }

  try {
    const rows = (await input.liveReader.read()).map((row) => ({ ...row }));
    return {
      available: true,
      environment: "LIVE",
      syntheticData: false,
      recordCount: rows.length,
      rows,
    };
  } catch {
    return unavailableLiveSource("Live management reporting source is unavailable.");
  }
}
