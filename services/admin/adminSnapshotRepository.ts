import fs from "fs";
import path from "path";
import os from "os";
import { ConfigSnapshot } from "./adminTypes";

const DEV_SNAPSHOT_PATH = path.join(process.cwd(), "data", "adminSnapshots.json");
const TMP_SNAPSHOT_PATH = path.join(os.tmpdir(), "hajat_adminSnapshots.json");
const MAX_SNAPSHOTS = 50;

let inMemorySnapshots: ConfigSnapshot[] | null = (globalThis as any).__adminSnapshotCache || null;

export const adminSnapshotRepository = {
  read(): ConfigSnapshot[] {
    if (inMemorySnapshots) {
      return inMemorySnapshots;
    }

    try {
      let raw = "";
      if (fs.existsSync(TMP_SNAPSHOT_PATH)) {
        raw = fs.readFileSync(TMP_SNAPSHOT_PATH, "utf-8");
      } else if (fs.existsSync(DEV_SNAPSHOT_PATH)) {
        raw = fs.readFileSync(DEV_SNAPSHOT_PATH, "utf-8");
      }

      if (!raw) {
        inMemorySnapshots = [];
        (globalThis as any).__adminSnapshotCache = [];
        return [];
      }

      const list = JSON.parse(raw) as ConfigSnapshot[];
      const validList = Array.isArray(list) ? list : [];
      inMemorySnapshots = validList;
      (globalThis as any).__adminSnapshotCache = validList;
      return validList;
    } catch {
      inMemorySnapshots = [];
      (globalThis as any).__adminSnapshotCache = [];
      return [];
    }
  },

  write(snapshots: ConfigSnapshot[]): void {
    inMemorySnapshots = snapshots;
    (globalThis as any).__adminSnapshotCache = snapshots;

    try {
      const dir = path.dirname(DEV_SNAPSHOT_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DEV_SNAPSHOT_PATH, JSON.stringify(snapshots, null, 2), "utf-8");
      return;
    } catch {
      // Dev directory read-only on Vercel Serverless
    }

    try {
      const tmpDir = path.dirname(TMP_SNAPSHOT_PATH);
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      fs.writeFileSync(TMP_SNAPSHOT_PATH, JSON.stringify(snapshots, null, 2), "utf-8");
    } catch (err) {
      console.error("Gagal menyimpan adminSnapshots ke serverless tmp:", err);
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
