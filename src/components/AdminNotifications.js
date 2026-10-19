"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const SEEN_KEY = "adminNotifSeen";

const PixelIcon = ({ rows, className = "w-3.5 h-3.5" }) => {
    const size = rows.length;
    return (
        <svg viewBox={`0 0 ${size} ${size}`} className={className} fill="currentColor" shapeRendering="crispEdges">
            {rows.map((row, y) =>
                row.split("").map((cell, x) =>
                    cell === "1" ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} /> : null
                )
            )}
        </svg>
    );
};

const ICONS = {
    bell: ["000010000", "001111100", "011111110", "011111110", "011111110", "011111110", "111111111", "000000000", "000111000"],
    quest: ["111000000", "111110000", "111111100", "111111110", "111111100", "111110000", "111000000", "111000000", "111000000"],
    user: ["000111000", "001111100", "001111100", "001111100", "000111000", "000000000", "011111110", "111111111", "111111111"],
    post: ["111111111", "100000001", "101111101", "100000001", "101111101", "100000001", "101111101", "100000001", "111111111"],
    ban: ["001111100", "011000110", "110001011", "110010011", "110100011", "111000011", "011000110", "001111100", "000000000"],
};

// Gaya per tipe notifikasi: warna kotak ikon + tujuan halaman admin
const TYPE_STYLE = {
    quest: { box: "bg-pixel-green/20 text-pixel-green", href: "/admin/quests" },
    user: { box: "bg-sky-400/20 text-sky-300", href: "/admin/users" },
    post: { box: "bg-yellow-400/20 text-yellow-300", href: "/admin/timeline" },
    ban: { box: "bg-red-500/20 text-red-400", href: "/admin/users" },
};

