"use client";

import React, { useState, useEffect, useMemo } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import PixelButton from "../../components/PixelButton";
import ConfirmModal from "../../components/ConfirmModal";
import TimelineCard from "../../components/timeline/TimelineCard";
import ArticleDetailView from "../../components/timeline/ArticleDetailView";
import usersData from "../../data/users.json";
import { getStoredUsers, calculateUserLevel } from "../../utils/auth";
import { useLanguage } from "../../utils/lang";

// Helper Banner Gambar Default
const getDefaultPostBanner = (content = "") => {
  const c = content.toLowerCase();
  if (c.includes("figma") || c.includes("design") || c.includes("ui") || c.includes("accessibility")) return "/bg.png";
  if (c.includes("engine") || c.includes("backend") || c.includes("python") || c.includes("sql") || c.includes("golang") || c.includes("docker")) return "/computer.png";
  if (c.includes("mobile") || c.includes("bluetooth") || c.includes("flutter")) return "/bg3.gif";
  if (c.includes("game") || c.includes("canvas") || c.includes("tilemap")) return "/bg2.gif";
  return "/bg4.gif";
};

const INITIAL_POSTS = [
  {
    id: "post-1",
    author_id: "USR-002", 
    title: "Building a High-Throughput Carbon Engine with Python & Go",
    category: "BACKEND",
    level: "INTERMEDIATE",
    readTime: "8 min read",
    content: "The EcoSphere carbon-calculator engine is fully optimized! 1,000 computation nodes execute in under 3ms with zero latency drift. Still looking for a UI/UX Designer teammate to finalize the competition presentation slides. Check my open quests on the board!",
    prerequisites: "Python 3.11, Docker, REST API Fundamentals",
    codeSnippet: "def calculate_carbon_footprint(nodes, energy_factor):\n    # Optimized 3ms vector calculation\n    return [node.emission * energy_factor for node in nodes]",
    image: "/project/alex1.png",
    likes: 24,
    isLiked: false,
    timestamp: "Aug 24, 2026",
    tags: ["#INVENTION2026", "#FullStack", "#Python"],
    comments: [
      {
        author: "Joice",
        role: "UI/UX Designer",
        timestamp: "2 hours ago",
        text: "That computation throughput is insane! I can assist with polishing the Figma slides if you still have an open slot."
      }
    ]
  },
  {
    id: "post-2",
    author_id: "USR-001", // Joice
    title: "Crafting Pixel-Perfect Retro Design Systems in Figma",
    category: "UI / UX",
    level: "BEGINNER",
    readTime: "6 min read",
    content: "Just published the complete design system and hi-fi mobile prototype for ScholarSave. Handcrafted 48 custom retro pixelated icons and responsive typography tokens. Inspect the case study in my Showcase portfolio!",
    prerequisites: "Figma Variables, Auto-layout v5, Design Tokens",
    codeSnippet: ":root {\n  --color-pixel-green: #00FF00;\n  --shadow-retro: 4px 4px 0px #000000;\n}",
    image: "/project/scholarsave.png",
    likes: 42,
    isLiked: false,
    timestamp: "Aug 22, 2026",
    tags: ["#Figma", "#UIUX", "#DesignSystem"],
    comments: []
  },
  {
    id: "post-3",
    author_id: "USR-003", // Sarah
    title: "Agile Sprint Roadmaps & Lean Business Canvas for Hackathons",
    category: "MANAGEMENT",
    level: "ADVANCED",
    readTime: "12 min read",
    content: "Drafted the Business Model Canvas & Sprint Roadmap for the EduQuest flashcard ecosystem. Next sprint milestone: finalizing backend SQL schemas and automated unit tests. Let's aim for the championship! 🚀",
    prerequisites: "Scrum Methodology, Product Backlog Management",
    codeSnippet: "// Sprint Milestone 02\n- [x] Database Schema Verification\n- [ ] Automated Unit Testing Suite\n- [ ] Pitch Deck Finalization",
    image: "/project/agile.png",
    likes: 19,
    isLiked: false,
    timestamp: "Aug 20, 2026",
    tags: ["#ProductManagement", "#GEMASTIK"],
    comments: [
      {
        author: "Kevin",
        role: "Backend Developer",
        timestamp: "1 day ago",
        text: "Schemas look solid! Let me know if you need help stress-testing the PostgreSQL queries."
      }
    ]
  },
  {
    id: "post-4",
    author_id: "USR-004", // Kevin
    title: "Real-time Telemetry & Native Bluetooth Integration in Flutter",
    category: "MOBILE",
    level: "INTERMEDIATE",
    readTime: "10 min read",
    content: "Integrated real-time Bluetooth telemetry in MediLink. Testing cross-platform hardware responsiveness across Android & iOS devices. Ready for GEMASTIK 2026 deployment! 📱",
    prerequisites: "Flutter SDK 3.x, Flutter Blue Plus, BLE Protocols",
    codeSnippet: "FlutterBluePlus.scanResults.listen((results) {\n  for (ScanResult r in results) {\n    print('${r.device.remoteId}: ${r.rssi}');\n  }\n});",
    image: "/project/telemetry.png",
    likes: 31,
    isLiked: false,
    timestamp: "Aug 18, 2026",
    tags: ["#MobileDev", "#GEMASTIK", "#Flutter"],
    comments: []
  },
  // KARTU 5: UI/UX Accessibility
  {
    id: "post-5",
    author_id: "USR-001", // Joice
    title: "Designing Accessible Dark Mode Micro-Interactions with Tailwind",
    category: "UI / UX",
    level: "INTERMEDIATE",
    readTime: "7 min read",
    content: "Published an open-source accessibility design guideline for student web designers. Features WCAG AAA high-contrast ratios, smooth focus rings, and zero motion sickness triggers for 8-bit retro interfaces.",
    prerequisites: "Tailwind CSS v4, WCAG 2.1 Guidelines, Figma Tokens",
    codeSnippet: "@utility focus-ring {\n  outline: 2px solid #00FF00;\n  outline-offset: 2px;\n  transition: outline-offset 0.15s ease;\n}",
    image: "/project/micro.png",
    likes: 37,
    isLiked: false,
    timestamp: "Aug 16, 2026",
    tags: ["#UIUX", "#Frontend", "#Figma"],
    comments: [
      {
        author: "Sarah",
        role: "Product Manager",
        timestamp: "Yesterday",
        text: "The high-contrast toggle really improves accessibility score during judging presentations!"
      }
    ]
  },
  // KARTU 6: DevOps CI/CD
  {
    id: "post-6",
    author_id: "USR-002", // Alex
    title: "Zero-Downtime Automated CI/CD Pipelines with Docker & Actions",
    category: "DEVOPS",
    level: "ADVANCED",
    readTime: "11 min read",
    content: "Architected an automated testing and deployment workflow for our hackathon prototype. Every push to main runs linting, integration suites, and deploys production containers in 45 seconds.",
    prerequisites: "Docker Compose, GitHub Actions, Linux Shell Scripting",
    codeSnippet: "name: Guild CI/CD\non: [push]\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: docker compose up -d --build",
    image: "/project/cloud.png",
    likes: 53,
    isLiked: false,
    timestamp: "Aug 14, 2026",
    tags: ["#INVENTION2026", "#FullStack"],
    comments: [
      {
        author: "Kevin",
        role: "Backend Developer",
        timestamp: "3 days ago",
        text: "Deploying under 1 minute makes hackathon sprint iterations so much faster."
      }
    ]
  },
  // KARTU 7: UX Research & SUS Scoring
  {
    id: "post-7",
    author_id: "USR-003", // Sarah
    title: "User Persona Segmentation & Usability Testing (SUS) for EdTech",
    category: "RESEARCH",
    level: "BEGINNER",
    readTime: "9 min read",
    content: "Conducted usability testing across 25 IT college students for the EduQuest flashcard project. Achieved a System Usability Scale (SUS) score of 88.5/100. Check the full report and heuristic analysis!",
    prerequisites: "User Research Basics, Google Forms, SUS Calculator",
    codeSnippet: "// SUS Calculation Formula\nconst susScore = (oddSum - 5 + (25 - evenSum)) * 2.5;\nconsole.log(`Usability Grade: A+ (${susScore}/100)`);",
    image: "/project/businees.png",
    likes: 29,
    isLiked: false,
    timestamp: "Aug 12, 2026",
    tags: ["#ProductManagement", "#GEMASTIK"],
    comments: []
  },
  // KARTU 8: High-Performance Go WebSockets
  {
    id: "post-8",
    author_id: "USR-004", // Kevin
    title: "Building Low-Latency WebSocket Chat & Telemetry with Golang",
    category: "BACKEND",
    level: "ADVANCED",
    readTime: "14 min read",
    content: "Engineered a concurrent WebSocket server in Go handling 50,000 active real-time socket connections with only 35MB memory footprint. Perfect for multiplayer hackathon games and live team chats!",
    prerequisites: "Golang 1.22, Goroutines, WebSocket RFC 6455",
    codeSnippet: "func handleConnections(w http.ResponseWriter, r *http.Request) {\n    ws, err := upgrader.Upgrade(w, r, nil)\n    defer ws.Close()\n    clients[ws] = true\n}",
    image: "/project/telemetry.png",
    likes: 48,
    isLiked: false,
    timestamp: "Aug 10, 2026",
    tags: ["#FullStack", "#GEMASTIK"],
    comments: [
      {
        author: "Alex",
        role: "Full-stack Developer",
        timestamp: "5 days ago",
        text: "The memory efficiency of Go channels is unmatched for real-time telemetry."
      }
    ]
  },
  // KARTU 9: Retro Game Dev Canvas
  {
    id: "post-9",
    author_id: "USR-002", // Alex
    title: "Creating 8-Bit Retro Tilemap Engines in HTML5 Canvas & TypeScript",
    category: "GAME DEV",
    level: "INTERMEDIATE",
    readTime: "12 min read",
    content: "Built a lightweight 2D grid-based dungeon crawler engine from scratch without external dependencies. 60 FPS smooth collision handling, A* pathfinding, and custom pixel-art sprite rendering.",
    prerequisites: "TypeScript, HTML5 Canvas API, Vector Math",
    codeSnippet: "class TileMap {\n  draw(ctx: CanvasRenderingContext2D) {\n    this.tiles.forEach(t => ctx.drawImage(t.sprite, t.x, t.y));\n  }\n}",
    image: "/project/EcoSphere.png",
    likes: 64,
    isLiked: false,
    timestamp: "Aug 08, 2026",
    tags: ["#Frontend", "#INVENTION2026"],
    comments: [
      {
        author: "Joice",
        role: "UI/UX Designer",
        timestamp: "1 week ago",
        text: "I can contribute some 16x16 dungeon tilesets if you plan to release a playable web demo!"
      }
    ]
  }
];

