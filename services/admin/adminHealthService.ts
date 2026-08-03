import fs from "fs";
import path from "path";
import { adminRepository } from "./adminRepository";
import { ADMIN_CONFIG } from "./adminConfig";
import { ServiceResult } from "./adminTypes";

export type SystemHealthReport = {
  status: "OK" | "DEGRADED" | "DOWN";
  version: string;
  build: string;
  runtime: string;
  checks: {
    repositoryReadable: boolean;
    repositoryWritable: boolean;
    adminStateValid: boolean;
    cookieSecretAvailable: boolean;
    environmentValid: boolean;
  };
  timestamp: string;
};

export const adminHealthService = {
  getSystemHealth(): ServiceResult<SystemHealthReport> {
    let isReadable = false;
    let isWritable = false;
    let isStateValid = false;

    try {
      const state = adminRepository.read();
      isReadable = Boolean(state && state.auth && state.toggles);
      isStateValid = Boolean(state.auth.username && state.globalEpoch > 0);

      // Verify writable
      const testPath = path.join(process.cwd(), "data", ".health_test");
      fs.writeFileSync(testPath, "test", "utf-8");
      if (fs.existsSync(testPath)) {
        fs.unlinkSync(testPath);
        isWritable = true;
      }
    } catch {
      isReadable = false;
      isWritable = false;
      isStateValid = false;
    }

    const secretKey = process.env.ADMIN_SESSION_SECRET || process.env.AUTH_SECRET || "default_secret";
    const isSecretAvailable = Boolean(secretKey && secretKey.length >= 8);
    const isEnvValid = Boolean(process.env.NODE_ENV);

    const isHealthy = isReadable && isWritable && isStateValid && isSecretAvailable;

    return {
      success: true,
      data: {
        status: isHealthy ? "OK" : "DEGRADED",
        version: "2.2.0",
        build: "Production Baseline v2.2",
        runtime: `Node.js ${process.version}`,
        checks: {
          repositoryReadable: isReadable,
          repositoryWritable: isWritable,
          adminStateValid: isStateValid,
          cookieSecretAvailable: isSecretAvailable,
          environmentValid: isEnvValid
        },
        timestamp: new Date().toISOString()
      }
    };
  }
};
