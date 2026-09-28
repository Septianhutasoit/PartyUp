"use client";

import Image from "next/image";
import { useLanguage } from "../../utils/lang";

// DAFTAR ICON DARI FOLDER public/tech/
const TECH_STACKS = [
    { name: "Python", icon: "/tech/python.png" },
    { name: "HTML / CSS", icon: "/tech/html.png" },
    { name: "JavaScript", icon: "/tech/js.png" },
    { name: "React", icon: "/tech/react.png" },
    { name: "PostgreSQL", icon: "/tech/postgresql.png" },
    { name: "Java", icon: "/tech/java.png" },
    { name: "C++", icon: "/tech/c++.png" },
    { name: "C", icon: "/tech/c.png" },
];

export default function HomeProgression() {
    const { lang } = useLanguage();

    return (
        <section className="max-w-6xl w-full mx-auto px-4 md:px-6 my-16 flex flex-col lg:flex-row items-center gap-12">

            {/* TEKS SEBELAH KIRI */}
            <div className="flex-1 text-left flex flex-col gap-4">
                <span className="font-pixel text-[10px] text-yellow-400 bg-retro-black px-3 py-1.5 w-fit border border-retro-black">
                    {lang === "ID" ? "// SISTEM PROGRESSI" : "// PROGRESSION SYSTEM"}
                </span>
                <h2 className="font-pixel text-xl md:text-3xl text-white leading-relaxed">
                    {lang === "ID" ? "Naikkan Level Tim Kamu" : "Level up your team"}
                </h2>
                <p className="font-sans text-sm md:text-base text-gray-300 leading-relaxed max-w-lg">
                    {lang === "ID"
                        ? "Bentuk party-mu, kumpulkan XP dari tiap misi yang diselesaikan, dan koleksi lencana pencapaian saat berkolaborasi lintas role. Sistem matchmaking kami bikin cari tim impian buat GEMASTIK & INVENTION 2026 jadi semenyenangkan menyelesaikan quest game!"
                        : "Build your party, earn XP from completed quests, and collect milestone achievement badges as you collaborate across roles. Our matchmaking system makes finding your dream team for GEMASTIK & INVENTION 2026 as rewarding as clearing the next game level."}
                </p>

                <div className="flex flex-col gap-2.5 pt-2">
                    <span className="font-pixel text-[8.5px] text-yellow-400 uppercase tracking-wider">
                        {lang === "ID" ? "// TECH STACK & BAHASA DIDUKUNG:" : "// SUPPORTED TECH STACKS & LANGUAGES:"}
                    </span>

                    <div className="flex flex-wrap gap-2 pt-0.5">
                        {TECH_STACKS.map((tech) => (
                            <div
                                key={tech.name}
                                className="flex items-center gap-2 bg-[#121c2d] hover:bg-[#19263e] border-2 border-retro-black hover:border-yellow-400 px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all duration-150 cursor-pointer group"
                            >
                                <div className="w-4 h-4 relative shrink-0">
                                    <Image
                                        src={tech.icon}
                                        alt={tech.name}
                                        fill
                                        unoptimized
                                        className="object-contain group-hover:scale-110 transition-transform"
                                    />
                                </div>
                                <span className="font-pixel text-[8px] text-gray-200 group-hover:text-yellow-300 font-bold">
                                    {tech.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* SEBELAH KANAN: TEAM.GIF LEBIH NYATA & IKON LEBIH BESAR */}
            <div className="w-full lg:w-[460px] relative pt-16 shrink-0">

                {/* Karakter Pixel Diperbesar di Atas */}
                <div className="absolute top-2 left-6 flex items-center gap-4 z-10 animate-float-gentle">
                    <div className="w-24 h-24 relative">
                        <Image
                            src="/cursors/2pc.gif"
                            alt="Character 1"
                            fill
                            unoptimized
                            className="object-contain drop-shadow-[3px_3px_0px_rgba(0,0,0,0.8)]"
                        />
                    </div>
                </div>

                {/* Container Gambar Lebih Bersih & Nyata (Tanpa kotak hitam kaku) */}
                <div className="bg-[#111e28] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 p-3.5 relative flex flex-col gap-3">

                    <div className="w-full aspect-video relative rounded-xl overflow-hidden shadow-inner bg-black">
                        <Image
                            src="/cursors/team.gif"
                            alt="Team Campfire"
                            fill
                            unoptimized
                            className="object-cover"
                        />
                    </div>

                    <div className="flex justify-between w-full items-center px-2 pb-1">
                        <span className="font-pixel text-[10px] text-yellow-300 tracking-wider">PARTYUP!</span>
                    </div>

                </div>
            </div>
        </section>
    );
}