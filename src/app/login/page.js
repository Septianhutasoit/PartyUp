"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import usersData from "../../data/users.json";
import { getStoredUsers, isAdmin } from "../../utils/auth";
import { useLanguage } from "../../utils/lang";

// AKUN DEMO KHUSUS PENGUJIAN JURI (TERLIPAT SECARA DEFAULT)
const DEMO_PERSONAS = [
  {
    name: "Joice",
    role: "UI/UX Designer",
    tagId: "Ketua Tim",
    tagEn: "Team Leader",
    avatar: "🎨",
    password: "party2026",
  },
  {
    name: "Alex",
    role: "Full-stack Developer",
    tagId: "Pelamar Tim",
    tagEn: "Applicant",
    avatar: "💻",
    password: "party2026",
  },
  {
    name: "Admin",
    role: "Guild Master",
    tagId: "Panel Admin",
    tagEn: "Admin Master",
    avatar: "👑",
    password: "admin",
  },
];

export default function Login() {
  const router = useRouter();
  const { lang } = useLanguage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [usersList, setUsersList] = useState(usersData);
  const [showDemoSection, setShowDemoSection] = useState(false); // Terlipat rapi secara default

  const fullSpeechText =
    lang === "ID" ? "Masuk untuk melanjutkan perjalanan party-mu~" : "Log in to resume your party journey~";
  const [displayedSpeech, setDisplayedSpeech] = useState("");

  // Sinkronisasi data user lokal (membaca akun bawaan + akun baru yang dibuat)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = getStoredUsers();
      if (stored && stored.length > 0) {
        setUsersList(stored);
      }
    }
  }, []);

  // Animasi ketik ucapan maskot
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

  // Eksekusi Login (Mendukung Akun Baru Seperti Jeanne & Akun Admin)
  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setError("");

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setError(lang === "ID" ? "MASUKKAN NAMA ADVENTURER-MU!" : "ENTER YOUR ADVENTURER NAME!");
      return;
    }

    // Mencari user di database lokal berdasarkan nama atau user_id
    const matchedUser = usersList.find(
      (u) =>
        u.name.toLowerCase() === cleanUser ||
        u.user_id.toLowerCase() === cleanUser
    );

    if (!matchedUser) {
      setError(
        lang === "ID"
          ? "ADVENTURER TIDAK DITEMUKAN! PASTIKAN NAMA SUDAH SESUAI DENGAN YANG DIDAFTARKAN."
          : "ADVENTURER NOT FOUND! PLEASE CHECK YOUR REGISTERED USERNAME."
      );
      return;
    }

    // Pengecekan Password Akun
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

      // Jika yang login adalah Admin (USR-000), otomatis lempar ke /admin
      if (matchedUser.role?.toLowerCase() === "admin" || matchedUser.user_id === "USR-000") {
        router.push("/admin");
      } else {
        router.push("/profile");
      }
    } catch (err) {
      console.error("Local storage error:", err);
      setError(lang === "ID" ? "LOCAL STORAGE DIBLOKIR BROWSER!" : "LOCAL STORAGE BLOCKED BY BROWSER!");
    }
  };

  // Auto-fill dari Kartu Demo Juri
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

      {/* Background Retro */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70 z-0 pointer-events-none"
        style={{ backgroundImage: "url('/bglogin.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#08091a]/80 via-transparent to-[#08091a] z-0 pointer-events-none" />

      {/* Tombol Escape Kembali ke Home */}
      <Link
        href="/"
        className="absolute top-4 left-4 md:top-6 md:left-6 z-20 font-pixel text-[8.5px] text-white hover:text-yellow-300 flex items-center gap-1.5 transition-colors border-2 border-retro-black px-2.5 py-1 bg-[#121b2d] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
      >
        {lang === "ID" ? "[← KEMBALI KE KOTA]" : "[← ESCAPE TO TOWN]"}
      </Link>

      <div className="max-w-md w-full flex flex-col items-center gap-2.5 relative z-10 my-4 md:my-6">

        {/* Maskot Pikachu & Balon Ucapan */}
        <div className="flex items-center gap-2.5 mb-1">
          <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0">
            <Image
              src="/Pikachu.gif"
              alt="Pikachu Mascot"
              fill
              unoptimized
              priority
              className="object-contain drop-shadow-[2px_3px_0px_rgba(0,0,0,0.9)]"
            />
          </div>

          <div className="relative bg-white text-retro-black font-pixel text-[9px] md:text-[10px] py-2 px-3.5 border-2 border-retro-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] w-[240px] md:w-[260px] h-[42px] flex items-center justify-start text-left shrink-0">
            <span>
              {displayedSpeech}
              <span className="animate-pulse font-bold text-yellow-500">|</span>
            </span>
            <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-r-6 border-r-white border-b-6 border-b-transparent" />
          </div>
        </div>

        {/* CARD CONTAINER UTAMA (BERSIH & PROFESIONAL) */}
        <div className="w-full bg-white text-retro-black border-4 border-retro-black rounded-2xl p-5 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-3.5 text-left">

          {error && (
            <div className="bg-red-100 text-red-700 font-pixel text-[8px] p-2 border-2 border-red-600 text-center animate-shake rounded">
              [{lang === "ID" ? "PERINGATAN" : "WARNING"}: {error}]
            </div>
          )}

          <div className="flex flex-col gap-3">
            {/* Input Nama Petualang Asli */}
            <div className="flex flex-col gap-1">
              <label className="font-pixel text-[7.5px] text-gray-600">
                {lang === "ID" ? "NAMA ADVENTURER / USERNAME" : "ADVENTURER NAME / USERNAME"}
              </label>
              <input
                type="text"
                required
                placeholder={lang === "ID" ? "Masukkan nama karaktermu..." : "Enter character name..."}
                value={username}
                onKeyDown={handleKeyDown}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                className="font-sans text-xs p-2 bg-slate-50 border-2 border-slate-300 rounded-lg focus:border-retro-black focus:outline-none"
              />
            </div>

            {/* Input Password */}
            <div className="flex flex-col gap-1">
              <label className="font-pixel text-[7.5px] text-gray-600">
                {lang === "ID" ? "KUNCI KEAMANAN / PASSWORD" : "SECURITY KEY / PASSWORD"}
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  name="guild-password"
                  placeholder="••••••••"
                  value={password}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  autoComplete="current-password"
                  className="w-full font-sans text-xs p-2 pr-9 bg-slate-50 border-2 border-slate-300 rounded-lg focus:border-retro-black focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 p-1 text-gray-500 hover:text-retro-black cursor-pointer border-none bg-transparent transition-colors"
                  title={showPassword ? "Hide" : "Show"}
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

            {/* Tombol Masuk */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={!username.trim() || !password.trim()}
              className="w-full font-pixel text-xs py-2.5 bg-navy-blue hover:bg-navy-light text-white font-bold border-2 border-retro-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer active:translate-y-[1px] transition-all mt-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-navy-blue"
            >
              {lang === "ID" ? "Masuk ▶" : "Log in ▶"}
            </button>
          </div>

          {/* Links Navigasi Standar */}
          <div className="text-center border-t border-slate-200 pt-2.5 flex flex-col gap-1">
            <p className="font-sans text-[11px] text-gray-500">
              {lang === "ID" ? "Belum punya akun?" : "Need an account?"}{" "}
              <Link
                href="/register"
                className="font-pixel text-[8.5px] text-navy-blue font-bold hover:underline pl-1 cursor-pointer inline-block"
              >
                {lang === "ID" ? "Daftar >" : "Sign up >"}
              </Link>
            </p>

            <p className="font-sans text-[11px] text-gray-500">
              {lang === "ID" ? "Lupa kunci keamanan?" : "Lost security key?"}{" "}
              <Link
                href="/forgot-password"
                className="font-pixel text-[8.5px] text-navy-blue font-bold hover:underline pl-1 cursor-pointer inline-block"
              >
                {lang === "ID" ? "Reset Password >" : "Reset Password >"}
              </Link>
            </p>
          </div>

          {/* ✦ PINTASAN PENGUJIAN JURI & ADMIN (ACCORDION RAPI / BISA DILIPAT) ✦ */}
          <div className="border-t border-dashed border-slate-300 pt-2 flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setShowDemoSection(!showDemoSection)}
              className="w-full flex items-center justify-between text-left font-pixel text-[7.5px] text-gray-600 hover:text-retro-black bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-300 cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-1.5 text-yellow-700 font-bold">
                <span>⚡</span>
                <span>
                  {lang === "ID" ? "AKSES PENGUJIAN JURI & ADMIN" : "JURY & ADMIN DEMO SHORTCUTS"}
                </span>
              </span>
              <span className="text-[9px] text-slate-500 font-sans">
                {showDemoSection ? "▲ Tutup" : "▼ Buka"}
              </span>
            </button>

            {/* KONTEN DEMO HANYA MUNCUL KETIKA DIBUKA OLEH JURI */}
            {showDemoSection && (
              <div className="flex flex-col gap-1.5 pt-1 animate-in fade-in duration-150">
                <div className="grid grid-cols-3 gap-1.5">
                  {DEMO_PERSONAS.map((persona) => {
                    const isSelected = username.toLowerCase() === persona.name.toLowerCase();
                    return (
                      <button
                        type="button"
                        key={persona.name}
                        onClick={() => handleSelectDemoPersona(persona)}
                        className={`flex flex-col items-center justify-center p-1.5 border-2 rounded-xl transition-all cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,0.06)] active:translate-y-[1px] group text-center ${isSelected
                            ? "bg-yellow-100/70 border-yellow-500"
                            : "bg-slate-50 hover:bg-yellow-50 border-slate-300 hover:border-yellow-400"
                          }`}
                      >
                        <span className="text-sm group-hover:scale-110 transition-transform">{persona.avatar}</span>
                        <span className="font-pixel text-[8px] text-retro-black font-bold mt-0.5">{persona.name}</span>
                        <span className="font-sans text-[7px] text-slate-500 truncate w-full">
                          {lang === "ID" ? persona.tagId : persona.tagEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="font-sans text-[9px] text-slate-400 text-center italic">
                  {lang === "ID"
                    ? "*Klik salah satu untuk mengisi akun dan menguji peran."
                    : "*Click to auto-fill credentials and test role."}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}