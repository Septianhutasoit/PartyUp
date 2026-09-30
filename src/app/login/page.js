"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import usersData from "../../data/users.json";
import PixelAvatar from "../../components/PixelAvatar";
import { getStoredUsers } from "../../utils/auth";
import { useLanguage } from "../../utils/lang";

// DAFTAR PINTASAN AKUN DEMO UNTUK PENGUJIAN JURI
const DEMO_PERSONAS = [
  {
    name: "Joice",
    role: "UI/UX Designer",
    tag: "Ketua Tim (Leader)",
    avatar: "🎨",
    password: "party2026",
  },
  {
    name: "Alex",
    role: "Full-stack Developer",
    tag: "Pelamar Tim (Applicant)",
    avatar: "💻",
    password: "party2026",
  },
  {
    name: "Sarah",
    role: "Product Manager",
    tag: "Scrum Master",
    avatar: "📊",
    password: "party2026",
  },
  {
    name: "Admin",
    role: "Guild Master",
    tag: "Moderator Panel",
    avatar: "👑",
    password: "admin",
  },
];

const ROLE_THEME = {
  hacker: { accent: "#22c55e", ring: "border-emerald-400", label: "Hacker" },
  hipster: { accent: "#f97316", ring: "border-orange-400", label: "Hipster" },
  hustler: { accent: "#38bdf8", ring: "border-sky-400", label: "Hustler" },
  admin: { accent: "#facc15", ring: "border-yellow-400", label: "Guild Master" },
};
const DEFAULT_THEME = { accent: "#94a3b8", ring: "border-slate-400", label: "Adventurer" };

function getRoleTheme(role) {
  const key = (role || "").toLowerCase();
  return ROLE_THEME[key] || DEFAULT_THEME;
}

function RoleAvatarIcon({ role, className = "" }) {
  const key = (role || "").toLowerCase();

  if (key === "admin") {
    return (
      <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: "pixelated" }}>
        <rect x="7" y="8" width="10" height="9" fill="#ffd8b0" />
        <rect x="6" y="5" width="12" height="2.5" fill="#facc15" />
        <rect x="6" y="2" width="2.5" height="3.5" fill="#facc15" />
        <rect x="10.75" y="1" width="2.5" height="4.5" fill="#facc15" />
        <rect x="15.5" y="2" width="2.5" height="3.5" fill="#facc15" />
        <rect x="11" y="3" width="2" height="2" fill="#ef4444" />
        <rect x="9.5" y="12" width="1.5" height="1.5" fill="#1b263b" />
        <rect x="13" y="12" width="1.5" height="1.5" fill="#1b263b" />
        <rect x="10" y="15" width="4" height="1" fill="#c2410c" opacity="0.7" />
      </svg>
    );
  }

  if (key === "hacker") {
    return (
      <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: "pixelated" }}>
        <rect x="5" y="3" width="14" height="8" fill="#1b263b" />
        <rect x="7" y="8" width="10" height="8" fill="#ffd8b0" />
        <rect x="8" y="10.5" width="8" height="2" fill="#22c55e" />
        <rect x="9.5" y="14" width="5" height="1" fill="#c2410c" opacity="0.6" />
      </svg>
    );
  }

  if (key === "hipster") {
    return (
      <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: "pixelated" }}>
        <rect x="7" y="7" width="10" height="9" fill="#ffd8b0" />
        <rect x="6" y="3" width="12" height="4.5" fill="#f97316" />
        <rect x="6" y="7" width="12" height="1.5" fill="#fdba74" />
        <rect x="8" y="10.5" width="3" height="3" fill="none" stroke="#1b263b" strokeWidth="1" />
        <rect x="13" y="10.5" width="3" height="3" fill="none" stroke="#1b263b" strokeWidth="1" />
        <rect x="11" y="11.5" width="2" height="1" fill="#1b263b" />
        <rect x="9.5" y="14" width="5" height="1" fill="#c2410c" opacity="0.6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: "pixelated" }}>
      <rect x="7" y="6.5" width="10" height="9" fill="#ffd8b0" />
      <rect x="6" y="3" width="12" height="4" fill="#3b2415" />
      <rect x="15" y="6" width="2" height="3" fill="#3b2415" />
      <rect x="9.5" y="11" width="1.5" height="1.5" fill="#1b263b" />
      <rect x="13" y="11" width="1.5" height="1.5" fill="#1b263b" />
      <rect x="10.5" y="15.5" width="3" height="4" fill="#0f172a" />
      <rect x="10.5" y="15.5" width="3" height="1.5" fill="#38bdf8" />
    </svg>
  );
}

// Menggunakan PixelAvatar yang sama persis dengan halaman Profile!
function AccountAvatar({ account, className = "" }) {
  return (
    <div className={`flex items-center justify-center bg-retro-black ${className}`}>
      <PixelAvatar role={account.role} size="w-full h-full" />
    </div>
  );
}

