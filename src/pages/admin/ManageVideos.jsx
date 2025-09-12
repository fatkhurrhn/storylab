import React, { useEffect, useRef, useState } from "react";
import { db } from "../../firebase";
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp,
    updateDoc,
    orderBy,
    query,
} from "firebase/firestore";
import { Link } from "react-router-dom";

export default function ManageVideos() {
    // Form state
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState("");
    const [file, setFile] = useState(null);

    // Data & UI state
    const [videos, setVideos] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [currentVideoUrl, setCurrentVideoUrl] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [loadingList, setLoadingList] = useState(true);

    const fileInputRef = useRef(null);

    // Cloudinary (unsigned preset)
    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const resetForm = () => {
        setTitle("");
        setCategory("");
        setTags("");
        setFile(null);
        setEditingId(null);
        setCurrentVideoUrl("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const fetchVideos = async () => {
        try {
            setLoadingList(true);
            const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            setVideos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } catch (e) {
            console.error("Fetch videos error:", e);
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);
        formData.append("folder", "videos"); // optional folder

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
            { method: "POST", body: formData }
        );
        const data = await res.json();

        if (!res.ok || !data.secure_url) {
            const msg =
                data?.error?.message || "Upload gagal. Cek upload preset (unsigned).";
            throw new Error(msg);
        }
        return data.secure_url; // direct playable URL
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSubmitting(true);

            // CREATE
            if (!editingId) {
                if (!file) {
                    alert("Pilih file video terlebih dahulu.");
                    return;
                }
                const videoUrl = await uploadToCloudinary(file);

                await addDoc(collection(db, "videos"), {
                    title: title || "",
                    category: category || "",
                    tags: tags || "",
                    videoUrl,
                    createdAt: serverTimestamp(),
                });

                resetForm();
                await fetchVideos();
                return;
            }

            // UPDATE (parsial)
            const docRef = doc(db, "videos", editingId);
            let videoUrlToUse = currentVideoUrl;

            if (file) {
                // Jika pilih file baru, upload & ganti URL
                videoUrlToUse = await uploadToCloudinary(file);
            }

            await updateDoc(docRef, {
                title: title ?? "",
                category: category ?? "",
                tags: tags ?? "",
                videoUrl: videoUrlToUse ?? "",
                updatedAt: serverTimestamp(),
            });

            resetForm();
            await fetchVideos();
        } catch (err) {
            console.error("Submit error:", err);
            alert(err.message || "Terjadi kesalahan.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Yakin ingin menghapus video ini?")) return;
        try {
            await deleteDoc(doc(db, "videos", id));
            await fetchVideos();
        } catch (e) {
            console.error("Delete error:", e);
            alert("Gagal menghapus.");
        }
    };

    const handleEdit = (video) => {
        setEditingId(video.id);
        setTitle(video.title || "");
        setCategory(video.category || "");
        setTags(video.tags || "");
        setCurrentVideoUrl(video.videoUrl || "");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const cancelEdit = () => {
        resetForm();
    };

    return (
        <div className="max-w-xl mx-auto p-4 bg-[#fcfeff] min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <Link to="/dashboard">
                    <h1 className="text-xl font-bold text-[#355485]"><i class="ri-arrow-left-line"></i> Manage Videos</h1>
                </Link>
                {editingId ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-[#90b6d5]/40 text-[#355485]">
                        Editing mode
                    </span>
                ) : null}
            </div>

            {/* Form Card */}
            <form
                onSubmit={handleSubmit}
                className="bg-white border border-[#90b6d5]/40 rounded-xl p-4 shadow-sm space-y-3"
            >
                <div className="grid gap-3">
                    <div>
                        <label className="block text-sm text-[#355485] mb-1">Judul</label>
                        <input
                            type="text"
                            placeholder="Opsional"
                            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#4f90c6] border-[#90b6d5]"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-[#355485] mb-1">Kategori</label>
                        <input
                            type="text"
                            placeholder="Opsional (mis. Motivasi, Tutorial, dll.)"
                            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#4f90c6] border-[#90b6d5]"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-[#355485] mb-1">
                            Tag (pisahkan koma)
                        </label>
                        <input
                            type="text"
                            placeholder="Opsional (mis. semangat, kerja, fokus)"
                            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#4f90c6] border-[#90b6d5]"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                        />
                    </div>

                    {/* Preview ketika edit */}
                    {editingId && currentVideoUrl ? (
                        <div>
                            <label className="block text-sm text-[#355485] mb-1">
                                Video saat ini
                            </label>
                            <video
                                src={currentVideoUrl}
                                controls
                                className="w-full rounded-lg border border-[#90b6d5]/50"
                            />
                        </div>
                    ) : null}

                    <div>
                        <label className="block text-sm text-[#355485] mb-1">
                            File Video {editingId ? "(opsional saat edit)" : "(wajib saat upload)"}
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/*"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-white file:bg-[#4f90c6] hover:file:bg-[#355485] cursor-pointer"
                        />
                    </div>
                </div>

                <div className="flex gap-2 pt-1">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-[#355485] hover:bg-[#2e4570] text-white rounded-lg py-2 font-medium transition"
                    >
                        {submitting
                            ? "Memproses..."
                            : editingId
                                ? "Update Video"
                                : "Upload Video"}
                    </button>
                    {editingId ? (
                        <button
                            type="button"
                            onClick={cancelEdit}
                            className="px-4 bg-white border border-[#90b6d5] text-[#355485] rounded-lg hover:bg-[#90b6d5]/20 transition"
                        >
                            Cancel
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 bg-white border border-[#90b6d5] text-[#355485] rounded-lg hover:bg-[#90b6d5]/20 transition"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </form>

            {/* List Videos */}
            <div className="mt-5">
                <h2 className="text-sm font-semibold text-[#355485] mb-2">
                    Daftar Video
                </h2>

                {loadingList ? (
                    <div className="grid gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="rounded-xl bg-white border border-[#90b6d5]/40 p-3"
                            >
                                <div className="w-full h-40 rounded-lg bg-[#90b6d5]/30 animate-pulse"></div>
                                <div className="h-4 w-1/3 bg-[#90b6d5]/30 mt-3 rounded animate-pulse"></div>
                                <div className="h-3 w-1/2 bg-[#90b6d5]/30 mt-2 rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-8 text-[#355485] bg-white border border-[#90b6d5]/40 rounded-xl">
                        Belum ada video.
                    </div>
                ) : (
                            <div className="flex flex-col gap-3">
                                {videos.map((vid) => (
                                    <div
                                        key={vid.id}
                                        className="relative flex items-start gap-3 rounded-xl bg-white border border-[#90b6d5]/40 p-3"
                                    >
                                        {/* Video kecil di kiri */}
                                        <div className="w-32 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-black">
                                            <video
                                                src={vid.videoUrl}
                                                controls
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Info di kanan */}
                                        <div className="flex-1 pr-16">
                                            <h3 className="font-semibold text-[#355485]">
                                                {vid.title || <span className="text-gray-400">Tanpa judul</span>}
                                            </h3>
                                            <p className="text-xs text-[#355485]/80 mt-0.5">
                                                Kategori: {vid.category || <span className="text-gray-400">-</span>}
                                            </p>

                                            {vid.tags ? (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {vid.tags.split(",").map((t, i) => (
                                                        <span
                                                            key={i}
                                                            className="text-[11px] px-2 py-0.5 rounded bg-[#90b6d5]/30 text-[#355485]"
                                                        >
                                                            #{t.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>

                                        {/* Tombol aksi (pojok kanan atas) */}
                                        <div className="absolute top-2 right-2 flex items-center gap-2 text-[#355485]">
                                            <button
                                                onClick={() => handleEdit(vid)}
                                                className="hover:text-[#4f90c6] transition"
                                            >
                                                <i className="ri-edit-line text-lg"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(vid.id)}
                                                className="hover:text-red-600 transition"
                                            >
                                                <i className="ri-delete-bin-5-line text-lg"></i>
                                            </button>
                                            <a
                                                href={vid.videoUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="hover:text-[#4f90c6] transition"
                                            >
                                                <i className="ri-link-m text-lg"></i>
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>

                )}
            </div>
        </div>
    );
}
