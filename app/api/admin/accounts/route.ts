import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuthService } from "@/services/admin/adminAuthService";
import { adminRepository } from "@/services/admin/adminRepository";
import { ADMIN_CONFIG } from "@/services/admin/adminConfig";
import { AdminAccount } from "@/services/admin/adminTypes";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_CONFIG.COOKIE_NAME)?.value;

  const authCheck = adminAuthService.validateSession(token);
  if (!authCheck.success) {
    return NextResponse.json(
      { success: false, error: authCheck.error.message, code: authCheck.error.code },
      { status: authCheck.error.status }
    );
  }

  const state = await adminRepository.readAsync();
  const accounts = state.accounts || [];


  return NextResponse.json({
    success: true,
    accounts
  });
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_CONFIG.COOKIE_NAME)?.value;

  const authCheck = adminAuthService.validateSession(token);
  if (!authCheck.success) {
    return NextResponse.json(
      { success: false, error: authCheck.error.message, code: authCheck.error.code },
      { status: authCheck.error.status }
    );
  }

  await adminRepository.readAsync();
  try {
    const body = await request.json();

    const { username, password, role } = body || {};

    if (!username || !password || username.length < 3 || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Username minimal 3 karakter & Password minimal 6 karakter." },
        { status: 400 }
      );
    }

    const cleanUser = username.trim();
    const cleanPass = password.trim();
    const cleanRole = (role === "SUPER_ADMIN" || role === "AUDITOR") ? role : "ADMIN";

    let createdAccount: AdminAccount | null = null;
    let duplicateError = false;

    adminRepository.update((draft) => {
      if (!draft.accounts) draft.accounts = [];

      // Check duplicate username (case-insensitive)
      const existing = draft.accounts.find(
        (acc) => acc.username.toLowerCase() === cleanUser.toLowerCase()
      );

      if (existing) {
        duplicateError = true;
        return draft;
      }

      createdAccount = {
        id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        username: cleanUser,
        passwords: [cleanPass],
        role: cleanRole,
        createdAt: Date.now()
      };

      draft.accounts.push(createdAccount);
      return draft;
    });

    if (duplicateError) {
      return NextResponse.json(
        { success: false, error: `Nama pengguna "${cleanUser}" sudah terdaftar.` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      account: createdAccount
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Gagal membuat akun admin baru." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_CONFIG.COOKIE_NAME)?.value;

  const authCheck = adminAuthService.validateSession(token);
  if (!authCheck.success) {
    return NextResponse.json(
      { success: false, error: authCheck.error.message, code: authCheck.error.code },
      { status: authCheck.error.status }
    );
  }

  await adminRepository.readAsync();
  try {
    const body = await request.json();

    const { id, action, value, role, username } = body || {};

    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: "ID Akun dan Action wajib diisi." },
        { status: 400 }
      );
    }

    let errorMessage: string | null = null;

    adminRepository.update((draft) => {
      if (!draft.accounts) return draft;
      const acc = draft.accounts.find((a) => a.id === id);
      if (!acc) {
        errorMessage = "Akun admin tidak ditemukan.";
        return draft;
      }

      if (action === "addPassword") {
        if (!value || typeof value !== "string" || value.trim().length < 6) {
          errorMessage = "Kata sandi tambahan minimal 6 karakter.";
          return draft;
        }
        const newPass = value.trim();
        if (acc.passwords.includes(newPass)) {
          errorMessage = "Kata sandi tersebut sudah terdaftar untuk akun ini.";
          return draft;
        }
        acc.passwords.push(newPass);
      } else if (action === "removePassword") {
        if (acc.passwords.length <= 1) {
          errorMessage = "Setiap akun harus memiliki minimal 1 kata sandi aktif.";
          return draft;
        }
        acc.passwords = acc.passwords.filter((p) => p !== value);
      } else if (action === "updateDetails") {
        if (username && username.trim().length >= 3) {
          // Check duplicate
          const dup = draft.accounts.find(
            (other) => other.id !== id && other.username.toLowerCase() === username.trim().toLowerCase()
          );
          if (dup) {
            errorMessage = `Nama pengguna "${username.trim()}" sudah digunakan akun lain.`;
            return draft;
          }
          acc.username = username.trim();
        }
        if (role && (role === "SUPER_ADMIN" || role === "ADMIN" || role === "AUDITOR")) {
          acc.role = role;
        }
      }

      // Sync primary account changes to draft.auth
      if (acc.id === draft.accounts[0]?.id) {
        draft.auth.username = acc.username;
        if (acc.passwords.length > 0) {
          draft.auth.passwordHash = acc.passwords[0];
        }
      }

      return draft;
    });

    if (errorMessage) {
      return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Akun admin berhasil diperbarui." });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Gagal memperbarui akun." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_CONFIG.COOKIE_NAME)?.value;

  const authCheck = adminAuthService.validateSession(token);
  if (!authCheck.success) {
    return NextResponse.json(
      { success: false, error: authCheck.error.message, code: authCheck.error.code },
      { status: authCheck.error.status }
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "ID Akun wajib disertakan." }, { status: 400 });
  }

  await adminRepository.readAsync();
  let errorMessage: string | null = null;
  const currentUsername = authCheck.data?.session?.username?.toLowerCase();

  adminRepository.update((draft) => {
    if (!draft.accounts) return draft;
    if (draft.accounts.length <= 1) {
      errorMessage = "Sistem harus memiliki setidaknya 1 akun admin aktif.";
      return draft;
    }

    const target = draft.accounts.find((a) => a.id === id);
    if (!target) {
      errorMessage = "Akun tidak ditemukan.";
      return draft;
    }

    if (currentUsername && target.username.toLowerCase() === currentUsername) {
      errorMessage = "Anda tidak dapat menghapus akun yang sedang Anda gunakan saat ini.";
      return draft;
    }

    draft.accounts = draft.accounts.filter((a) => a.id !== id);
    // Keep draft.auth in sync if primary account was deleted
    if (draft.accounts.length > 0) {
      draft.auth.username = draft.accounts[0].username;
      if (draft.accounts[0].passwords.length > 0) {
        draft.auth.passwordHash = draft.accounts[0].passwords[0];
      }
    }
    return draft;
  });


  if (errorMessage) {
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: "Akun admin berhasil dihapus." });
}
