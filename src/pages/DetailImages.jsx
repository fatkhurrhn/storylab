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

export default function DetailImages() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
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

    const fetchImageDetail = async () => {
        try {
            const docRef = doc(db, "images", id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const imgData = { id: docSnap.id, ...docSnap.data() };
                setImage(imgData);

                if (imgData.category && imgData.category !== "") {
                    const q = query(
                        collection(db, "images"),
                        where("category", "==", imgData.category),
                        orderBy("createdAt", "desc")
                    );
                    const snap = await getDocs(q);
                    const relatedImages = snap.docs
                        .map((d) => ({ id: d.id, ...d.data() }))
                        .filter((d) => d.id !== id);
                    setRelated(relatedImages);
                }
            }
        } catch (err) {
            console.error("Error fetch detail:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImageDetail();
    }, [id]);

    // Buat URL Cloudinary dengan fl_attachment di path (fallback)
    const makeAttachmentUrl = (rawUrl, filename) => {
        try {
            const u = new URL(rawUrl);
            const parts = u.pathname.split("/"); // .../image/upload/.../publicId.ext
            const idx = parts.findIndex((p) => p === "upload");
            if (idx !== -1) {
                // sisipkan fl_attachment:filename setelah 'upload'
                parts.splice(idx + 1, 0, `fl_attachment:${encodeURIComponent(filename)}`);
                u.pathname = parts.join("/");
                return u.toString();
            }
        } catch (e) {
            // ignore & fallback ke query
        }
        return (
            rawUrl +
            (rawUrl.includes("?") ? "&" : "?") +
            "fl_attachment=" +
            encodeURIComponent(filename)
        );
    };

    const handleDownload = async () => {
        if (!image?.imageUrl) return;
        setIsDownloading(true);

        try {
            // 1) Coba fetch blob → paling andal untuk paksa download (tanpa tergantung header server)
            const res = await fetch(image.imageUrl, { credentials: "omit", mode: "cors" });
            if (!res.ok) throw new Error("Failed to fetch image");
            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);

            const extFromType = (blob.type?.split("/")?.[1] || "jpg").split(";")[0];
            const safeTitle = (image.title || "image").replace(/[^\w\-]+/g, "_");

            const a = document.createElement("a");
            a.href = objectUrl;
            a.download = `${safeTitle}.${extFromType}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(objectUrl);
        } catch (e) {
            // 2) Fallback: pakai fl_attachment agar Cloudinary kirim Content-Disposition
            const safeTitle = (image.title || "image").replace(/[^\w\-]+/g, "_");
            const attachUrl = makeAttachmentUrl(image.imageUrl, `${safeTitle}.jpg`);
            const a = document.createElement("a");
            a.href = attachUrl;
            a.download = `${safeTitle}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
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
                        <h1 className="text-[15px] font-semibold text-[#355485]">Detail Image</h1>
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
                {/* Skeleton Image */}
                {loading ? (
                    <div className="w-full rounded-lg bg-gray-200 animate-pulse mb-3 aspect-[3/4]"></div>
                ) : (
                    <img
                        src={image?.imageUrl}
                        alt={image?.title}
                        className="w-full rounded-lg mb-3"
                    />
                )}

                {!loading && image && (
                    <>
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-md font-bold text-[#355485]">
                                {image.title || "Tanpa Judul"}
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

                        {image.tags && (
                            <div className="-mt-3 flex flex-wrap gap-2">
                                {image.tags.split(",").map((tag, i) => (
                                    <span key={i} className="text-xs text-[#355485] py-1 rounded">
                                        #{tag.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Related Images */}
            <div className="px-3">
                <h3 className="text-md font-semibold mb-2 text-[#355485]">
                    Lainnya di kategori {image?.category || "..."}
                </h3>

                {loading ? (
                    // Skeleton grid related
                    <div className="columns-2 gap-2 space-y-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-full rounded-lg bg-gray-200 animate-pulse aspect-[3/4]"
                            ></div>
                        ))}
                    </div>
                ) : (
                    <div className="columns-2 gap-2 space-y-2">
                        {related.map((img) => (
                            <Link
                                key={img.id}
                                to={`/images/${img.id}`}
                                className="break-inside-avoid block"
                            >
                                <img
                                    src={img.imageUrl}
                                    alt=""
                                    className="w-full rounded-lg shadow-sm object-cover hover:opacity-90 transition"
                                    loading="lazy"
                                />
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Nav */}
            <BottomNav />
        </div>
    );
}