export default function Login() {
  const router = useRouter();
  const { lang } = useLanguage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State Toggle Ikon Mata
  const [error, setError] = useState("");
  const [usersList, setUsersList] = useState(usersData);

  const fullSpeechText =
    lang === "ID" ? "Masuk untuk melanjutkan perjalanan party-mu~" : "Log in to resume your party journey~";
  const [displayedSpeech, setDisplayedSpeech] = useState("");

  // Sinkronisasi data user (mengambil akun bawaan + akun baru yang didaftarkan)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = getStoredUsers();
      if (stored && stored.length > 0) {
        setUsersList(stored);
      }
    }
  }, []);

  // Efek ketik ulang otomatis setiap kali bahasa di-toggle
  useEffect(() => {
    let index = 0;
    setDisplayedSpeech("");
    const typingTimer = setInterval(() => {
      if (index < fullSpeechText.length) {
        setDisplayedSpeech(fullSpeechText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typingTimer);
      }
    }, 40);

    return () => clearInterval(typingTimer);
  }, [fullSpeechText]);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setError("");

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setError(lang === "ID" ? "MASUKKAN NAMA ADVENTURER-MU!" : "ENTER YOUR ADVENTURER NAME!");
      return;
    }

    // Mencari user di daftar dinamis (nama atau user_id)
    const matchedUser = usersList.find(
      (u) =>
        u.name.toLowerCase() === cleanUser ||
        u.user_id.toLowerCase() === cleanUser
    );

    if (!matchedUser) {
      setError(
        lang === "ID"
          ? "ADVENTURER TIDAK DITEMUKAN DI DATABASE GUILD!"
          : "ADVENTURER NOT FOUND IN GUILD DATABASE!"
      );
      return;
    }

    // Password akun: mengambil dari objek user atau default
    const expectedPassword = matchedUser.password || `${matchedUser.name.toLowerCase()}123`;
    if (cleanPass !== expectedPassword && cleanPass !== "party2026" && cleanPass !== "admin") {
      setError(
        lang === "ID"
          ? `PASSWORD SALAH! Kata sandi akun ${matchedUser.name} adalah '${expectedPassword}'`
          : `INCORRECT PASSWORD! Password for ${matchedUser.name} is '${expectedPassword}'`
      );
      return;
    }

    try {
      localStorage.setItem("isLoggedOut", "false");
      localStorage.setItem("currentUser", JSON.stringify(matchedUser));
      window.dispatchEvent(new Event("auth-change"));

      if (matchedUser.role?.toLowerCase() === "admin" || matchedUser.user_id === "USR-000") {
        router.push("/admin");
      } else {
        router.push("/profile");
      }
    } catch (err) {
      console.error("Local storage error:", err);
      setError(lang === "ID" ? "LOCAL STORAGE DIBLOKIR OLEH BROWSER!" : "LOCAL STORAGE BLOCKED BY BROWSER!");
    }
  };

  // AUTO-FILL CEPAT SAAT KARTU DEMO DIKLIK JURI
  const handleSelectDemoPersona = (persona) => {
    const matched = usersList.find((u) => u.name.toLowerCase() === persona.name.toLowerCase());
    const pass = matched?.password || persona.password || "party2026";
    setUsername(persona.name);
    setPassword(pass);
    setError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin(e);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#08091a] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden select-none selection:bg-yellow-400 selection:text-black">

      {/* Background Pixel Stars & GIF Latar Belakang */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70 z-0 pointer-events-none"
        style={{ backgroundImage: "url('/bglogin.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#08091a]/80 via-transparent to-[#08091a] z-0 pointer-events-none" />

      {/* Tombol Escape Kembali ke Home */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 font-pixel text-[9px] text-white hover:text-yellow-300 flex items-center gap-2 transition-colors border-2 border-retro-black px-3 py-1.5 bg-[#121b2d] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
      >
        {lang === "ID" ? "[← KEMBALI KE KOTA]" : "[← ESCAPE TO TOWN]"}
      </Link>

      <div className="max-w-md w-full flex flex-col items-center gap-3 relative z-10 my-8">

        {/* Container Maskot & Speech Bubble */}
        <div className="flex items-center gap-3 mb-2">
          <div className="relative w-24 h-24 shrink-0">
            <Image
              src="/Pikachu.gif"
              alt="Pikachu Mascot"
              fill
              unoptimized
              priority
              className="object-contain drop-shadow-[2px_4px_0px_rgba(0,0,0,0.9)]"
            />
          </div>

          <div className="relative bg-white text-retro-black font-pixel text-[10px] md:text-[11px] py-3 px-4 border-2 border-retro-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-[260px] h-[48px] flex items-center justify-start text-left shrink-0">
            <span>
              {displayedSpeech}
              <span className="animate-pulse font-bold text-yellow-500">|</span>
            </span>
            <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent" />
          </div>
        </div>

        {/* LOGIN WHITE CARD CONTAINER */}
        <div className="w-full bg-white text-retro-black border-4 border-retro-black rounded-2xl p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-5 text-left">

          {error && (
            <div className="bg-red-100 text-red-700 font-pixel text-[8px] p-2 border-2 border-red-600 text-center animate-shake">
              [{lang === "ID" ? "PERINGATAN" : "WARNING"}: {error}]
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Input Nama Petualang Bebas (Bisa akun lama & akun baru) */}
            <div className="flex flex-col gap-1">
              <label className="font-pixel text-[8px] text-gray-600">
                {lang === "ID" ? "NAMA ADVENTURER / USERNAME" : "ADVENTURER NAME / USERNAME"}
              </label>
              <input
                type="text"
                required
                placeholder={lang === "ID" ? "Ketik nama karakter (cth. Joice, Alex)..." : "Type adventurer name (e.g. Joice, Alex)..."}
                value={username}
                onKeyDown={handleKeyDown}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                className="font-sans text-xs p-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg focus:border-retro-black focus:outline-none"
              />
            </div>

            {/* Input Password dengan Toggle Ikon Mata Tetap Aktif */}
            <div className="flex flex-col gap-1">
              <label className="font-pixel text-[8px] text-gray-600">
                {lang === "ID" ? "KUNCI KEAMANAN / PASSWORD" : "SECURITY KEY / PASSWORD"}
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  name="guild-demo-password"
                  placeholder="••••••••"
                  value={password}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  autoComplete="current-password"
                  className="w-full font-sans text-xs p-2.5 pr-10 bg-slate-50 border-2 border-slate-300 rounded-lg focus:border-retro-black focus:outline-none"
                />

                {/* Tombol Ikon Mata */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 p-1 text-gray-500 hover:text-retro-black cursor-pointer border-none bg-transparent transition-colors"
                  title={
                    showPassword
                      ? (lang === "ID" ? "Sembunyikan Password" : "Hide Password")
                      : (lang === "ID" ? "Tampilkan Password" : "Show Password")
                  }
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.32 1.22-.8 1.6l2.12 2.12c1.07-1.02 1.95-2.27 2.58-3.72-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.17c0-1.66-1.34-3-3-3l-.17.02z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Tombol Primary Masuk (Sekarang Dinamis Berdasarkan Teks Input) */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={!username.trim() || !password.trim()}
              className="w-full font-pixel text-xs py-3 bg-navy-blue hover:bg-navy-light text-white font-bold border-2 border-retro-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer active:translate-y-[1px] transition-all mt-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-navy-blue"
            >
              {lang === "ID" ? "Masuk ▶" : "Log in ▶"}
            </button>

            {/* ✦ BILAH PINTASAN PENGUJIAN JURI (1-CLICK AUTO-FILL) ✦ */}
            <div className="border-t-2 border-dashed border-slate-200 pt-3 mt-1 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[7.5px] text-yellow-600 uppercase tracking-wider">
                  {lang === "ID" ? "⚡ PINTASAN AKUN DEMO JURI:" : "⚡ JURY DEMO PERSONAS:"}
                </span>
                <span className="font-pixel text-[7px] bg-slate-100 text-slate-500 border border-slate-300 px-1.5 py-0.5 rounded">
                  1-KLIK ISI
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {DEMO_PERSONAS.map((persona) => (
                  <button
                    type="button"
                    key={persona.name}
                    onClick={() => handleSelectDemoPersona(persona)}
                    className="flex flex-col items-center justify-center p-2 bg-slate-50 hover:bg-yellow-50 border-2 border-slate-300 hover:border-yellow-500 rounded-xl transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,0.06)] active:translate-y-[1px] group text-center"
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">{persona.avatar}</span>
                    <span className="font-pixel text-[8px] text-retro-black font-bold mt-0.5">{persona.name}</span>
                    <span className="font-sans text-[7.5px] text-slate-400 truncate w-full">{persona.tag}</span>
                  </button>
                ))}
              </div>
              <p className="font-sans text-[9.5px] text-slate-400 text-center italic">
                {lang === "ID"
                  ? "*Klik salah satu kartu di atas untuk auto-fill data akun."
                  : "*Click any card above to auto-fill account credentials."}
              </p>
            </div>
          </div>

          {/* Sign Up & Reset Password Links */}
          <div className="text-center border-t border-slate-200 pt-4 pb-1 flex flex-col relative z-20">
            <p className="font-sans text-xs text-gray-500">
              {lang === "ID" ? "Belum punya akun?" : "Need an account?"}{" "}
              <Link
                href="/register"
                className="font-pixel text-[9px] text-navy-blue font-bold hover:underline pl-1 cursor-pointer inline-block relative z-20"
              >
                {lang === "ID" ? "Daftar >" : "Sign up >"}
              </Link>
            </p>

            <p className="font-sans text-xs text-gray-500 mt-2.5">
              {lang === "ID" ? "Lupa kunci keamanan?" : "Lost security key?"}{" "}
              <Link
                href="/forgot-password"
                className="font-pixel text-[9px] text-navy-blue font-bold hover:underline pl-1 cursor-pointer inline-block relative z-20"
              >
                {lang === "ID" ? "Reset Password >" : "Reset Password >"}
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}