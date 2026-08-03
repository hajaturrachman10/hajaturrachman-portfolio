import fs from "fs";
import path from "path";
import { ConfigSnapshot } from "./adminTypes";

const SNAPSHOT_STORAGE_PATH = path.join(process.cwd(), "data", "adminSnapshots.json");
const MAX_SNAPSHOTS = 50;

export const adminSnapshotRepository = {
  read(): ConfigSnapshot[] {
    try {
      if (!fs.existsSync(SNAPSHOT_STORAGE_PATH)) {
        this.write([]);
        return [];
      }
      const raw = fs.readFileSync(SNAPSHOT_STORAGE_PATH, "utf-8");
      const list = JSON.parse(raw) as ConfigSnapshot[];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  write(snapshots: ConfigSnapshot[]): void {
    try {
      const dir = path.dirname(SNAPSHOT_STORAGE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(SNAPSHOT_STORAGE_PATH, JSON.stringify(snapshots, null, 2), "utf-8");
    } catch (err) {
      console.error("Gagal menyimpan adminSnapshots.json:", err);
    }
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
