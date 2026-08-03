import { timingSafeCompare } from "@/lib/security";

export type StrategyType = "STATIC" | "YEAR_RANGE" | "MULTIPLE" | "PREFIX" | "SUFFIX" | "REGEX";

export type PasswordStrategyConfig =
  | { type: "STATIC"; password: string }
  | { type: "YEAR_RANGE"; base: string; startYear: number; endYear: number }
  | { type: "MULTIPLE"; passwords: string[] }
  | { type: "PREFIX"; prefix: string }
  | { type: "SUFFIX"; suffix: string }
  | { type: "REGEX"; pattern: string };

export function validateStrategyConfig(strategy?: PasswordStrategyConfig): { valid: boolean; error?: string } {
  if (!strategy || !strategy.type) {
    return { valid: false, error: "Tipe strategi password tidak ditentukan." };
  }

  switch (strategy.type) {
    case "STATIC":
      if (!strategy.password || typeof strategy.password !== "string" || strategy.password.trim() === "") {
        return { valid: false, error: "Password static tidak boleh kosong." };
      }
      break;
    case "YEAR_RANGE":
      if (!strategy.base || typeof strategy.base !== "string" || strategy.base.trim() === "") {
        return { valid: false, error: "Base string rentang tahun tidak boleh kosong." };
      }
      if (typeof strategy.startYear !== "number" || typeof strategy.endYear !== "number" || strategy.startYear > strategy.endYear) {
        return { valid: false, error: "Rentang tahun startYear harus lebih kecil atau sama dengan endYear." };
      }
      break;
    case "MULTIPLE":
      if (!Array.isArray(strategy.passwords) || strategy.passwords.length === 0) {
        return { valid: false, error: "Daftar kata sandi (MULTIPLE) tidak boleh kosong." };
      }
      break;
    case "PREFIX":
      if (!strategy.prefix || typeof strategy.prefix !== "string") {
        return { valid: false, error: "Prefix tidak boleh kosong." };
      }
      break;
    case "SUFFIX":
      if (!strategy.suffix || typeof strategy.suffix !== "string") {
        return { valid: false, error: "Suffix tidak boleh kosong." };
      }
      break;
    case "REGEX":
      if (!strategy.pattern || typeof strategy.pattern !== "string") {
        return { valid: false, error: "Pola REGEX tidak boleh kosong." };
      }
      try {
        new RegExp(strategy.pattern);
      } catch {
        return { valid: false, error: "Pola REGEX tidak valid secara sintaks." };
      }
      break;
    default:
      return { valid: false, error: "Tipe strategi tidak dikenal." };
  }

  return { valid: true };
}

export function evaluatePasswordStrategy(inputPassword: string, strategy: PasswordStrategyConfig): boolean {
  if (!inputPassword || typeof inputPassword !== "string") return false;
  const cleanInput = inputPassword.trim();

  switch (strategy.type) {
    case "STATIC":
      return timingSafeCompare(cleanInput, strategy.password.trim());

    case "YEAR_RANGE": {
      const base = strategy.base.trim();
      if (!cleanInput.startsWith(base)) return false;
      const yearPart = cleanInput.slice(base.length);
      const yearNum = Number(yearPart);
      if (isNaN(yearNum) || !/^\d{4}$/.test(yearPart)) return false;
      return yearNum >= strategy.startYear && yearNum <= strategy.endYear;
    }

    case "MULTIPLE":
      return strategy.passwords.some((p) => timingSafeCompare(cleanInput, p.trim()));

    case "PREFIX":
      return cleanInput.startsWith(strategy.prefix.trim());

    case "SUFFIX":
      return cleanInput.endsWith(strategy.suffix.trim());

    case "REGEX": {
      try {
        const regex = new RegExp(strategy.pattern);
        return regex.test(cleanInput);
      } catch {
        return false;
      }
    }

    default:
      return false;
  }
}
