"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, triggerAuthChange } from "../../utils/auth";
import PixelButton from "../../components/PixelButton";
import AdminNotifications from "@/components/AdminNotifications";
const SIDEBAR_BG = "bg-[#0E2A22]";
const SIDEBAR_BORDER = "border-[#1D4A3B]";
const SIDEBAR_PANEL = "bg-white/[0.06]";
const SIDEBAR_PANEL_HOVER = "hover:bg-white/[0.09]";

const PixelIcon = ({ rows, className = "w-4 h-4" }) => {
    const size = rows.length;
    return (
        <svg
            viewBox={`0 0 ${size} ${size}`}
            className={className}
            fill="currentColor"
            shapeRendering="crispEdges"
        >
            {rows.map((row, y) =>
                row.split("").map((cell, x) =>
                    cell === "1" ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} /> : null
                )
            )}
        </svg>
    );
};

const ICONS = {
    dashboard: ["111011101", "111011101", "111011101", "111011101", "000000000", "111011101", "111011101", "111011101", "111011101"],
    analytics: ["000000000", "000000000", "000000110", "000000110", "000110110", "000110110", "110110110", "110110110", "111111111"],
    users: ["000111000", "001111100", "001111100", "001111100", "000111000", "000000000", "011111110", "111111111", "111111111"],
    quest: ["111000000", "111110000", "111111100", "111111110", "111111100", "111110000", "111000000", "111000000", "111000000"],
    team: ["011000110", "011000110", "011000110", "000000000", "111101111", "111101111", "111101111", "011101110", "000000000"],
    broadcast: ["000010000", "000111000", "001000100", "010000010", "000010000", "000010000", "000010000", "000111000", "001111100"],
    logs: ["111111000", "100000000", "111111000", "100000000", "111111000", "100000000", "111111000", "100000000", "111100000"],
    settings: ["000101000", "000101000", "001000100", "111000111", "101011101", "111000111", "001000100", "000101000", "000101000"],
    external: ["000011111", "000000111", "000001101", "000011001", "000110001", "011100000", "111000000", "111000000", "111111111"],
    search: ["001111000", "010000100", "100000010", "100000010", "100000010", "010000100", "001111010", "000000101", "000000010"],
    help: ["001111000", "011001100", "110000110", "110000110", "000001100", "000011000", "000110000", "000000000", "000110000"],
    logout: ["111100000", "100100000", "100100011", "100000001", "100011111", "100000001", "100100011", "100100000", "111100000"],
};

const CollapseIcon = () => (
    <PixelIcon rows={["111111111", "100000001", "101000001", "101000001", "101000001", "101000001", "101000001", "100000001", "111111111"]} className="w-3.5 h-3.5" />
);

const ExpandIcon = () => (
    <PixelIcon rows={["111111111", "100000001", "100000101", "100000101", "100000101", "100000101", "100000101", "100000001", "111111111"]} className="w-3.5 h-3.5" />
);