const readList = (key) => {
    try {
        const raw = localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
};

const timeAgo = (iso) => {
    const t = new Date(iso).getTime();
    if (!iso || Number.isNaN(t)) return "";
    const diff = Math.max(0, Date.now() - t);
    const min = Math.floor(diff / 60000);
    if (min < 1) return "baru saja";
    if (min < 60) return `${min} mnt lalu`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} jam lalu`;
    return `${Math.floor(hr / 24)} hari lalu`;
};

// Susun daftar notifikasi dari data lokal
const buildNotifications = () => {
    const list = [];

    const projects = readList("projectsList");
    const users = readList("usersList");
    const posts = readList("timelinePosts");

    // 1) Quest terbaru (maks 3) + penanda jika belum terverifikasi
    [...projects]
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .slice(0, 3)
        .forEach((p) => {
            list.push({
                id: `quest-${p.project_id || p.id || p.title}`,
                type: "quest",
                title: p.is_verified === false ? "Quest menunggu verifikasi" : "Quest baru diterbitkan",
                desc: p.title || "Quest tanpa judul",
                time: timeAgo(p.created_at),
            });
        });

    // 2) Petualang terbaru yang mendaftar (anggota terakhir di daftar)
    const lastUser = users[users.length - 1];
    if (lastUser) {
        list.push({
            id: `user-${lastUser.user_id || lastUser.name}`,
            type: "user",
            title: "Petualang baru bergabung",
            desc: `${lastUser.name || "Tanpa nama"}${lastUser.role ? ` · ${lastUser.role}` : ""}`,
            time: "",
        });
    }

    // 3) Broadcast / artikel timeline terbaru
    if (posts[0]) {
        list.push({
            id: `post-${posts[0].id}`,
            type: "post",
            title: "Broadcast timeline terbaru",
            desc: posts[0].title || "Tanpa judul",
            time: posts[0].timestamp || "",
        });
    }

    // 4) Ringkasan akun diblokir (id memuat jumlah, jadi muncul lagi bila jumlahnya berubah)
    const banned = users.filter((u) => u.isBanned).length;
    if (banned > 0) {
        list.push({
            id: `banned-${banned}`,
            type: "ban",
            title: "Akun sedang diblokir",
            desc: `${banned} akun perlu ditinjau`,
            time: "",
        });
    }

    return list.slice(0, 8);
};

export default function AdminNotifications() {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [seen, setSeen] = useState([]);
    const wrapRef = useRef(null);

    const refresh = useCallback(() => {
        setItems(buildNotifications());
        setSeen(readList(SEEN_KEY));
    }, []);

    // Muat saat mount + ikuti perubahan data dari halaman lain
    useEffect(() => {
        refresh();
        const events = ["projects-change", "auth-change", "storage"];
        events.forEach((ev) => window.addEventListener(ev, refresh));
        return () => events.forEach((ev) => window.removeEventListener(ev, refresh));
    }, [refresh]);

    // Tutup saat klik di luar panel atau tekan Escape
    useEffect(() => {
        if (!open) return;
        const onClickOutside = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("mousedown", onClickOutside);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClickOutside);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const persistSeen = (next) => {
        const trimmed = next.slice(-200);
        setSeen(trimmed);
        try {
            localStorage.setItem(SEEN_KEY, JSON.stringify(trimmed));
        } catch (e) { }
    };

    const markOne = (id) => {
        if (!seen.includes(id)) persistSeen([...seen, id]);
    };

    const markAll = () => {
        persistSeen(Array.from(new Set([...seen, ...items.map((n) => n.id)])));
    };

    const unread = items.filter((n) => !seen.includes(n.id)).length;

    return (
        <div className="relative" ref={wrapRef}>
            <button
                type="button"
                title="Notifikasi"
                aria-label="Notifikasi"
                aria-expanded={open}
                onClick={() => {
                    if (!open) refresh();
                    setOpen((v) => !v);
                }}
                className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${open
                    ? "bg-pixel-green text-[#0E2A22]"
                    : "bg-white/[0.06] hover:bg-white/[0.12] text-retro-gray hover:text-white"
                    }`}
            >
                <PixelIcon rows={ICONS.bell} className="w-3.5 h-3.5" />
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white font-pixel text-[6px] font-bold flex items-center justify-center border-2 border-[#0b1220]">
                        {unread > 9 ? "9+" : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-1.5rem)] bg-[#0E2A22] border-2 border-[#1D4A3B] rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 overflow-hidden">
                    {/* Header panel */}
                    <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b-2 border-[#1D4A3B]">
                        <div className="flex items-center gap-2">
                            <span className="font-pixel text-[9px] text-white">NOTIFIKASI</span>
                            {unread > 0 && (
                                <span className="font-pixel text-[6px] font-bold bg-pixel-green text-[#0E2A22] px-1.5 py-0.5 rounded-full">
                                    {unread} BARU
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={markAll}
                            disabled={unread === 0}
                            className="font-pixel text-[6.5px] text-pixel-green hover:text-white disabled:text-retro-gray/40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                            TANDAI SEMUA DIBACA
                        </button>
                    </div>

                    {/* Daftar notifikasi */}
                    <div className="max-h-80 overflow-y-auto">
                        {items.length === 0 ? (
                            <p className="font-pixel text-[8px] text-retro-gray/60 text-center px-3 py-8">
                                [TIDAK ADA NOTIFIKASI]
                            </p>
                        ) : (
                            items.map((n) => {
                                const style = TYPE_STYLE[n.type];
                                const isUnread = !seen.includes(n.id);
                                return (
                                    <Link
                                        key={n.id}
                                        href={style.href}
                                        onClick={() => {
                                            markOne(n.id);
                                            setOpen(false);
                                        }}
                                        className={`flex items-start gap-2.5 px-3 py-2.5 border-b border-[#1D4A3B]/70 last:border-b-0 transition-colors hover:bg-white/[0.08] ${isUnread ? "bg-white/[0.04]" : ""
                                            }`}
                                    >
                                        <span className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center ${style.box}`}>
                                            <PixelIcon rows={ICONS[n.type]} className="w-3.5 h-3.5" />
                                        </span>
                                        <span className="flex flex-col gap-0.5 min-w-0 flex-1 text-left">
                                            <span className="font-pixel text-[7.5px] text-white leading-snug">{n.title}</span>
                                            <span className="font-sans text-[10.5px] text-retro-gray leading-snug truncate">{n.desc}</span>
                                            {n.time && (
                                                <span className="font-pixel text-[6px] text-retro-gray/50">{n.time}</span>
                                            )}
                                        </span>
                                        {isUnread && <span className="w-1.5 h-1.5 mt-1 shrink-0 rounded-full bg-pixel-green" />}
                                    </Link>
                                );
                            })
                        )}
                    </div>

                    {/* Footer panel */}
                    <Link
                        href="/admin/logs"
                        onClick={() => setOpen(false)}
                        className="block text-center font-pixel text-[7px] text-pixel-green hover:bg-white/[0.06] py-2.5 border-t-2 border-[#1D4A3B] transition-colors"
                    >
                        LIHAT LOG AUDIT KEAMANAN ➔
                    </Link>
                </div>
            )}
        </div>
    );
}