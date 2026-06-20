import { create } from "zustand";
import type { PeriodReport, ReportPeriod } from "@/services/report.service";
import { createReportService } from "@/services/report.service";
import type { RepositoryContainer } from "@/infrastructure/di/container";

interface ReportState {
  period: ReportPeriod;
  report: PeriodReport | null;
  isLoading: boolean;
  _repos: RepositoryContainer | null;

  setRepos: (repos: RepositoryContainer) => void;
  setPeriod: (period: ReportPeriod) => void;
  load: () => Promise<void>;
}

export const useReportStore = create<ReportState>((set, get) => ({
  period: "weekly",
  report: null,
  isLoading: false,
  _repos: null,

  setRepos: (repos) => set({ _repos: repos }),

  setPeriod: (period) => {
    set({ period });
    void get().load();
  },

  load: async () => {
    const repos = get()._repos;
    if (!repos) return;

    set({ isLoading: true });
    try {
      const service = createReportService(repos);
      const report = await service.getReport(get().period);
      set({ report, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