export default function AdminLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [mounted, setMounted] = useState(false); // Penyelamat dari Hydration Error
    const [search, setSearch] = useState(""); // filter menu, kosmetik & ringan — tidak menyentuh data lain

    const [usersCount, setUsersCount] = useState(0);
    const [questsCount, setQuestsCount] = useState(0);

    useEffect(() => {
        setMounted(true); // Menandakan komponen telah sukses termuat di browser client
        const user = getCurrentUser();
        if (user && user.role?.toLowerCase() === "admin") {
            setIsAdmin(true);
        }

        try {
            const storedUsers = localStorage.getItem("usersList");
            setUsersCount(storedUsers ? JSON.parse(storedUsers).length : 0);
        } catch (e) {
            setUsersCount(0);
        }
        try {
            const storedProjects = localStorage.getItem("projectsList");
            setQuestsCount(storedProjects ? JSON.parse(storedProjects).length : 0);
        } catch (e) {
            setQuestsCount(0);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("currentUser");
        triggerAuthChange();
        router.push("/");
    };

    const menuGroups = [
        {
            label: "KONTROL UTAMA & TELEMETRI",
            items: [
                { name: "DASHBOARD METRICS", path: "/admin", icon: ICONS.dashboard },
                { name: "ANALITIK & LEADERBOARD", path: "/admin/analytics", icon: ICONS.analytics },
            ],
        },
        {
            label: "MODERASI KOMUNITAS & KONTEN",
            items: [
                { name: "DIREKTORI PETUALANG", path: "/admin/users", icon: ICONS.users, badge: usersCount },
                { name: "AUDIT PAPAN QUEST", path: "/admin/quests", icon: ICONS.quest, badge: questsCount },
                { name: "MONITORING TIM & SQUAD", path: "/admin/teams", icon: ICONS.team },
                { name: "MODERASI LINIMASA", path: "/admin/timeline", icon: ICONS.broadcast },
            ],
        },
        {
            label: "SISTEM & PINTASAN",
            items: [
                { name: "LOG AUDIT KEAMANAN", path: "/admin/logs", icon: ICONS.logs, live: true },
                { name: "PENGATURAN SISTEM", path: "/admin/settings", icon: ICONS.settings },
            ],
        },
    ];

    // Filter pencarian jalan lintas grup — grup yang hasilnya kosong otomatis disembunyikan
    const filteredGroups = menuGroups
        .map((group) => ({
            ...group,
            items: search.trim()
                ? group.items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
                : group.items,
        }))
        .filter((group) => group.items.length > 0);

    const totalMatches = filteredGroups.reduce((sum, g) => sum + g.items.length, 0);

    const allMenuItems = menuGroups.flatMap((g) => g.items);
    const activePageLabel =
        allMenuItems.find((item) => item.path === pathname)?.name || "ADMIN CONSOLE";

    // Jembatan SSR: Sebelum ter-mount di browser client, render layar loading netral yang sama di server & client
    if (!mounted) {
        return (
            <div className="min-h-screen bg-retro-black flex items-center justify-center font-pixel text-xs text-retro-gray">
                [BOOTING SECURE CONSOLE...]
            </div>
        );
    }

    // Jika sudah ter-mount di client tetapi ternyata bukan admin, tampilkan layar blokir merah
    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-retro-black flex flex-col items-center justify-center p-6 text-center font-pixel">
                <div className="max-w-md border-4 border-red-600 bg-black p-8 text-red-500 shadow-[6px_6px_0px_0px_rgba(220,38,38,0.5)] flex flex-col gap-6">
                    <h1 className="text-xl animate-pulse">[ACCESS DENIED: LEVEL INSUFFICIENT]</h1>
                    <p className="font-sans text-xs text-retro-gray/80 leading-relaxed">
                        You must be logged in as the Grandmaster Admin to access this restricted control deck.
                    </p>
                    <PixelButton variant="navy" onClick={() => router.push("/login")} className="py-2.5 text-[9px] border-2 border-red-600">
                        [← GO TO GATEKEEPER]
                    </PixelButton>
                </div>
            </div>
        );
    }

    // Jika sudah ter-mount di client dan terbukti admin, tampilkan layout sidebar admin sesungguhnya
    return (
        <div className="min-h-screen flex bg-retro-bg font-sans">

            {/* SIDEBAR KIRI PERMANEN */}
            <aside
                className={`${SIDEBAR_BG} border-r-4 ${SIDEBAR_BORDER} flex flex-col justify-between text-white p-2.5 sticky top-0 h-screen z-10 transition-all duration-300 ease-in-out overflow-y-auto ${isCollapsed ? "w-16 items-center" : "w-56"
                    }`}
            >
                <div className="flex flex-col gap-4 w-full">
                    {/* HEADER: LOGO & TOGGLE BUTTON */}
                    <div
                        className={`flex border-b-2 ${SIDEBAR_BORDER} pb-3 items-center ${isCollapsed ? "flex-col gap-3 justify-center" : "flex-row gap-2 justify-between"
                            }`}
                    >
                        {isCollapsed ? (
                            <Link href="/" className="w-8 h-8 flex items-center justify-center bg-pixel-green text-[#0E2A22] font-pixel text-[10px] border-2 border-white rounded-lg shrink-0">
                                P!
                            </Link>
                        ) : (
                            <Link href="/" className="flex items-center gap-2 min-w-0">
                                <span className="w-8 h-8 shrink-0 flex items-center justify-center bg-pixel-green text-[#0E2A22] font-pixel text-[10px] border-2 border-white rounded-lg">
                                    P!
                                </span>
                                <span className="flex flex-col gap-0.5 min-w-0">
                                    <span className="font-pixel text-[9px] text-pixel-green tracking-wider leading-tight">
                                        PARTYUP! MASTER
                                    </span>
                                    <span className="font-pixel text-[6px] text-retro-gray leading-tight">
                                        [SYSTEMS_CONTROL]
                                    </span>
                                </span>
                            </Link>
                        )}

                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="w-6 h-6 rounded-md bg-white border-2 border-[#0E2A22] text-[#0E2A22] flex items-center justify-center cursor-pointer hover:bg-pixel-green hover:scale-105 active:scale-95 transition-all shadow-sm shrink-0"
                        >
                            {isCollapsed ? <ExpandIcon /> : <CollapseIcon />}
                        </button>
                    </div>

                    {/* SEARCH BAR */}
                    {isCollapsed ? (
                        <button
                            title="Search menu"
                            onClick={() => setIsCollapsed(false)}
                            className="w-8 h-8 flex items-center justify-center bg-white text-[#0E2A22] rounded-lg hover:bg-pixel-green transition-all shrink-0"
                        >
                            <PixelIcon rows={ICONS.search} className="w-3.5 h-3.5" />
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 bg-white text-[#0E2A22] rounded-lg px-2.5 py-2 border-2 border-transparent focus-within:border-pixel-green transition-all">
                            <span className="shrink-0 text-[#0E2A22]/60">
                                <PixelIcon rows={ICONS.search} className="w-3 h-3" />
                            </span>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search menu"
                                className="bg-transparent outline-none font-pixel text-[8px] text-[#0E2A22] placeholder:text-[#0E2A22]/40 w-full min-w-0"
                            />
                        </div>
                    )}

                    {/* Nav Links — label grup "// ..." tidak dirender, cukup
                        garis pemisah tipis antar grup. Nama item tidak
                        truncate, boleh melipat ke baris ke-2. */}
                    <nav className="flex flex-col gap-0.5 w-full">
                        {filteredGroups.map((group, groupIdx) => (
                            <div
                                key={group.label}
                                className={`flex flex-col gap-0.5 w-full ${groupIdx > 0 ? `pt-2 mt-1 border-t ${SIDEBAR_BORDER}` : ""
                                    }`}
                            >
                                {group.items.map((item) => {
                                    const isActive = pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            href={item.path}
                                            title={isCollapsed ? item.name : ""}
                                            className={`relative font-pixel text-[8.5px] p-2 transition-all flex items-center gap-2 rounded-lg ${isCollapsed ? "justify-center w-10 h-10 mx-auto" : "text-left w-full"
                                                } ${isActive
                                                    ? "bg-pixel-green text-[#0E2A22]"
                                                    : `bg-transparent text-retro-gray ${SIDEBAR_PANEL_HOVER} hover:text-white`
                                                }`}
                                        >
                                            {isActive && !isCollapsed && (
                                                <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-3.5 bg-white rounded-full" />
                                            )}
                                            <PixelIcon rows={item.icon} className="w-3.5 h-3.5 shrink-0" />
                                            {!isCollapsed && (
                                                <span className="flex items-center justify-between gap-2 min-w-0 flex-1">
                                                    <span className="leading-snug break-words">{item.name}</span>
                                                    {typeof item.badge === "number" && (
                                                        <span
                                                            className={`font-pixel text-[6px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${isActive
                                                                ? "bg-white text-[#0E2A22]"
                                                                : "bg-pixel-green text-[#0E2A22]"
                                                                }`}
                                                        >
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                    {item.live && (
                                                        <span
                                                            className={`flex items-center gap-1 font-pixel text-[5.5px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${isActive ? "bg-white text-[#0E2A22]" : "bg-red-500/90 text-white"
                                                                }`}
                                                        >
                                                            <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
                                                            LIVE
                                                        </span>
                                                    )}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}

                        {!isCollapsed && totalMatches === 0 && (
                            <span className="font-pixel text-[8px] text-retro-gray/50 px-2 py-2">
                                [NO MATCHES]
                            </span>
                        )}

                        {/* Pintasan Lihat Tampilan Web Publik */}
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            title={isCollapsed ? "View Public Site" : ""}
                            className={`font-pixel text-[8.5px] p-2 rounded-lg border-2 border-dashed border-[#1D4A3B] text-pixel-green hover:bg-white/[0.06] hover:border-pixel-green transition-all flex items-center gap-2 mt-1.5 ${isCollapsed ? "justify-center w-10 h-10 mx-auto" : "w-full"
                                }`}
                        >
                            <PixelIcon rows={ICONS.external} className="w-3.5 h-3.5 shrink-0" />
                            {!isCollapsed && <span className="leading-snug break-words">LIHAT TAMPILAN WEB ➔</span>}
                        </a>
                    </nav>
                </div>

                <div className={`flex flex-col gap-1.5 border-t-2 ${SIDEBAR_BORDER} pt-2.5 w-full ${isCollapsed ? "items-center" : ""}`}>
                    <Link
                        href="/admin/help"
                        title={isCollapsed ? "Help Center" : ""}
                        className={`font-pixel text-[8.5px] p-2 rounded-lg text-retro-gray ${SIDEBAR_PANEL_HOVER} hover:text-white transition-all flex items-center gap-2 ${isCollapsed ? "justify-center w-10 h-10" : "w-full"
                            }`}
                    >
                        <PixelIcon rows={ICONS.help} className="w-3.5 h-3.5 shrink-0" />
                        {!isCollapsed && <span>HELP CENTER</span>}
                    </Link>

                    <div
                        className={`flex items-center gap-2 ${SIDEBAR_PANEL} rounded-lg p-2 mt-0.5 ${isCollapsed ? "w-10 h-10 justify-center" : "w-full"
                            }`}
                    >
                        <div className="w-6.5 h-6.5 shrink-0 rounded-full bg-pixel-green text-[#0E2A22] font-pixel text-[8px] font-bold flex items-center justify-center">
                            A
                        </div>
                        {!isCollapsed && (
                            <>
                                <div className="text-left leading-tight min-w-0 flex-1">
                                    <p className="font-pixel text-[7.5px] text-white leading-tight">GM_ADMIN</p>
                                    <p className="font-pixel text-[6px] text-pixel-green leading-tight">LV.99 OWNER</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    title="Exit System"
                                    className="w-6 h-6 shrink-0 rounded-md bg-red-600 hover:bg-red-700 text-white flex items-center justify-center cursor-pointer transition-all"
                                >
                                    <PixelIcon rows={ICONS.logout} className="w-3.5 h-3.5" />
                                </button>
                            </>
                        )}
                    </div>

                    {isCollapsed && (
                        <button
                            onClick={handleLogout}
                            title="Exit System"
                            className="w-8 h-8 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center cursor-pointer transition-all"
                        >
                            <PixelIcon rows={ICONS.logout} className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </aside>

            {/* VIEWPORT KONTEN UTAMA */}
            <div className="flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300">
                <header className="sticky top-0 z-20 bg-[#0b1220]/95 backdrop-blur-md border-b-2 border-[#1D4A3B] px-5 md:px-8 py-3 flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-pixel text-[6.5px] text-retro-gray/60 tracking-widest">
                            // ADMIN CONSOLE
                        </span>
                        <span className="font-pixel text-[11px] text-white truncate">
                            {activePageLabel}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Link
                            href="/admin/help"
                            title="Help Center"
                            className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-retro-gray hover:text-white flex items-center justify-center transition-all"
                        >
                            <PixelIcon rows={ICONS.help} className="w-3.5 h-3.5" />
                        </Link>

                        <AdminNotifications />

                        <div className="w-px h-6 bg-[#1D4A3B] mx-1 hidden sm:block" />

                        {/* Akun admin ringkas — pojok kanan atas, ada di SETIAP
                            halaman lewat topbar ini (bukan cuma di sidebar) */}
                        <div className="flex items-center gap-2 bg-white/[0.06] rounded-lg pl-1.5 pr-2 py-1.5">
                            <div className="w-6.5 h-6.5 shrink-0 rounded-full bg-pixel-green text-[#0E2A22] font-pixel text-[8px] font-bold flex items-center justify-center">
                                A
                            </div>
                            <div className="text-left leading-tight hidden sm:block">
                                <p className="font-pixel text-[7.5px] text-white leading-tight">GM_ADMIN</p>
                                <p className="font-pixel text-[6px] text-pixel-green leading-tight">LV.99 OWNER</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                title="Exit System"
                                className="w-6 h-6 shrink-0 rounded-md bg-red-600 hover:bg-red-700 text-white flex items-center justify-center cursor-pointer transition-all ml-0.5"
                            >
                                <PixelIcon rows={ICONS.logout} className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>

        </div>
    );
}