"use client";

import React, { useState, useEffect, useMemo } from "react";
import { fetchAllQuests, createNewQuest } from "../../services/dataService";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import PixelButton from "../../components/PixelButton";
import ProjectCard from "../../components/ProjectCard";
import projectsData from "../../data/projects.json";
import { useLanguage } from "../../utils/lang";
import { isAdmin } from "../../utils/auth";
import { notify } from "../../utils/notification";

const CATEGORIES = [
  "ALL",
  "GEMASTIK 2026",
  "INVENTION 2026",
  "College Project",
  "HackFest 2026",
];

const CLASSES = [
  "ALL",
  "Product Manager (PM)",
  "Project / Scrum Master",
  "UI/UX Designer",
  "UX Researcher",
  "Frontend Developer",
  "Backend Developer",
  "Full-stack Developer",
  "Mobile App Developer",
  "QA (Quality Assurance) Engineer",
  "DevOps Engineer",
];

const getProjectImage = (title = "", category = "", skills = "") => {
  const text = (title + " " + category + " " + skills).toLowerCase();

  if (text.includes("scholar") || text.includes("finance") || text.includes("figma") || text.includes("design") || text.includes("ui")) {
    return "/project/scholarsave.png";
  }
  if (text.includes("eco") || text.includes("carbon") || text.includes("green") || text.includes("backend") || text.includes("python") || text.includes("go")) {
    return "/project/EcoSphere.png";
  }
  if (text.includes("telemetry") || text.includes("health") || text.includes("flutter") || text.includes("mobile") || text.includes("medilink") || text.includes("bluetooth")) {
    return "/project/telemetry.png";
  }
  if (text.includes("agile") || text.includes("edu") || text.includes("scrum") || text.includes("management") || text.includes("business") || text.includes("canvas")) {
    return "/project/agile.png";
  }
  if (text.includes("cloud") || text.includes("devops") || text.includes("docker") || text.includes("ci/cd")) {
    return "/project/cloud.png";
  }
  if (text.includes("micro") || text.includes("frontend") || text.includes("accessibility") || text.includes("tailwind")) {
    return "/project/micro.png";
  }
  return "/project/scholarsave.png";
};

