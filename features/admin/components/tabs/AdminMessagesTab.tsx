"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Search, MessageSquare, CheckCircle2, Clock, Trash2, Send, CornerUpRight, Filter, AlertCircle, ChevronRight, User, Inbox, Eye, EyeOff, X, Copy, Check } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import dynamic from "next/dynamic";

const ConfirmModal = dynamic(
  () => import("@/components/modals/ConfirmModal").then((mod) => mod.ConfirmModal),
  { ssr: false }
);
import { cn } from "@/lib/utils";
import { siteConfig } from "@/data/site";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  status: "unread" | "read" | "replied";
};

export function AdminMessagesTab() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read" | "replied">("all");
  // Kosong secara default saat tab pertama kali dibuka (tidak langsung memilih pesan)
  const [selectedMessageId, setSelectedMessageId] = useState<string>("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);

  const [showQuickReply, setShowQuickReply] = useState(false);
  const [quickReplyBody, setQuickReplyBody] = useState("");
  const [copyReplyToast, setCopyReplyToast] = useState(false);

  const handleCopyEmail = (email: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(email);
      setCopiedEmailId(email);
      setTimeout(() => setCopiedEmailId(null), 2500);
    }
  };

  const handleSendViaEmailClient = (email: string, subject: string, body: string, messageId: string) => {
    handleSetReadStatus(messageId, "replied");
    const targetEmail = email || "";
    const cleanSubject = subject ? (subject.startsWith("Re:") ? subject : `Re: ${subject}`) : "Re: Pesan Portofolio";
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(targetEmail)}&su=${encodeURIComponent(cleanSubject)}&body=${encodeURIComponent(body || "")}`;
    if (typeof window !== "undefined") {
      window.open(gmailUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Real-time synchronization with server API & homepage contact submissions
  const fetchRealtimeMessages = async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      }
    } catch (err) {
      console.error("Gagal sinkronisasi pesan real-time:", err);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_contact_messages");
    }
    fetchRealtimeMessages();

    // Listen to real-time custom events from ContactSection
    const handleNewMessage = () => fetchRealtimeMessages();
    window.addEventListener("contact_message_submitted", handleNewMessage);
    window.addEventListener("storage", handleNewMessage);

    // Periodic heartbeat sync every 4 seconds (runs ONLY when tab is visible)
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchRealtimeMessages();
      }
    }, 4000);

    return () => {
      window.removeEventListener("contact_message_submitted", handleNewMessage);
      window.removeEventListener("storage", handleNewMessage);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    setShowQuickReply(false);
    setQuickReplyBody("");
  }, [selectedMessageId]);

  const handleSetReadStatus = async (id: string, targetStatus: "unread" | "read" | "replied") => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === id) {
          return {
            ...msg,
            status: targetStatus
          };
        }
        return msg;
      })
    );

    try {
      await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: targetStatus })
      });
    } catch (err) {
      console.error("Gagal update status pesan:", err);
    }
  };

  const handleDeleteMessage = (id: string) => {
    setMessageToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    const id = messageToDelete;
    // 1. Close modal IMMEDIATELY to eliminate any network delay feeling
    setDeleteModalOpen(false);
    setMessageToDelete(null);

    if (id) {
      // 2. Optimistically remove message from local list
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessageId === id) {
        setSelectedMessageId("");
      }

      // 3. Perform network delete request
      try {
        await fetch(`/api/messages?id=${encodeURIComponent(id)}`, {
          method: "DELETE"
        });
      } catch (err) {
        console.error("Gagal menghapus pesan:", err);
      }
    }
  };

  // Compute filtered messages seamlessly
  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "unread" && msg.status === "unread") ||
      (statusFilter === "read" && msg.status === "read") ||
      (statusFilter === "replied" && msg.status === "replied");

    return matchesSearch && matchesStatus;
  });

  const selectedMessage = messages.find((m) => m.id === selectedMessageId) || null;

  const unreadCount = messages.filter((m) => m.status === "unread").length;
  const readCount = messages.filter((m) => m.status === "read").length;
  const repliedCount = messages.filter((m) => m.status === "replied").length;

  // Helper for initial avatar circles
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Filter Pills with Theme Colors & Header Badge integration
  const filterTabs: Array<{
    key: "all" | "unread" | "read" | "replied";
    label: string;
    count: number;
    activeClass: string;
    inactiveClass: string;
    badgeInactiveClass: string;
  }> = [
    {
      key: "all",
      label: "Semua",
      count: messages.length,
      activeClass: "bg-primary text-white border-primary/40 shadow-md shadow-primary/20",
      inactiveClass: "bg-surface/80 text-muted border-line hover:text-primary hover:bg-surface",
      badgeInactiveClass: "bg-surface border border-line text-primary"
    },
    {
      key: "unread",
      label: "Baru",
      count: unreadCount,
      activeClass: "bg-cyan-600 text-white border-cyan-600/40 shadow-md shadow-cyan-600/20",
      inactiveClass: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20 hover:bg-cyan-500/20",
      badgeInactiveClass: "bg-cyan-500/20 text-cyan-500"
    },
    {
      key: "read",
      label: "Dibaca",
      count: readCount,
      activeClass: "bg-blue-600 text-white border-blue-600/40 shadow-md shadow-blue-600/20",
      inactiveClass: "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20",
      badgeInactiveClass: "bg-blue-500/20 text-blue-500"
    },
    {
      key: "replied",
      label: "Dibalas",
      count: repliedCount,
      activeClass: "bg-emerald-600 text-white shadow-md shadow-emerald-600/20",
      inactiveClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20",
      badgeInactiveClass: "bg-emerald-500/20 text-emerald-500"
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Standar Top Header Card dengan Terintegrasi Interactive Metric Filter Pills */}
      <div className="premium-card p-5 sm:p-6 rounded-3xl border border-line bg-surface shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <motion.div
            whileHover={{ scale: 1.06, rotate: 6 }}
            whileTap={{ scale: 0.94, rotate: 3 }}
            transition={{ type: "spring", stiffness: 450, damping: 18 }}
            className="icon-orbit grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-500 cursor-pointer select-none"
          >
            <Mail className="h-6 w-6" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-black text-primary">Kotak Masuk Pesan Publik</h3>
            </div>
            <p className="text-xs font-bold text-muted mt-0.5">
              Kelola, baca, dan balas pesan dari pengunjung portofolio secara terpusat.
            </p>
          </div>
        </div>

        {/* Dynamic Interactive Filter Pill Badges on Right Header (Gabungan Metrik & Filter) */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto relative z-10">
          {filterTabs.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <MagneticButton key={tab.key} className="w-full sm:w-auto">
                <motion.button
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  whileHover="hover"
                  whileTap="press"
                  variants={{
                    hover: { scale: 1.03, y: -1 },
                    press: { scale: 0.97 }
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={cn(
                    "px-3 sm:px-3.5 py-2 rounded-2xl text-[11px] sm:text-xs font-black transition-all cursor-pointer select-none flex items-center justify-between sm:justify-start gap-2 border w-full sm:w-auto",
                    isActive
                      ? tab.activeClass
                      : tab.inactiveClass
                  )}
                >
                  <span>{tab.label}</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[11px] font-black",
                    isActive
                      ? "bg-white/20 text-white"
                      : tab.badgeInactiveClass
                  )}>
                    {tab.count}
                  </span>
                </motion.button>
              </MagneticButton>
            );
          })}
        </div>
      </div>

      {/* Main Master-Detail Layout (Grid Sejajar 100% dari Atas) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Search Bar + Inbox List Card (5 cols - Responsive Height & 675px Desktop) */}
        <div className="md:col-span-5 premium-card p-4 sm:p-5 rounded-3xl border border-line bg-surface shadow-card flex flex-col gap-3.5 relative overflow-hidden h-[540px] sm:h-[600px] md:h-[675px]">
          {/* Search Input Bar (Fixed at Top) */}
          <div className="relative w-full shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Cari pengirim, email, subjek..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 pr-4 h-[42px] text-xs font-medium w-full rounded-2xl"
            />
          </div>

          {/* Subheader status bar (Fixed at Top) */}
          <div className="flex items-center justify-between px-1 shrink-0">
            <span className="text-[11px] font-black text-muted uppercase tracking-wider">
              {statusFilter === "all"
                ? "Menampilkan Semua Pesan"
                : statusFilter === "unread"
                ? "Menampilkan Pesan Baru"
                : statusFilter === "read"
                ? "Menampilkan Pesan Sudah Dibaca"
                : "Menampilkan Pesan Sudah Dibalas"}
              {" (" + filteredMessages.length + ")"}
            </span>
            <span className="text-[10px] font-bold text-muted">Pilih untuk membaca</span>
          </div>

          {/* Render Kosong atau List Inbox Scrollable */}
          {filteredMessages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-dashed border-line bg-surface/50"
            >
              <Inbox className="h-8 w-8 text-muted mb-2" />
              <h4 className="font-display text-sm font-black text-primary">Tidak Ada Pesan Ditemukan</h4>
              <p className="text-[11px] font-bold text-muted mt-1 leading-relaxed">
                {searchQuery ? "Tidak ada pesan yang cocok dengan pencarian." : "Belum ada pesan kontak dalam kategori ini."}
              </p>
            </motion.div>
          ) : (
            <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 p-1 pr-1.5 scrollbar-thin scrollbar-thumb-line/50 hover:scrollbar-thumb-primary/30">
              {filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                const isUnread = msg.status === "unread";
                const isRead = msg.status === "read";
                const isReplied = msg.status === "replied";

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedMessageId(msg.id)}
                    whileHover={{ scale: 1.006, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      "p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-start gap-3.5 relative overflow-hidden select-none shrink-0",
                      isSelected
                        ? "border-primary bg-primary/10 shadow-md shadow-primary/10 ring-1 ring-primary/30"
                        : isUnread
                        ? "border-cyan-500/40 bg-cyan-500/[0.04] hover:bg-surface/90"
                        : isRead
                        ? "border-blue-500/30 bg-blue-500/[0.02] hover:bg-surface/90"
                        : "border-emerald-500/30 bg-emerald-500/[0.02] hover:bg-surface/90"
                    )}
                  >
                    {/* Avatar Initials Circle */}
                    <div className={cn(
                      "h-10 w-10 rounded-xl grid place-items-center font-display font-black text-xs shrink-0 border shadow-xs transition-colors",
                      isUnread
                        ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-500"
                        : isRead
                        ? "bg-blue-500/15 border-blue-500/30 text-blue-500"
                        : "bg-emerald-500/15 border-emerald-500/30 text-emerald-500"
                    )}>
                      {getInitials(msg.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-black text-primary truncate">
                          {msg.name}
                        </h4>
                        <span className="text-[10px] font-bold text-muted shrink-0">
                          {new Date(msg.timestamp).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </span>
                      </div>

                      <h5 className="text-[11px] font-bold text-primary/90 truncate mt-0.5">
                        {msg.subject}
                      </h5>

                      <p className="text-[11px] font-medium text-muted truncate mt-1">
                        {msg.message}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border",
                          isUnread
                            ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
                            : isRead
                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        )}>
                          {isUnread ? "Baru" : isRead ? "Sudah Dibaca" : "Sudah Dibalas"}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className={cn(
                      "h-4 w-4 my-auto shrink-0 transition-transform",
                      isSelected ? "text-primary translate-x-0.5" : "text-muted/40 opacity-0 group-hover:opacity-100"
                    )} />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Full-Height Reader Panel (7 cols - Sejajar 100% dari Paling Atas Grid) */}
        <div className="md:col-span-7">
          {selectedMessage ? (
            <motion.div
              key={selectedMessage.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="premium-card p-5 sm:p-7 rounded-3xl border border-line bg-surface flex flex-col justify-between gap-6 relative overflow-hidden shadow-card min-h-[500px] md:min-h-[675px]"
            >
              {/* Header Information + Tombol Tutup (Merah Rose) */}
              <div className="flex flex-col gap-4 border-b border-line pb-5 relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className={cn(
                      "h-12 w-12 rounded-2xl grid place-items-center font-display font-black text-sm border shadow-sm",
                      selectedMessage.status === "unread"
                        ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-500"
                        : selectedMessage.status === "read"
                        ? "bg-blue-500/15 border-blue-500/30 text-blue-500"
                        : "bg-emerald-500/15 border-emerald-500/30 text-emerald-500"
                    )}>
                      {getInitials(selectedMessage.name)}
                    </div>
                    <div>
                      <h4 className="font-display text-lg font-black text-primary">{selectedMessage.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <a
                          href={`mailto:${selectedMessage.email}`}
                          className="text-xs font-bold text-muted hover:text-primary transition-colors flex items-center gap-1"
                        >
                          <span>{selectedMessage.email}</span>
                          <CornerUpRight className="h-3 w-3" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyEmail(selectedMessage.email)}
                          className="px-2 py-0.5 rounded-lg border border-line bg-surface/80 hover:bg-primary/10 hover:text-primary text-[10px] font-bold text-muted transition-all flex items-center gap-1 cursor-pointer select-none"
                          title="Salin Alamat Email"
                        >
                          {copiedEmailId === selectedMessage.email ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-500" />
                              <span className="text-emerald-500 font-black">Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Tutup Warna Merah Rose */}
                  <MagneticButton>
                    <motion.button
                      type="button"
                      onClick={() => setSelectedMessageId("")}
                      whileHover="hover"
                      whileTap="press"
                      variants={{
                        hover: { scale: 1.05 },
                        press: { scale: 0.95 }
                      }}
                      className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white text-xs font-black flex items-center gap-1.5 transition-all duration-200 cursor-pointer select-none shadow-xs"
                      title="Tutup Pesan & Kembali ke Tampilan Kosong"
                    >
                      <X className="h-4 w-4 shrink-0" />
                      <span>Tutup</span>
                    </motion.button>
                  </MagneticButton>
                </div>

                {/* Subbar Tanggal & Keterangan Status (Di bawah Panel Tutup) */}
                <div className="flex items-center justify-between pt-3 border-t border-line/60 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-muted">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    {new Date(selectedMessage.timestamp).toLocaleString("id-ID", {
                      dateStyle: "full",
                      timeStyle: "short"
                    })}
                  </span>

                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                    selectedMessage.status === "unread"
                      ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
                      : selectedMessage.status === "read"
                      ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  )}>
                    {selectedMessage.status === "unread" ? "Pesan Baru" : selectedMessage.status === "read" ? "Sudah Dibaca" : "Sudah Dibalas"}
                  </span>
                </div>
              </div>

              {/* Message Subject & Full Body Reading Area */}
              <div className="space-y-3 my-auto relative z-10">
                <h3 className="font-display text-lg font-black text-primary leading-snug">
                  {selectedMessage.subject}
                </h3>
                <div className="soft-card p-5 rounded-2xl border border-line bg-surface/60 text-xs sm:text-sm font-medium leading-relaxed text-primary/90 whitespace-pre-wrap shadow-xs">
                  {selectedMessage.message}
                </div>

                {/* Interactive Quick Reply Drawer */}
                <AnimatePresence mode="wait">
                  {showQuickReply && (
                    <motion.div
                      key="quick-reply-drawer"
                      initial={{ opacity: 0, y: -16, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12, scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 350, damping: 26 }}
                      className="w-full max-w-full p-4 sm:p-5 rounded-2xl border border-primary/30 bg-primary/[0.03] flex flex-col gap-4 shadow-xs box-border overflow-visible"
                    >
                      <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                        <span className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <span>Form Draf Balas Cepat</span>
                        </span>
                        <span className="text-[11px] font-bold text-muted">Pilih draf cepat atau ketik pesan balasan Anda</span>
                      </div>

                      {/* Template Chips (3 Preset Template Single-Line Chips) */}
                      <div className="flex flex-wrap items-center gap-2 w-full pb-1">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            setQuickReplyBody(
                              `Halo ${selectedMessage.name},\n\nTerima kasih banyak telah menghubungi saya melalui situs portofolio resmi saya.\n\nSaya telah membaca dan mempelajari pesan Anda mengenai "${selectedMessage.subject}". Saya sangat menghargai ketertarikan dan waktu yang Anda luangkan untuk menghubungi saya.\n\nPesan Anda telah saya catat dan saya akan dengan senang hati menindaklanjuti serta memberikan tanggapan lebih detail segera setelah jadwal aktivitas saya memungkinkan.\n\nJika ada informasi tambahan atau dokumen pendukung yang ingin Anda sampaikan, Anda juga dapat mengirimkannya langsung ke email ini atau melalui WhatsApp resmi saya di 0851-5851-8090.\n\nTerima kasih sekali lagi atas perhatian dan apresiasi Anda.\n\nSalam hangat dan hormat,\nHajaturrachman\nKandidat Ausbildung Keperawatan Jerman\nWebsite: ${siteConfig.siteUrl}`
                            )
                          }
                          className="px-3 py-1.5 rounded-xl border border-line bg-surface hover:border-primary/40 hover:bg-primary/10 text-xs font-bold text-muted hover:text-primary transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
                        >
                          💬 Draf Terima Kasih
                        </motion.button>

                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            setQuickReplyBody(
                              `Halo ${selectedMessage.name},\n\nTerima kasih yang sebesar-besarnya atas apresiasi, tawaran peluang karir, serta tawaran kolaborasi profesional yang Anda sampaikan melalui portofolio saya.\n\nMengenai hal yang Anda sampaikan perihal "${selectedMessage.subject}", saya sangat tertarik dan menyambut baik potensi kerjasama ini. Saya selalu terbuka untuk mengeksplorasi ide-ide baru, proyek inovatif, serta peluang pengembangan diri dan kontribusi bersama.\n\nUntuk mendiskusikan rencana kolaborasi ini secara lebih komprehensif, saya menyarankan agar kita dapat menjadwalkan sesi diskusi singkat (baik via Google Meet/Zoom maupun WhatsApp Call).\n\nMohon beri tahu saya ketersediaan waktu Anda, atau Anda dapat menghubungi saya langsung melalui WhatsApp di 0851-5851-8090 agar dapat kita cocokkan dengan jadwal bersama.\n\nTerima kasih atas kepercayaan dan tawaran luar biasa ini. Saya sangat menantikan diskusi hangat kita selanjutnya.\n\nSalam hangat,\nHajaturrachman\nKandidat Ausbildung Keperawatan Jerman\nWebsite: ${siteConfig.siteUrl}`
                            )
                          }
                          className="px-3 py-1.5 rounded-xl border border-line bg-surface hover:border-primary/40 hover:bg-primary/10 text-xs font-bold text-muted hover:text-primary transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
                        >
                          💼 Draf Kolaborasi
                        </motion.button>

                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            setQuickReplyBody(
                              `Halo ${selectedMessage.name},\n\nTerima kasih banyak atas pesan dan inisiatif komunikasi Anda perihal "${selectedMessage.subject}".\n\nSaya sangat senang bisa terhubung dengan Anda. Agar diskusi kita dapat berlangsung dengan lebih efisien, terarah, dan fokus, saya menyambut baik rencana untuk mengatur jadwal pertemuan online atau wawancara singkat.\n\nBerikut adalah beberapa opsi slot waktu yang fleksibel bagi saya:\n• Senin – Jumat: 16.00 – 20.00 WIB\n• Sabtu – Minggu: 10.00 – 17.00 WIB (Dengan konfirmasi H-1)\n\nSilakan tentukan waktu dan platform komunikasi yang paling nyaman bagi Anda (WhatsApp Call / Google Meet / Zoom). Anda juga dapat langsung mengonfirmasi jadwal melalui kontak WhatsApp resmi saya di 0851-5851-8090.\n\nTerima kasih atas fleksibilitas Anda. Saya menantikan pertemuan dan perkenalan diskusi kita.\n\nSalam hangat,\nHajaturrachman\nKandidat Ausbildung Keperawatan Jerman\nWebsite: ${siteConfig.siteUrl}`
                            )
                          }
                          className="px-3 py-1.5 rounded-xl border border-line bg-surface hover:border-primary/40 hover:bg-primary/10 text-xs font-bold text-muted hover:text-primary transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
                        >
                          📅 Draf Atur Jadwal
                        </motion.button>
                      </div>

                      {/* Textarea Container Bergaya Rapi (Slider Terbingkai Inset & Gagang Resize Theme Dark Sleek) */}
                      <div
                        className="w-full rounded-2xl border border-line bg-surface/90 p-4 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 shadow-xs relative transition-all"
                        onWheel={(e) => e.stopPropagation()}
                      >
                        <textarea
                          rows={6}
                          value={quickReplyBody}
                          onChange={(e) => setQuickReplyBody(e.target.value)}
                          onWheel={(e) => e.stopPropagation()}
                          placeholder="Tulis draf balasan Anda di sini..."
                          className="w-full bg-transparent text-xs sm:text-sm font-medium leading-relaxed text-primary focus:outline-none resize-y min-h-[140px] max-h-[350px] overflow-y-auto pr-1.5 pb-1.5"
                          style={{ overscrollBehavior: "contain" }}
                        />
                      </div>

                      {/* Action Buttons in Quick Reply */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Button 1: Kirim via Email Client */}
                          <MagneticButton>
                            <button
                              type="button"
                              onClick={() => handleSendViaEmailClient(selectedMessage.email, selectedMessage.subject, quickReplyBody, selectedMessage.id)}
                              className="button-primary focus-ring px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer select-none min-h-0 shadow-md shadow-primary/20"
                            >
                              <Send className="h-4 w-4 shrink-0" />
                              <span>Kirim via Email Client</span>
                            </button>
                          </MagneticButton>

                          {/* Button 2: Salin Teks Balasan */}
                          <MagneticButton>
                            <button
                              type="button"
                              onClick={() => {
                                if (typeof navigator !== "undefined" && navigator.clipboard) {
                                  navigator.clipboard.writeText(quickReplyBody);
                                  setCopyReplyToast(true);
                                  handleSetReadStatus(selectedMessage.id, "replied");
                                  setTimeout(() => setCopyReplyToast(false), 2500);
                                }
                              }}
                              className="button-secondary focus-ring px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer select-none min-h-0"
                            >
                              {copyReplyToast ? <Check className="h-4 w-4 text-emerald-500 shrink-0" /> : <Copy className="h-4 w-4 shrink-0" />}
                              <span>{copyReplyToast ? "Balasan Tersalin!" : "Salin Teks Balasan"}</span>
                            </button>
                          </MagneticButton>
                        </div>

                        {/* Button 3: Kosongkan Draf */}
                        <MagneticButton>
                          <button
                            type="button"
                            onClick={() => setQuickReplyBody("")}
                            disabled={!quickReplyBody}
                            className={cn(
                              "button-secondary-negative focus-ring px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer select-none min-h-0 transition-all",
                              !quickReplyBody && "opacity-50 cursor-not-allowed pointer-events-none"
                            )}
                          >
                            <Trash2 className="h-4 w-4 shrink-0" />
                            <span>Kosongkan Draf</span>
                          </button>
                        </MagneticButton>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Quick Reply & Action Control Panel */}
              <div className="flex flex-col gap-3 border-t border-line pt-5 relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Action 1: Form Balas Cepat */}
                    <MagneticButton>
                      <motion.button
                        type="button"
                        onClick={() => setShowQuickReply(!showQuickReply)}
                        whileHover="hover"
                        whileTap="press"
                        variants={{
                          hover: { scale: 1.02, y: -2 },
                          press: { scale: 0.97 }
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 12 }}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-black transition-all duration-300 focus-ring cursor-pointer select-none",
                          showQuickReply
                            ? "border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white"
                            : "border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-white"
                        )}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{showQuickReply ? "Tutup Form Balas" : "Form Balas Cepat"}</span>
                      </motion.button>
                    </MagneticButton>

                    {/* Action 2: Tandai Dibaca / Belum Dibaca */}
                    <MagneticButton>
                      <motion.button
                        type="button"
                        onClick={() =>
                          handleSetReadStatus(
                            selectedMessage.id,
                            selectedMessage.status === "unread" ? "read" : "unread"
                          )
                        }
                        whileHover="hover"
                        whileTap="press"
                        variants={{
                          hover: { scale: 1.02, y: -2 },
                          press: { scale: 0.97 }
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 12 }}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-2xl border px-3.5 py-2.5 text-xs font-black transition-all duration-300 focus-ring cursor-pointer select-none",
                          selectedMessage.status === "unread"
                            ? "border-blue-500/30 bg-blue-500/10 text-blue-500 hover:bg-blue-600 hover:text-white"
                            : "border-cyan-500/30 bg-cyan-500/10 text-cyan-500 hover:bg-cyan-600 hover:text-white"
                        )}
                      >
                        {selectedMessage.status === "unread" ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        <span>{selectedMessage.status === "unread" ? "Tandai Dibaca" : "Tandai Belum Dibaca"}</span>
                      </motion.button>
                    </MagneticButton>

                    {/* Action 3: Tandai Dibalas */}
                    <MagneticButton>
                      <motion.button
                        type="button"
                        onClick={() =>
                          handleSetReadStatus(
                            selectedMessage.id,
                            selectedMessage.status === "replied" ? "read" : "replied"
                          )
                        }
                        whileHover="hover"
                        whileTap="press"
                        variants={{
                          hover: { scale: 1.02, y: -2 },
                          press: { scale: 0.97 }
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 12 }}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-2xl border px-3.5 py-2.5 text-xs font-black transition-all duration-300 focus-ring cursor-pointer select-none",
                          selectedMessage.status === "replied"
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-600 hover:text-white"
                            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-600 hover:text-white"
                        )}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{selectedMessage.status === "replied" ? "Batal Dibalas" : "Tandai Dibalas"}</span>
                      </motion.button>
                    </MagneticButton>
                  </div>

                  <MagneticButton>
                    <motion.button
                      type="button"
                      onClick={() => handleDeleteMessage(selectedMessage.id)}
                      whileHover="hover"
                      whileTap="press"
                      variants={{
                        hover: { scale: 1.03, y: -2 },
                        press: { scale: 0.95 }
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 12 }}
                      className="p-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                      title="Hapus Pesan Ini"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </motion.button>
                  </MagneticButton>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Tampilan Kosong Default saat Pertama Kali Membuka Tab Pesan / Ditekan Tutup */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="premium-card p-8 rounded-3xl border border-line bg-surface flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden min-h-[675px] shadow-card"
            >
              <div className="icon-orbit grid h-16 w-16 shrink-0 place-items-center rounded-3xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-500 shadow-glow shadow-cyan-500/20">
                <Mail className="h-8 w-8" />
              </div>
              <div>
                <h4 className="font-display text-lg font-black text-primary">Pilih Pesan untuk Membaca</h4>
                <p className="text-xs font-bold text-muted mt-1.5 max-w-sm mx-auto leading-relaxed">
                  Klik salah satu pesan dari daftar di sebelah kiri untuk menampilkan rincian pesan lengkap dan melakukan pembalasan email.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        title="Hapus Pesan Kontak?"
        description="Aksi ini akan menghapus pesan kontak ini secara permanen dari daftar pesan admin."
        confirmLabel="Ya, Hapus Pesan"
        icon={Trash2}
        iconClassName="border-rose-500/30 bg-rose-500/10 text-rose-500 shadow-glow shadow-rose-500/20"
        confirmButtonClassName="button-primary !bg-none !bg-rose-600 hover:!bg-rose-500 active:!bg-rose-700 !text-white shadow-md shadow-rose-600/20"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