const AVAILABLE_TAGS = [
  "ALL",
  "#INVENTION2026",
  "#GEMASTIK",
  "#Frontend",
  "#UIUX",
  "#FullStack",
  "#MobileDev",
  "#ProductManagement"
];

export default function Following() {
  const { lang } = useLanguage();
  const [user, setUser] = useState(null);
  const [usersList, setUsersList] = useState(usersData);
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [selectedPost, setSelectedPost] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Form States
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("FRONTEND");
  const [selectedTag, setSelectedTag] = useState("ALL");
  const [replyText, setReplyText] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  // Modal Konfirmasi Hapus
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const activeUsers = getStoredUsers();
      setUsersList(activeUsers && activeUsers.length > 0 ? activeUsers : usersData);

      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error(e);
        }
      }

      const localPosts = localStorage.getItem("timelinePosts");
      if (localPosts) {
        try {
          const parsed = JSON.parse(localPosts);
          if (Array.isArray(parsed)) {
            const syncedPosts = INITIAL_POSTS.map((initPost) => {
              const existing = parsed.find((p) => p.id === initPost.id);
              if (existing) {
                return {
                  ...initPost,
                  likes: existing.likes ?? initPost.likes,
                  isLiked: existing.isLiked ?? initPost.isLiked,
                  comments: existing.comments ?? initPost.comments,
                  image: initPost.image,
                };
              }
              return initPost;
            });

            const customUserPosts = parsed.filter(
              (p) => !INITIAL_POSTS.some((init) => init.id === p.id)
            );

            const finalPosts = [...customUserPosts, ...syncedPosts];
            setPosts(finalPosts);
            localStorage.setItem("timelinePosts", JSON.stringify(finalPosts));
          } else {
            setPosts(INITIAL_POSTS);
            localStorage.setItem("timelinePosts", JSON.stringify(INITIAL_POSTS));
          }
        } catch (e) {
          console.error(e);
          setPosts(INITIAL_POSTS);
        }
      } else {
        localStorage.setItem("timelinePosts", JSON.stringify(INITIAL_POSTS));
      }
    }
  }, []);

  const savePosts = (updatedPosts) => {
    setPosts(updatedPosts);
    if (typeof window !== "undefined") {
      localStorage.setItem("timelinePosts", JSON.stringify(updatedPosts));
    }
  };

  // Like Handlers
  const handleLike = (postId, e) => {
    if (e) e.stopPropagation();
    if (!user) {
      alert(
        lang === "ID"
          ? "⚠️ AKSES DITOLAK: Silakan login atau buat karakter untuk menyukai broadcast!"
          : "⚠️ ACCESS DENIED: Please login or create a student character to like broadcasts!"
      );
      return;
    }

    const updated = posts.map((post) => {
      if (post.id === postId) {
        const newPost = {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked,
        };
        if (selectedPost?.id === postId) setSelectedPost(newPost);
        return newPost;
      }
      return post;
    });
    savePosts(updated);
  };

  // Comment Handler
  const handleSendReply = (postId) => {
    if (!user) {
      alert(
        lang === "ID"
          ? "⚠️ AKSES DITOLAK: Silakan login atau daftar untuk berpartisipasi dalam diskusi!"
          : "⚠️ ACCESS DENIED: Please login or register to participate in the discussion!"
      );
      return;
    }
    if (!replyText.trim()) return;

    const newComment = {
      author: user.name,
      role: user.role,
      timestamp: "Just now",
      text: replyText.trim(),
    };

    const updated = posts.map((post) => {
      if (post.id === postId) {
        const newPostObj = {
          ...post,
          comments: [...post.comments, newComment],
        };
        if (selectedPost?.id === postId) setSelectedPost(newPostObj);
        return newPostObj;
      }
      return post;
    });

    savePosts(updated);
    setReplyText("");
  };

  // Delete Post Handler
  const handleDeletePost = (postId, e) => {
    if (e) e.stopPropagation();
    if (!user) {
      alert(lang === "ID" ? "⚠️ AKSES DITOLAK: Anda harus login untuk menghapus broadcast!" : "⚠️ ACCESS DENIED: You must log in to delete your broadcasts!");
      return;
    }
    const targetPost = posts.find((p) => p.id === postId);
    if (targetPost && targetPost.author_id !== user.user_id && user.role !== "Admin") {
      alert(lang === "ID" ? "⚠️ AKSES DITOLAK: Anda hanya bisa menghapus broadcast milik sendiri!" : "⚠️ ACCESS DENIED: You can only delete your own broadcasts!");
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: lang === "ID" ? "HAPUS BROADCAST" : "DELETE BROADCAST",
      message: lang === "ID" ? "Apakah Anda yakin ingin menghapus broadcast ini secara permanen?" : "Are you sure you want to permanently delete this broadcast post?",
      onConfirm: () => {
        const updated = posts.filter((post) => post.id !== postId);
        savePosts(updated);
        if (selectedPost?.id === postId) setSelectedPost(null);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Delete Comment Handler
  const handleDeleteComment = (postId, commentIndex) => {
    if (!user) {
      alert(lang === "ID" ? "⚠️ AKSES DITOLAK: Anda harus login untuk menghapus komentar!" : "⚠️ ACCESS DENIED: You must log in to delete comments!");
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: lang === "ID" ? "HAPUS KOMENTAR" : "DELETE COMMENT",
      message: lang === "ID" ? "Apakah Anda yakin ingin menghapus balasan ini dari thread diskusi?" : "Are you sure you want to remove this reply from the discussion thread?",
      onConfirm: () => {
        const updated = posts.map((post) => {
          if (post.id === postId) {
            const updatedComments = post.comments.filter((_, idx) => idx !== commentIndex);
            const newPostObj = { ...post, comments: updatedComments };
            if (selectedPost?.id === postId) setSelectedPost(newPostObj);
            return newPostObj;
          }
          return post;
        });
        savePosts(updated);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Publish Post Handler
  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!user) {
      alert(lang === "ID" ? "⚠️ AKSES DITOLAK: Silakan login untuk menerbitkan artikel!" : "⚠️ ACCESS DENIED: Please login to publish articles!");
      return;
    }
    if (!newPostContent.trim()) return;

    const newPost = {
      id: `post-${Date.now()}`,
      author_id: user.user_id || "USR-001",
      title: newPostTitle.trim() || `${newPostCategory} Sprint Broadcast`,
      category: newPostCategory,
      level: "INTERMEDIATE",
      readTime: "5 min read",
      content: newPostContent.trim(),
      prerequisites: "Verified Guild Student Account, Git Workflow",
      codeSnippet: "// Project Architecture Snippet\nconsole.log('Guild quest milestone reached!');",
      image: getDefaultPostBanner(newPostContent),
      likes: 0,
      isLiked: false,
      timestamp: "Just now",
      tags: ["#INVENTION2026", `#${newPostCategory}`],
      comments: [],
    };

    const updated = [newPost, ...posts];
    savePosts(updated);
    setNewPostTitle("");
    setNewPostContent("");
  };

  // Copy Link Handler
  const handleCopyPostLink = (id, e) => {
    if (e) e.stopPropagation();
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(`${window.location.origin}/following#${id}`);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredPosts = useMemo(() => {
    if (selectedTag === "ALL") return posts;
    return posts.filter((post) => {
      const combined = `${post.content} ${post.title} ${(post.tags || []).join(" ")}`.toLowerCase();
      return combined.includes(selectedTag.toLowerCase());
    });
  }, [posts, selectedTag]);

  const getAuthor = (authorId) => {
    return (
      usersList.find((u) => u.user_id === authorId) || {
        name: user?.name || "Guild Adventurer",
        role: user?.role || "Full-stack Developer",
        bio: "Active student engineer participating in university hackathons.",
        major: "Informatics",
      }
    );
  };

 
  if (selectedPost) {
    const author = getAuthor(selectedPost.author_id);
    const authorLevel = calculateUserLevel(author);
    const otherPostsByAuthor = posts.filter(
      (p) => p.author_id === selectedPost.author_id && p.id !== selectedPost.id
    );

    return (
      <ArticleDetailView
        post={selectedPost}
        author={author}
        authorLevel={authorLevel}
        user={user}
        otherPostsByAuthor={otherPostsByAuthor}
        onBack={() => setSelectedPost(null)}
        onSelectOtherPost={(otherPost) => setSelectedPost(otherPost)}
        onLike={handleLike}
        onSendReply={handleSendReply}
        onDeleteComment={handleDeleteComment}
        onCopyLink={handleCopyPostLink}
        copiedId={copiedId}
        replyText={replyText}
        setReplyText={setReplyText}
        getDefaultBanner={getDefaultPostBanner}
      />
    );
  }

  
  return (
    <div className="bg-[#0c1322] min-h-screen text-white flex flex-col font-sans overflow-x-hidden selection:bg-yellow-400 selection:text-black">
      <Header />

      {/* Hero Banner */}
      <section
        className="relative w-full min-h-[480px] md:min-h-[560px] bg-cover bg-center bg-no-repeat overflow-hidden border-b-4 border-retro-black flex items-center justify-center pt-28 md:pt-32"
        style={{ backgroundImage: "url('/bg5.gif')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c1322]/85 via-black/60 to-[#0c1322] pointer-events-none z-0" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 md:py-20 text-center flex flex-col items-center justify-center gap-4">
          <div className="inline-flex items-center gap-2 bg-[#121b2d]/90 border-2 border-yellow-400 px-3.5 py-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-md">
            <span className="w-2 h-2 rounded-full bg-pixel-green animate-ping" />
            <span className="font-pixel text-[8.5px] md:text-[10px] text-yellow-300 tracking-widest uppercase">
              {lang === "ID" ? "✦ KEDAI GUILD & CODEX LANGSUNG ✦" : "✦ GUILD TAVERN & LIVE CODEX ✦"}
            </span>
          </div>

          <h1 className="font-pixel text-2xl md:text-5xl text-yellow-300 drop-shadow-[0_6px_0px_rgba(0,0,0,1)] leading-tight tracking-wide">
            {lang === "ID" ? "[ LINIMASA AKTIVITAS GUILD ]" : "[ GUILD ACTIVITY TIMELINE ]"}
          </h1>

          <p className="font-sans text-xs md:text-sm text-gray-200 leading-relaxed max-w-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            {lang === "ID"
              ? "Jelajahi artikel rekayasa perangkat lunak, log sprint, dan tutorial proyek teknis. Klik kartu artikel untuk melihat detail lengkap dan bergabung dalam diskusi."
              : "Explore software engineering articles, sprint logs, and technical project tutorials. Click any article card to inspect full specifications and join the discussion."}
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2 w-full max-w-md text-center">
            <div className="bg-[#121b2d]/80 border-2 border-retro-black p-2.5 rounded-xl backdrop-blur-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-pixel text-xs md:text-sm text-yellow-400">{posts.length}</p>
              <p className="font-pixel text-[7px] text-gray-300 uppercase">
                {lang === "ID" ? "Artikel" : "Articles"}
              </p>
            </div>
            <div className="bg-[#121b2d]/80 border-2 border-retro-black p-2.5 rounded-xl backdrop-blur-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-pixel text-xs md:text-sm text-pixel-green">{usersList.length}</p>
              <p className="font-pixel text-[7px] text-gray-300 uppercase">
                {lang === "ID" ? "Penulis" : "Authors"}
              </p>
            </div>
            <div className="bg-[#121b2d]/80 border-2 border-retro-black p-2.5 rounded-xl backdrop-blur-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-pixel text-xs md:text-sm text-cyan-300">REALTIME</p>
              <p className="font-pixel text-[7px] text-gray-300 uppercase">
                {lang === "ID" ? "Tersinkron" : "Synced"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 pt-8 pb-16 flex flex-col gap-8">

        {/* Form Dispatch Broadcast */}
        <form
          onSubmit={handleCreatePost}
          className="bg-[#121b2d] border-4 border-retro-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5 md:p-6 flex flex-col gap-4 text-left"
        >
          <div className="flex justify-between items-center border-b-2 border-gray-700/80 pb-3">
            <span className="font-pixel text-[9px] text-pixel-green tracking-wider uppercase">
              {lang === "ID" ? "// TERBITKAN ARTIKEL ATAU UPDATE SPRINT" : "// DISPATCH NEW ARTICLE OR SPRINT UPDATE"}
            </span>
            <span className="font-pixel text-[7.5px] bg-[#1a253b] text-yellow-300 border border-retro-black px-2 py-0.5 rounded font-bold">
              {lang === "ID" ? "EDITOR SPRINT LOG" : "SPRINT LOG PUBLISHER"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder={lang === "ID" ? "Judul Artikel / Sprint..." : "Article / Sprint Title..."}
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              disabled={!mounted || !user}
              className="sm:col-span-2 font-sans text-xs p-3 bg-[#18233a] text-white border-2 border-retro-black focus:outline-none focus:border-yellow-400 rounded-xl"
            />
            <select
              value={newPostCategory}
              onChange={(e) => setNewPostCategory(e.target.value)}
              disabled={!mounted || !user}
              className="font-sans text-xs p-3 bg-[#18233a] text-white border-2 border-retro-black focus:outline-none rounded-xl"
            >
              <option value="FRONTEND">FRONTEND / WEB</option>
              <option value="BACKEND">BACKEND / CLOUD</option>
              <option value="UI / UX">UI / UX DESIGN</option>
              <option value="MOBILE">MOBILE APPS</option>
              <option value="DEVOPS">DEVOPS &amp; CI/CD</option>
              <option value="GAME DEV">GAME DEVELOPMENT</option>
              <option value="RESEARCH">UX RESEARCH</option>
              <option value="MANAGEMENT">PROJECT MANAGEMENT</option>
            </select>
          </div>

          <textarea
            rows={3}
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder={
              mounted && user
                ? (lang === "ID" ? `Tulis ringkasan sprint atau tutorial teknismu, ${user.name}...` : `Write your sprint breakdown or tech tutorial, ${user.name}...`)
                : (lang === "ID" ? "Silakan login untuk menerbitkan artikel atau update ke linimasa guild..." : "Please log in to publish articles or updates to the guild timeline...")
            }
            disabled={!mounted || !user}
            className="font-sans text-xs p-3.5 bg-[#18233a] text-white border-2 border-retro-black focus:outline-none focus:border-yellow-400 rounded-xl resize-none"
          />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-1 border-t border-gray-700/60">
            <p className="font-sans text-[11px] text-gray-400">
              {user
                ? (lang === "ID" ? `Menerbitkan sebagai ${user.name} (${user.role})` : `Publishing as ${user.name} (${user.role})`)
                : (lang === "ID" ? "Mode tamu: login diperlukan untuk menerbitkan." : "Guest mode: Login required to publish.")}
            </p>
            <PixelButton
              variant="green"
              type="submit"
              disabled={!user || !newPostContent.trim()}
              className="py-2 px-6 text-[9px] w-full sm:w-auto"
            >
              {lang === "ID" ? "TERBITKAN ARTIKEL ✦" : "PUBLISH ARTICLE ✦"}
            </PixelButton>
          </div>
        </form>

        {/* Filter Pills Tagar */}
        <section className="flex flex-col gap-2 text-left">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[8px] text-gray-400 uppercase">// FILTER CODEX BY TOPIC:</span>
            <span className="font-pixel text-[8px] bg-[#121b2d] border border-retro-black px-2.5 py-1 text-yellow-300 rounded">
              {filteredPosts.length} POSTS
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {AVAILABLE_TAGS.map((tag) => {
              const isActive = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`font-pixel text-[8px] md:text-[8.5px] px-3.5 py-1.5 rounded-lg border-2 transition-all shrink-0 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] ${isActive
                    ? "bg-yellow-400 text-retro-black border-retro-black font-bold -translate-y-0.5"
                    : "bg-[#142036] text-gray-300 border-retro-black hover:border-yellow-400 hover:text-white"
                    }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </section>

        {/* 3-KOLOM TIMELINE CARDS GRID */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filteredPosts.map((post) => {
            const author = getAuthor(post.author_id);
            const authorLevel = calculateUserLevel(author);

            return (
              <TimelineCard
                key={post.id}
                post={post}
                author={author}
                authorLevel={authorLevel}
                currentUser={user}
                onSelectPost={setSelectedPost}
                onDeletePost={handleDeletePost}
                getDefaultBanner={getDefaultPostBanner}
              />
            );
          })}
        </section>

      </main>

      {/* Modal Konfirmasi Hapus Retro */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={lang === "ID" ? "HAPUS" : "DELETE"}
        cancelText={lang === "ID" ? "BATAL" : "CANCEL"}
        variant="danger"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <Footer />
    </div>
  );
}