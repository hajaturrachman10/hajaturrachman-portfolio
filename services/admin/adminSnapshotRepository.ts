import { ConfigSnapshot } from "./adminTypes";
import { adminRepository } from "./adminRepository";

const MAX_SNAPSHOTS = 20;

export const adminSnapshotRepository = {
  read(): ConfigSnapshot[] {
    const state = adminRepository.read();
    return Array.isArray(state.snapshots) ? state.snapshots : [];
  },

  write(snapshots: ConfigSnapshot[]): void {
    adminRepository.update((draft) => {
      draft.snapshots = snapshots.slice(0, MAX_SNAPSHOTS);
      return draft;
    });
  },

  addSnapshot(snapshot: ConfigSnapshot): ConfigSnapshot[] {
    const list = this.read();
    const updated = [snapshot, ...list].slice(0, MAX_SNAPSHOTS);
    this.write(updated);
    return updated;
  },

  getSnapshotByVersion(version: number): ConfigSnapshot | null {
    const list = this.read();
    return list.find((s) => s.version === version) || null;
  },

  getNextVersion(): number {
    const list = this.read();
    if (list.length === 0) return 1;
    const maxVer = Math.max(...list.map((s) => s.version));
    return maxVer + 1;
  }
};