export default function Board() {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const [projects, setProjects] = useState(projectsData);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [user, setUser] = useState(null);

  // Modal State untuk Menerbitkan Quest Baru
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("GEMASTIK 2026");
  const [newDescription, setNewDescription] = useState("");
  const [newSkills, setNewSkills] = useState("");
  const [newClass, setNewClass] = useState("Frontend Developer");

  // Sinkronisasi data lokal dari LocalStorage & Event Dispatcher
  useEffect(() => {
    const loadBoardData = async () => {
      if (typeof window !== "undefined") {
        // Ambil data dari Supabase (dengan fallback otomatis ke LocalStorage)
        const activeQuests = await fetchAllQuests();
        setProjects(activeQuests);

        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error(e);
          }
        }
      }
    };

    loadBoardData();
    window.addEventListener("projects-change", loadBoardData);
    window.addEventListener("auth-change", loadBoardData);
    return () => {
      window.removeEventListener("projects-change", loadBoardData);
      window.removeEventListener("auth-change", loadBoardData);
    };
  }, []);

  // Filter logika pencarian & kategori
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        project.title.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q) ||
        (project.looking_for &&
          project.looking_for.some((s) => s.toLowerCase().includes(q)));

      const matchesClass =
        selectedClass === "ALL" ||
        (project.looking_for && project.looking_for.includes(selectedClass));

      const matchesCategory =
        selectedCategory === "ALL" ||
        (project.category && project.category.includes(selectedCategory));

      return matchesSearch && matchesClass && matchesCategory;
    });
  }, [projects, search, selectedClass, selectedCategory]);

  // Handle pembuatan Quest baru oleh Ketua Tim
  const handleCreateQuest = async (e) => {
    e.preventDefault();
    if (!user) {
      notify.warning(
        lang === "ID"
          ? "Anda harus masuk ke akun karakter untuk menerbitkan Quest!"
          : "Please login to dispatch quests!",
        "ACCESS RESTRICTED // GUILD NOTICE"
      );
      router.push("/login");
      return;
    }

    if (!newTitle.trim() || !newDescription.trim()) {
      notify.warning(
        lang === "ID"
          ? "Mohon lengkapi judul dan deskripsi misi!"
          : "Please fill out the quest title and description!",
        "INCOMPLETE FORM // NOTICE"
      );
      return;
    }

    const skillsArray = newSkills
      ? newSkills.split(",").map((s) => s.trim()).filter(Boolean)
      : ["React", "Tailwind CSS"];

    const newQuest = {
      project_id: `PRJ-00${projects.length + 1}`,
      title: newTitle.trim(),
      category: newCategory,
      looking_for: Array.from(new Set([...skillsArray, newClass])),
      status: "Open",
      author: user.user_id || "USR-001",
      leader_id: user.user_id || "USR-001",
      description: newDescription.trim(),
      created_at: new Date().toISOString(),
      is_verified: true,
      image: getProjectImage(newTitle, newCategory, newSkills)
    };

    // Simpan ke Supabase Cloud & LocalStorage
    const updated = await createNewQuest(newQuest);
    setProjects(updated);
    window.dispatchEvent(new Event("projects-change"));

    notify.success(
      lang === "ID"
        ? `Quest "${newTitle.trim()}" berhasil diterbitkan ke Quest Board!`
        : `Quest "${newTitle.trim()}" has been dispatched to the Quest Board!`,
      "QUEST DISPATCHED // SUCCESS"
    );

    // Reset Form & Tutup Modal
    setIsModalOpen(false);
    setNewTitle("");
    setNewDescription("");
    setNewSkills("");
    setNewClass("Frontend Developer");
  };

  const handleDispatchClick = () => {
    if (!user) {
      notify.warning(
        lang === "ID"
          ? "Silakan masuk ke akun karakter terlebih dahulu untuk menerbitkan Quest!"
          : "YOU MUST LOG IN TO THE GUILD TO DISPATCH QUESTS!",
        "ACCESS RESTRICTED // GUILD NOTICE"
      );
      router.push("/login");
      return;
    }

    // arahkan admin ke panel audit quest
    if (isAdmin(user)) {
      notify.info(
        lang === "ID"
          ? "Anda adalah Administrator. Mengalihkan ke Panel Audit Quest..."
          : "Redirecting to Quest Audit Panel...",
        "ADMIN MODE"
      );
      router.push("/admin/quests");
      return;
    }

    setIsModalOpen(true);
  };

  return (
    <div className="bg-[#0c1322] min-h-screen text-white flex flex-col font-sans overflow-x-hidden selection:bg-yellow-400 selection:text-black">
      <Header />

      {/* 1. TOP HERO BANNER (min-h-[460px] Full-Bleed /bg3.gif)    */}
      <section
        className="relative w-full min-h-[400px] md:min-h-[480px] bg-cover bg-center bg-no-repeat overflow-hidden border-b-4 border-retro-black flex items-center justify-center pt-24 md:pt-28"
        style={{ backgroundImage: "url('/bg3.gif')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c1322]/85 via-black/55 to-[#0c1322] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-35 z-0" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-16 text-center flex flex-col items-center justify-center gap-4">
          <div className="inline-flex items-center gap-2 bg-[#121b2d]/90 border-2 border-yellow-400 px-3.5 py-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-md">
            <span className="w-2 h-2 rounded-full bg-pixel-green animate-ping" />
            <span className="font-pixel text-[8.5px] md:text-[10px] text-yellow-300 tracking-widest uppercase">
              {lang === "ID"
                ? "✦ LOWONGAN REKRUTMEN TIM GUILD AKTIF ✦"
                : "✦ ADVENTURER GUILD ACTIVE QUESTS ✦"}
            </span>
          </div>

          <h1 className="font-pixel text-2xl md:text-5xl text-yellow-300 drop-shadow-[0_6px_0px_rgba(0,0,0,1)] leading-tight tracking-wide">
            {lang === "ID" ? "[ PAPAN QUEST GUILD ]" : "[ GUILD QUEST BOARD ]"}
          </h1>

          <p className="font-sans text-xs md:text-sm text-gray-200 leading-relaxed max-w-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            {lang === "ID"
              ? "Temukan rekan tim mahasiswa IT & Desain untuk kompetisi GEMASTIK, INVENTION 2026, dan proyek capstone. Lamar peran terbuka atau terbitkan misi baru sebagai ketua tim."
              : "Discover IT & Design student teammates for GEMASTIK, INVENTION 2026, and hackathon projects. Apply to open roles or dispatch your own quest as a party leader."}
          </p>

          <div className="pt-2">
            <PixelButton
              variant={isAdmin(user) ? "navy" : "green"}
              onClick={handleDispatchClick}
              className="py-3 px-8 text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer active:translate-y-[1px]"
            >
              {isAdmin(user)
                ? (lang === "ID" ? "⚙️ BUKA AUDIT QUEST (ADMIN) ➔" : "⚙️ OPEN QUEST AUDIT (ADMIN) ➔")
                : (lang === "ID" ? "+ TERBITKAN QUEST BARU ➔" : "+ DISPATCH NEW QUEST ➔")}
            </PixelButton>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 pt-2 w-full max-w-md text-center">
            <div className="bg-[#121b2d]/80 border-2 border-retro-black p-2.5 rounded-xl backdrop-blur-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-pixel text-xs md:text-sm text-yellow-400">{projects.length}</p>
              <p className="font-pixel text-[7px] text-gray-300 uppercase">{lang === "ID" ? "Total Quest" : "Total Quests"}</p>
            </div>
            <div className="bg-[#121b2d]/80 border-2 border-retro-black p-2.5 rounded-xl backdrop-blur-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-pixel text-xs md:text-sm text-pixel-green">
                {projects.filter((p) => p.status === "Open").length}
              </p>
              <p className="font-pixel text-[7px] text-gray-300 uppercase">{lang === "ID" ? "Quest Terbuka" : "Open Quests"}</p>
            </div>
            <div className="bg-[#121b2d]/80 border-2 border-retro-black p-2.5 rounded-xl backdrop-blur-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-pixel text-xs md:text-sm text-cyan-300">100% PERSISTEN</p>
              <p className="font-pixel text-[7px] text-gray-300 uppercase">{lang === "ID" ? "Tersinkron" : "Live State"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT (FILTER TOOLBAR & QUEST CARDS GRID)       */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 pt-8 pb-16 flex flex-col gap-8">

        {/* Notice Info Hub */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f1b30] border-l-4 border-yellow-400 px-5 py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-r-xl text-left">
          <div className="flex flex-col gap-1">
            <span className="font-pixel text-[9px] text-yellow-400">
              {lang === "ID" ? "// INFORMASI PAPAN REKRUTMEN" : "// RECRUITMENT HUB NOTICE"}
            </span>
            <p className="font-sans text-xs md:text-sm text-gray-300 leading-relaxed">
              {lang === "ID"
                ? "Klik kartu quest untuk membaca cakupan kriteria kelayakan tim. Tekan GABUNG TIM untuk mendaftarkan karakter portofolio Anda langsung ke ketua misi."
                : "Click on any quest card to inspect full scope and eligibility. Click JOIN PARTY to apply directly with your verified student portfolio."}
            </p>
          </div>
          <span className="font-pixel text-[8.5px] bg-[#1a253b] text-yellow-300 border border-retro-black px-3 py-1.5 rounded-lg shrink-0">
            {filteredProjects.length} {lang === "ID" ? "QUEST AKTIF" : "ACTIVE QUESTS"}
          </span>
        </section>

        {/* Filter Toolbar (Pencarian & Dropdown Kategori) */}
        <section className="bg-[#121b2d] border-4 border-retro-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5 flex flex-col md:flex-row gap-4 items-center justify-between text-left">

          {/* Input Pencarian */}
          <div className="w-full md:w-1/3 flex flex-col gap-1.5">
            <label className="font-pixel text-[8px] text-yellow-400">
              {lang === "ID" ? "// CARI KATA KUNCI (MISAL: REACT, FIGMA)" : "// SEARCH KEYWORDS (E.G. NEXT.JS, FIGMA)"}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={lang === "ID" ? "Cari judul, tech stack, atau peran..." : "Search title, tech stack, or role..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full font-sans text-xs p-2.5 pl-8 bg-[#18233a] text-white border-2 border-retro-black focus:outline-none focus:border-yellow-400 rounded-xl"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs">🔍</span>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 font-pixel text-[7.5px] text-gray-400 hover:text-red-400"
                >
                  {lang === "ID" ? "HAPUS" : "CLEAR"}
                </button>
              )}
            </div>
          </div>

          {/* Filter Kelas */}
          <div className="w-full md:w-1/3 flex flex-col gap-1.5">
            <label className="font-pixel text-[8px] text-yellow-400">
              {lang === "ID" ? "// PERAN YANG DIBUTUHKAN" : "// REQUIRED CLASS"}
            </label>
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full font-sans text-xs p-2.5 bg-[#18233a] text-white border-2 border-retro-black focus:outline-none focus:border-yellow-400 appearance-none cursor-pointer rounded-xl"
              >
                {CLASSES.map((cls) => (
                  <option key={cls} value={cls} className="bg-[#18233a]">
                    {cls === "ALL" ? (lang === "ID" ? "Semua Kelas" : "All Classes") : cls}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-yellow-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Filter Kategori Lomba */}
          <div className="w-full md:w-1/3 flex flex-col gap-1.5">
            <label className="font-pixel text-[8px] text-yellow-400">
              {lang === "ID" ? "// KATEGORI KOMPETISI" : "// QUEST CATEGORY"}
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full font-sans text-xs p-2.5 bg-[#18233a] text-white border-2 border-retro-black focus:outline-none focus:border-yellow-400 appearance-none cursor-pointer rounded-xl"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#18233a]">
                    {cat === "ALL" ? (lang === "ID" ? "Semua Kategori" : "All Categories") : cat}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-yellow-400 text-xs">
                ▼
              </div>
            </div>
          </div>
        </section>

        {/* 3. QUEST CARDS 3-COLUMN RESPONSIVE GRID                   */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => {
              // Jika project masih pakai gambar default /bg.png, otomatis tingkatkan ke gambar pixel art resmi
              const finalImage =
                project.image && project.image !== "/bg.png" && project.image !== "/computer.png"
                  ? project.image
                  : getProjectImage(project.title, project.category, (project.looking_for || []).join(" "));

              return (
                <ProjectCard
                  key={project.project_id || project.id}
                  project={{ ...project, image: finalImage }}
                />
              );
            })
          ) : (
            <div className="col-span-full bg-[#121b2d] border-4 border-retro-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-12 text-center flex flex-col items-center justify-center gap-4">
              <span className="font-pixel text-2xl text-yellow-400">? ? ?</span>
              <p className="font-pixel text-xs text-white">
                {lang === "ID"
                  ? "TIDAK ADA QUEST YANG COCOK DENGAN FILTER ANDA"
                  : "NO ACTIVE QUESTS MATCH YOUR FILTERS"}
              </p>
              <PixelButton
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setSelectedClass("ALL");
                  setSelectedCategory("ALL");
                }}
              >
                {lang === "ID" ? "RESET SEMUA FILTER" : "RESET ALL FILTERS"}
              </PixelButton>
            </div>
          )}
        </section>

        {/* 4. MODAL POP-UP: TERBITKAN QUEST BARU (DARK THEME)        */}
        {isModalOpen && (
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm select-none animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f172a] border-4 border-retro-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white w-full max-w-lg flex flex-col rounded-2xl overflow-hidden text-left relative"
            >
              {/* Header Modal */}
              <div className="bg-[#182338] border-b-2 border-retro-black px-5 py-3 flex items-center justify-between shrink-0">
                <span className="font-pixel text-[8.5px] text-pixel-green tracking-wider uppercase">
                  {lang === "ID" ? "// FORMULIR PENERBITAN QUEST TIM" : "// DISPATCH NEW QUEST FORM"}
                </span>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="font-pixel text-[8px] text-gray-400 hover:text-white bg-transparent border-none cursor-pointer"
                >
                  ✕ [ESC]
                </button>
              </div>

              <form onSubmit={handleCreateQuest} className="p-6 flex flex-col gap-4">
                {/* Judul Quest */}
                <div className="flex flex-col gap-1">
                  <label className="font-pixel text-[8px] text-yellow-300">
                    {lang === "ID" ? "JUDUL QUEST / PROYEK" : "QUEST TITLE"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={lang === "ID" ? "Misal: ScholarSave Financial App" : "e.g. ScholarSave Budgeting App"}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="font-sans text-xs p-2.5 bg-[#18233a] text-white border-2 border-retro-black focus:outline-none focus:border-yellow-400 rounded-xl"
                  />
                </div>

                {/* Kategori & Peran Kelas yang Dicari */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-pixel text-[8px] text-yellow-300">
                      {lang === "ID" ? "KATEGORI LOMBA" : "CATEGORY"}
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="font-sans text-xs p-2.5 bg-[#18233a] text-white border-2 border-retro-black focus:outline-none rounded-xl cursor-pointer"
                    >
                      <option value="GEMASTIK 2026">GEMASTIK 2026</option>
                      <option value="INVENTION 2026">INVENTION 2026</option>
                      <option value="College Project">College Project</option>
                      <option value="HackFest 2026">HackFest 2026</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-pixel text-[8px] text-yellow-300">
                      {lang === "ID" ? "PERAN UTAMA YANG DICARI" : "PRIMARY ROLE NEEDED"}
                    </label>
                    <select
                      value={newClass}
                      onChange={(e) => setNewClass(e.target.value)}
                      className="font-sans text-xs p-2.5 bg-[#18233a] text-white border-2 border-retro-black focus:outline-none rounded-xl cursor-pointer"
                    >
                      {CLASSES.filter((c) => c !== "ALL").map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tech Stack Skills */}
                <div className="flex flex-col gap-1">
                  <label className="font-pixel text-[8px] text-yellow-300">
                    {lang === "ID" ? "KEBUTUHAN SKILL / TEKNOLOGI (PISAHKAN DENGAN KOMA)" : "TECH STACK / SKILLS (COMMA SEPARATED)"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Next.js, Figma, Golang, Docker"
                    value={newSkills}
                    onChange={(e) => setNewSkills(e.target.value)}
                    className="font-sans text-xs p-2.5 bg-[#18233a] text-white border-2 border-retro-black focus:outline-none focus:border-yellow-400 rounded-xl"
                  />
                </div>

                {/* Deskripsi Quest */}
                <div className="flex flex-col gap-1">
                  <label className="font-pixel text-[8px] text-yellow-300">
                    {lang === "ID" ? "DESKRIPSI & CAKUPAN MISI" : "QUEST DESCRIPTION & SCOPE"}
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={
                      lang === "ID"
                        ? "Jelaskan tujuan proyek lomba, target pencapaian sprint, dan kriteria teman tim yang Anda cari..."
                        : "Describe the scope, goals, sprint timeline, and ideal teammate requirements..."
                    }
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="font-sans text-xs p-2.5 bg-[#18233a] text-white border-2 border-retro-black focus:outline-none focus:border-yellow-400 rounded-xl resize-none"
                  />
                </div>

                {/* Tombol Aksi */}
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="font-pixel text-[8.5px] px-4 py-2 bg-[#18233a] hover:bg-[#22314e] border-2 border-retro-black text-gray-300 rounded-lg cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    {lang === "ID" ? "BATAL" : "CANCEL"}
                  </button>
                  <PixelButton variant="green" type="submit" className="py-2 px-6 text-[8.5px]">
                    {lang === "ID" ? "TERBITKAN QUEST ➔" : "DISPATCH QUEST ➔"}
                  </PixelButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}