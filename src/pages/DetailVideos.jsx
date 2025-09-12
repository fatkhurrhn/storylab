import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
} from "firebase/firestore";
import BottomNav from "../components/BottomNav";

export default function DetailVideos() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [video, setVideo] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);

    // header auto-hide
    const [showHeader, setShowHeader] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // state download
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY) setShowHeader(false);
            else setShowHeader(true);
            setLastScrollY(currentScrollY);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    const fetchVideoDetail = async () => {
        try {
            const docRef = doc(db, "videos", id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const vidData = { id: docSnap.id, ...docSnap.data() };
                setVideo(vidData);

                if (vidData.category && vidData.category !== "") {
                    const q = query(
                        collection(db, "videos"),
                        where("category", "==", vidData.category),
                        orderBy("createdAt", "desc")
                    );
                    const snap = await getDocs(q);
                    const relatedVideos = snap.docs
                        .map((d) => ({ id: d.id, ...d.data() }))
                        .filter((d) => d.id !== id);
                    setRelated(relatedVideos);
                }
            }
        } catch (err) {
            console.error("Error fetch detail:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideoDetail();
    }, [id]);

    const handleDownload = async () => {
        if (!video?.videoUrl) return;
        setIsDownloading(true);

        try {
            const res = await fetch(video.videoUrl);
            if (!res.ok) throw new Error("Failed to fetch video");
            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);

            const extFromType = (blob.type?.split("/")?.[1] || "mp4").split(";")[0];
            const safeTitle = (video.title || "video").replace(/[^\w\-]+/g, "_");

            const a = document.createElement("a");
            a.href = objectUrl;
            a.download = `${safeTitle}.${extFromType}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(objectUrl);
        } catch (e) {
            console.error("Download error:", e);
            window.open(video.videoUrl, "_blank");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto min-h-screen bg-[#fcfeff] pb-16">
            {/* Header auto-hide */}
            <div
                className={`fixed top-0 left-0 w-full z-50 bg-[#fcfeff] border-b border-gray-300 transition-transform duration-300 ${showHeader ? "translate-y-0" : "-translate-y-full"
                    }`}
            >
                <div className="max-w-xl mx-auto flex items-center justify-between px-3 py-3">
                    <div
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <i className="ri-arrow-left-line text-xl text-[#355485] hover:text-[#4f90c6]"></i>
                        <h1 className="text-[15px] font-semibold text-[#355485]">
                            Detail Video
                        </h1>
                    </div>
                    <button
                        onClick={() => console.log("Settings clicked")}
                        className="text-xl text-[#355485] hover:text-[#4f90c6]"
                    >
                        <i className="ri-settings-3-line"></i>
                    </button>
                </div>
            </div>

            {/* Detail */}
            <div className="px-3 pt-16">
                {/* Skeleton Video */}
                {loading ? (
                    <div className="w-full rounded-lg bg-gray-200 animate-pulse mb-3 aspect-video"></div>
                ) : (
                    <video
                        src={video?.videoUrl}
                        controls
                        className="w-full rounded-lg mb-3 bg-black"
                    />
                )}

                {!loading && video && (
                    <>
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-md font-bold text-[#355485]">
                                {video.title || "Tanpa Judul"}
                            </h2>
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className={`flex items-center gap-2 text-sm px-3 py-1 rounded text-white transition ${isDownloading
                                        ? "bg-[#4f90c6] opacity-80 cursor-not-allowed"
                                        : "bg-[#355485] hover:bg-[#4f90c6]"
                                    }`}
                            >
                                {isDownloading ? (
                                    <>
                                        <i className="ri-loader-2-line animate-spin"></i>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <i className="ri-download-2-line"></i>
                                        Unduh
                                    </>
                                )}
                            </button>
                        </div>

                        {video.category && (
                            <p className="text-sm text-gray-600 mb-2">
                                Kategori:{" "}
                                <span className="font-medium text-[#355485]">
                                    {video.category}
                                </span>
                            </p>
                        )}

                        {video.tags && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {video.tags.split(",").map((tag, i) => (
                                    <span
                                        key={i}
                                        className="text-xs bg-[#90b6d5]/30 text-[#355485] px-2 py-1 rounded"
                                    >
                                        #{tag.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <hr className="text-[#355485] my-3" />

            {/* Related Videos */}
            <div className="px-3">
                <h3 className="text-md font-semibold mb-2 text-[#355485]">
                    Lainnya di kategori {video?.category || "..."}
                </h3>

                {loading ? (
                    <div className="columns-2 gap-2 space-y-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-full rounded-lg bg-gray-200 animate-pulse aspect-video"
                            ></div>
                        ))}
                    </div>
                ) : related.length > 0 ? (
                    <div className="columns-2 gap-2 space-y-2">
                        {related.map((vid) => (
                            <Link
                                key={vid.id}
                                to={`/videos/${vid.id}`}
                                className="break-inside-avoid block"
                            >
                                <video
                                    src={vid.videoUrl}
                                    muted
                                    playsInline
                                    className="w-full rounded-lg shadow-sm object-cover hover:opacity-90 transition"
                                />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">Tidak ada video lain.</p>
                )}
            </div>

            {/* Bottom Nav */}
            <BottomNav />
        </div>
    );
}
