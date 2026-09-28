import { NextResponse } from "next/server";

// ⚠️ WAJIB UNTUK VERCEL SERVERLESS: Memaksa rute selalu dinamis & tidak di-cache 404
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// SYSTEM PROMPT RESMI PIKACHU RESEPSIONIS GUILD PARTYUP (BAHASA INDONESIA)
const SYSTEM_PROMPT = `
Kamu adalah "Pikachu Resepsionis", asisten panduan cerdas, ramah, imut, antusias, dan bertema RPG piksel 8-bit untuk platform web "PartyUp!".
Kepribadianmu ceria, selalu menyapa pengguna sebagai "Petualang", dan sering menyisipkan seruan khas Pikachu seperti "Pika pika! ⚡", "Pikachu siap membantu!", serta metafora game RPG (seperti Quest, Party, Guild, EXP, Level, Boss).

ATURAN UTAMA BAHASA:
1. Selalu gunakan Bahasa Indonesia yang ramah, santun, dan natural.
2. Pertahankan istilah teknologi & RPG resmi seperti Quest, Party, Level (LV.), EXP, Guild, Showcase, Full-stack, UI/UX, Backend, Frontend, DevOps, Scrum Master, Product Manager.
3. Berikan jawaban yang ringkas, padat, terstruktur, dan langsung menjawab pertanyaan petualang.

BASIS PENGETAHUAN LENGKAP PARTYUP!:
1. Tentang Platform:
   - Platform pencarian rekan tim (Party Matchmaking) dan micro-networking mahasiswa IT & Desain se-Indonesia.
   - Dibuat khusus untuk kompetisi "INVENTION 2026 Web Design Competition" dan persiapan "GEMASTIK 2026".
   - Menghubungkan mahasiswa berbasis bukti portofolio nyata (Proof of Work), bukan sekadar biodata acak.

2. Direktori Halaman Website:
   - PAPAN QUEST (/board): Tempat melihat lowongan tim terbuka atau menerbitkan misi baru (+ TERBITKAN QUEST).
   - CATATAN SELESAI / SHOWCASE (/showcase): Galeri arsip proyek & studi kasus mahasiswa. User bisa klik "RECRUIT" untuk mengajak kolaborasi.
   - LINIMASA GUILD (/following): Feed artikel tutorial, sprint koding harian, dan diskusi publik 3-kolom.
   - PANDUAN PETUALANG (/guide): Buku panduan resmi 10 kelas RPG, video walkthrough, dan FAQ.
   - KUIS PETUALANGAN (/quiz): GameBoy RPG interaktif bertarung melawan Bug (Air vs Api) untuk meningkatkan EXP & Level karakter.
   - PANEL ADMIN (/admin): Panel khusus Guild Master (USR-000) untuk moderasi akun dan manajemen user.

3. 10 Kelas RPG Rekayasa Perangkat Lunak:
   - Manajemen: Product Manager (PM), Project / Scrum Master.
   - Desain: UI/UX Designer, UX Researcher.
   - Koding: Frontend Developer, Backend Developer, Full-stack Developer, Mobile App Developer.
   - Kualitas & Infrastruktur: QA (Quality Assurance) Engineer, DevOps Engineer.

4. Rumus Kalkulasi Level Karakter:
   - Level (LV.) = (Total Skill x 2) + (Jenjang Semester x 2) + (Quest Selesai x 3).
`;

// Helper untuk Cek Rute di Browser (Jika dibuka via URL langsung)
export async function GET() {
    return NextResponse.json({
        status: "ONLINE",
        message: "Pikachu AI Chat API is running smoothly!",
        timestamp: new Date().toISOString(),
    });
}

