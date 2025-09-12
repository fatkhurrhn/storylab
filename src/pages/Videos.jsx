import React, { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import BottomNav from "../components/BottomNav";
import { Link, useParams } from "react-router-dom";

export default function Videos() {
    const { id } = useParams(); // param kategori (:id)

    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(null);
    const [pausedVideo, setPausedVideo] = useState(null);
    const [categories, setCategories] = useState([]);

    const videoRefs = useRef([]);
    const reelsContainerRef = useRef(null);

    // fetch videos
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
                const snap = await getDocs(q);
                const vids = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                setVideos(vids);

                // kategori unik
                const cats = [...new Set(vids.map((v) => v.category).filter(Boolean))];
                setCategories(cats);
            } catch (err) {
                console.error("Error fetching videos:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, []);

    // buka modal
    const handleOpen = (index) => {
        setActiveIndex(index);
        document.body.style.overflow = "hidden";
    };

    // scroll ke video saat modal dibuka
    useEffect(() => {
        if (activeIndex !== null && reelsContainerRef.current) {
            const container = reelsContainerRef.current;
            const videoEl = container.children[activeIndex];
            if (videoEl) {
                container.scrollTo({
                    top: videoEl.offsetTop,
                    behavior: "instant",
                });
            }
        }
    }, [activeIndex]);

    // tutup modal
    const closeModal = () => {
        setActiveIndex(null);
        setPausedVideo(null);
        document.body.style.overflow = "auto";
        videoRefs.current.forEach((v) => v && v.pause());
    };

    // auto play/pause ketika discroll
    const handleScroll = (e) => {
        const container = e.currentTarget;
        const scrollPosition = container.scrollTop;
        const containerHeight = container.clientHeight;

        const videosEl = container.querySelectorAll(".reel-video-container");
        videosEl.forEach((el, idx) => {
            const rect = el.getBoundingClientRect();
            const videoTop =
                rect.top - container.getBoundingClientRect().top + scrollPosition;
            const videoBottom = videoTop + rect.height;

            if (
                videoTop <= scrollPosition + containerHeight * 0.5 &&
                videoBottom >= scrollPosition + containerHeight * 0.5
            ) {
                const video = videoRefs.current[idx];
                if (video && pausedVideo !== idx) {
                    video.play().catch(() => { });
                }
            } else {
                const video = videoRefs.current[idx];
                if (video) video.pause();
            }
        });
    };

    // play/pause toggle
    const togglePlayPause = (idx) => {
        const video = videoRefs.current[idx];
        if (!video) return;
        if (video.paused) {
            video.play();
            setPausedVideo(null);
        } else {
            video.pause();
            setPausedVideo(idx);
        }
    };

    // download video
    const handleDownload = async (videoUrl, title) => {
        try {
            const response = await fetch(videoUrl);
            if (!response.ok) throw new Error("Download failed");
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = title
                ? `${title.replace(/[^a-z0-9]/gi, "_")}.mp4`
                : "video.mp4";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Download error:", err);
            window.open(videoUrl, "_blank");
        }
    };

    // filter berdasar kategori dari URL
    const selectedCategory = id || "all";
    const filteredVideos =
        selectedCategory === "all"
            ? videos
            : videos.filter((v) => v.category === selectedCategory);

    return (
        <div className="bg-[#fcfeff] min-h-screen text-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-3 border-b border-gray-300 sticky top-0 bg-[#fcfeff] z-40">
                <Link to="/" className="flex items-center gap-2 cursor-pointer">
                    <i className="ri-arrow-left-line text-xl text-[#355485]"></i>
                    <h1 className="text-[15px] font-semibold text-[#355485]">Videos</h1>
                </Link>
                <button className="text-xl text-[#355485] hover:text-[#4f90c6]">
                    <i className="ri-settings-3-line"></i>
                </button>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
                <div className="overflow-x-auto flex gap-2 px-3 py-2 border-b border-gray-100">
                    <Link
                        to="/videos"
                        className={`px-4 py-1 rounded-full text-sm whitespace-nowrap border transition ${selectedCategory === "all"
                                ? "bg-[#355485] text-white border-[#355485]"
                                : "bg-white text-[#355485] border-gray-300 hover:bg-gray-100"
                            }`}
                    >
                        All
                    </Link>
                    {categories.map((cat, i) => (
                        <Link
                            key={i}
                            to={`/videos/kategori/${cat}`}
                            className={`px-4 py-1 rounded-full text-sm whitespace-nowrap border transition ${selectedCategory === cat
                                    ? "bg-[#355485] text-white border-[#355485]"
                                    : "bg-white text-[#355485] border-gray-300 hover:bg-gray-100"
                                }`}
                        >
                            {cat}
                        </Link>
                    ))}
                </div>
            )}

            {/* Grid */}
            <div className="max-w-xl mx-auto px-3 pb-20">
                {loading ? (
                    <div className="columns-2 gap-2 space-y-2 mt-4">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-full h-40 bg-gray-200 rounded-lg animate-pulse"
                            ></div>
                        ))}
                    </div>
                ) : filteredVideos.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-lg shadow">
                        <i className="ri-emotion-sad-line text-2xl text-gray-400"></i>
                        <p className="mt-2 text-gray-500">Belum ada video.</p>
                    </div>
                ) : (
                    <div className="columns-2 gap-2 space-y-2 mt-2">
                        {filteredVideos.map((vid, idx) => (
                            <div
                                key={vid.id}
                                className="relative cursor-pointer"
                                onClick={() => handleOpen(idx)}
                            >
                                <video
                                    src={vid.videoUrl}
                                    muted
                                    playsInline
                                    className="w-full rounded-lg object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition">
                                    <i className="ri-play-fill text-white text-3xl"></i>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Fullscreen TikTok-style */}
            {activeIndex !== null && (
                <div className="fixed inset-0 bg-black z-[9999] flex">
                    <div
                        ref={reelsContainerRef}
                        className="h-full w-full overflow-y-auto snap-y snap-mandatory"
                        onScroll={handleScroll}
                    >
                        {filteredVideos.map((vid, idx) => (
                            <div
                                key={vid.id}
                                className="h-screen w-full snap-start relative reel-video-container flex items-center justify-center"
                                onClick={() => togglePlayPause(idx)}
                            >
                                <video
                                    ref={(el) => (videoRefs.current[idx] = el)}
                                    src={vid.videoUrl}
                                    autoPlay={activeIndex === idx}
                                    loop
                                    playsInline
                                    className="max-h-screen w-full object-contain bg-black"
                                />

                                {/* Overlay header */}
                                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent text-white z-10">
                                    <button onClick={closeModal} className="text-2xl">
                                        <i className="ri-arrow-left-line"></i>
                                    </button>
                                    <button className="text-2xl">
                                        <i className="ri-settings-3-line"></i>
                                    </button>
                                </div>

                                {/* Info bottom */}
                                <div className="absolute bottom-0 left-0 right-0 px-4 py-5 bg-gradient-to-t from-black/70 to-transparent text-white z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <img
                                            src="https://cdn-icons-png.freepik.com/512/7718/7718888.png"
                                            alt="profile"
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <span className="font-semibold">storythur</span>
                                    </div>
                                    <h3 className="font-bold text-lg">
                                        {vid.title || "Tanpa Judul"}
                                    </h3>
                                    {vid.category && (
                                        <p className="text-sm">Kategori: {vid.category}</p>
                                    )}
                                    {vid.tags && (
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {vid.tags.split(",").map((tag, i) => (
                                                <span
                                                    key={i}
                                                    className="text-xs bg-white/20 px-2 py-1 rounded"
                                                >
                                                    #{tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Right side actions */}
                                <div className="absolute bottom-24 right-4 flex flex-col items-center gap-4 text-white text-2xl z-10">
                                    <button>
                                        <i className="ri-heart-line"></i>
                                    </button>
                                    <button>
                                        <i className="ri-chat-3-line"></i>
                                    </button>
                                    <button
                                        onClick={() => handleDownload(vid.videoUrl, vid.title)}
                                    >
                                        <i className="ri-download-2-line"></i>
                                    </button>
                                </div>

                                {/* Pause overlay */}
                                {pausedVideo === idx && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                                            <i className="ri-play-fill text-white text-3xl"></i>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* BottomNav */}
            {activeIndex === null && <BottomNav />}
        </div>
    );
}
