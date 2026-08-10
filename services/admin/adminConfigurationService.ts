import crypto from "crypto";
import { adminRepository } from "./adminRepository";
import { adminSnapshotRepository } from "./adminSnapshotRepository";
import { logAdminEvent } from "./adminAuditLogger";
import { AdminState, ConfigSnapshot, ServiceResult } from "./adminTypes";
import { ADMIN_ERRORS } from "./adminErrors";

export const adminConfigurationService = {
  calculateConfigurationHash(state: AdminState): string {
    const serialized = JSON.stringify({
      auth: { username: state.auth.username, passwordHash: state.auth.passwordHash },
      strategies: state.strategies,
      toggles: state.toggles
    });
    return crypto.createHash("sha256").update(serialized).digest("hex");
  },

  createSnapshot(createdBy: string, message: string, stateToSave?: AdminState): ServiceResult<ConfigSnapshot> {
    const currentState = stateToSave || adminRepository.read();
    const version = adminSnapshotRepository.getNextVersion();
    const configHash = this.calculateConfigurationHash(currentState);

    const snapshot: ConfigSnapshot = {
      version,
      createdAt: Date.now(),
      createdBy,
      message,
      configHash,
      state: currentState
    };

    adminSnapshotRepository.addSnapshot(snapshot);
    logAdminEvent("SNAPSHOT_CREATED", `Snapshot v${version} dibuat oleh ${createdBy}: ${message}`);

    return {
      success: true,
      data: snapshot
    };
  },

  previewConfiguration(proposedState: Partial<AdminState>): ServiceResult<{ valid: boolean; summary: string }> {
    logAdminEvent("CONFIGURATION_PREVIEWED", "Simulasi preview konfigurasi dilakukan");

    // Perform validation check without writing to storage or creating snapshot
    if (proposedState.auth?.username && proposedState.auth.username.trim().length < 3) {
      return {
        success: false,
        error: { code: "INVALID_PREVIEW", message: "Preview gagal: Username minimal 3 karakter.", status: 400 }
      };
    }

    return {
      success: true,
      data: {
        valid: true,
        summary: "Simulasi validasi konfigurasi berhasil (Tanpa perubahan storage/snapshot)."
      }
    };
  },

  async restoreSnapshotAsync(version: number, restoredBy = "Hajaturrachman10"): Promise<ServiceResult<{ restoredVersion: number; globalEpoch: number }>> {
    const result = this.restoreSnapshot(version, restoredBy);
    if (result.success) {
      await adminRepository.readAsync();
    }
    return result;
  },

  restoreSnapshot(version: number, restoredBy = "Hajaturrachman10"): ServiceResult<{ restoredVersion: number; globalEpoch: number }> {

    const targetSnapshot = adminSnapshotRepository.getSnapshotByVersion(version);

    if (!targetSnapshot) {
      return {
        success: false,
        error: { code: "SNAPSHOT_NOT_FOUND", message: `Snapshot v${version} tidak ditemukan.`, status: 404 }
      };
    }

    // 1. Create a safety snapshot of CURRENT state before restoring
    this.createSnapshot(restoredBy, `Pre-Restore Backup before restoring v${version}`);

    // 2. Update globalEpoch to revoke all active public sessions
    const newEpoch = Date.now();

    // 3. Restore state in adminRepository
    adminRepository.update((draft) => {
      draft.auth = { ...targetSnapshot.state.auth };
      draft.strategies = { ...targetSnapshot.state.strategies };
      draft.toggles = { ...targetSnapshot.state.toggles };
      draft.globalEpoch = newEpoch;
      return draft;
    });

    logAdminEvent("SNAPSHOT_RESTORED", `Sistem dipulihkan ke Snapshot v${version} oleh ${restoredBy}`, "127.0.0.1");

    return {
      success: true,
      data: {
        restoredVersion: version,
        globalEpoch: newEpoch
      }
    };
  },

  listSnapshots(): ServiceResult<ConfigSnapshot[]> {
    const list = adminSnapshotRepository.read();
    return {
      success: true,
      data: list
    };
  }
};