export async function POST(request) {
    // Fallback default jika AI offline / kuota habis
    let fallbackReply = "Pika pika! ⚡ Salam Petualang! Ada yang bisa Pikachu bantu? Kamu bisa menanyakan seputar 'misi', 'kelas', 'gemastik', 'level', atau 'admin' ya!";

    try {
        const { messages } = await request.json();
        const lastUserMsg = (messages[messages.length - 1]?.content || "").toLowerCase();

        // Deteksi Kata Kunci Cerdas (Smart Keyword Fallback) Bahasa Indonesia
        if (
            lastUserMsg.includes("kelas") ||
            lastUserMsg.includes("role") ||
            lastUserMsg.includes("peran") ||
            lastUserMsg.includes("class")
        ) {
            fallbackReply = "Pika pika! ⚡ Di Guild PartyUp! ada 10 Peran Kelas RPG: 1. Product Manager (PM), 2. Scrum Master, 3. UI/UX Designer, 4. UX Researcher, 5. Frontend Dev, 6. Backend Dev, 7. Full-stack Dev, 8. Mobile App Dev, 9. QA Engineer, dan 10. DevOps Engineer! Cek detailnya di menu Panduan (/guide) ya!";
        } else if (
            lastUserMsg.includes("gabung") ||
            lastUserMsg.includes("party") ||
            lastUserMsg.includes("misi") ||
            lastUserMsg.includes("quest") ||
            lastUserMsg.includes("rekrut")
        ) {
            fallbackReply = "Pikachu siap bantu! ⚔️ Untuk gabung tim, buka menu Papan Quest (/board), pilih misi yang sesuai keahlianmu, lalu klik 'GABUNG TIM'. Kamu juga bisa menerbitkan Quest baru dengan klik tombol '+ TERBITKAN QUEST'!";
        } else if (
            lastUserMsg.includes("gemastik") ||
            lastUserMsg.includes("invention") ||
            lastUserMsg.includes("lomba") ||
            lastUserMsg.includes("kompetisi")
        ) {
            fallbackReply = "Pika! 📜 GEMASTIK dan INVENTION 2026 adalah kompetisi IT bergengsi tingkat nasional! Di PartyUp!, kamu bisa membentuk Party beranggotakan 3 orang (Hustler, Hacker, Hipster) untuk memenangkan piala juara!";
        } else if (
            lastUserMsg.includes("level") ||
            lastUserMsg.includes("rating") ||
            lastUserMsg.includes("exp") ||
            lastUserMsg.includes("kalkulasi")
        ) {
            fallbackReply = "Pika pika! ⭐ Rating Level (LV.) karakter dihitung otomatis dengan rumus adil: (Skill x 2) + (Semester x 2) + (Portofolio Selesai x 3). Kamu juga bisa menaikkan level dengan menyelesaikan stage di Kuis RPG (/quiz)!";
        } else if (
            lastUserMsg.includes("admin") ||
            lastUserMsg.includes("panel") ||
            lastUserMsg.includes("master")
        ) {
            fallbackReply = "Pika! 👑 Panel Admin (/admin) adalah ruang kendali khusus Guild Master (USR-000) untuk memoderasi petualang, mengecek log sistem, dan mengaktifkan akun!";
        } else if (
            lastUserMsg.includes("showcase") ||
            lastUserMsg.includes("portofolio") ||
            lastUserMsg.includes("karya")
        ) {
            fallbackReply = "Pikachu kasih tau ya! 📜 Buka menu Catatan Selesai (/showcase) untuk melihat arsip karya mahasiswa terverifikasi lengkap dengan link GitHub dan demo aplikasi live!";
        }

        // Jika API Key Groq belum terpasang di Vercel, langsung gunakan balasan cerdas
        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json({ text: fallbackReply });
        }

        // Timeout diperpanjang ke 15 detik untuk mengakomodasi cold start Vercel
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
                temperature: 0.2,
                max_tokens: 220,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error("Groq status not ok:", response.status);
            return NextResponse.json({ text: fallbackReply });
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || fallbackReply;

        return NextResponse.json({ text: reply });
    } catch (error) {
        console.error("Groq API error / fallback:", error);
        return NextResponse.json({ text: fallbackReply });
    }
}