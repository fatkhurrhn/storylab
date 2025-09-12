import React, { useState, useEffect } from "react";
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

export default function ManageVideos() {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState("");
    const [file, setFile] = useState(null);

    const [videos, setVideos] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    // Ambil data video
    const fetchVideos = async () => {
        const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setVideos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);
        formData.append("folder", "videos");

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
            { method: "POST", body: formData }
        );
        const data = await res.json();
        if (!data.secure_url) throw new Error("Upload gagal");
        return data.secure_url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !category || !file) {
            alert("Lengkapi semua field!");
            return;
        }

        try {
            setLoading(true);
            const videoUrl = await uploadToCloudinary(file);

            if (editingId) {
                // update
                const docRef = doc(db, "videos", editingId);
                await updateDoc(docRef, {
                    title,
                    category,
                    tags,
                    videoUrl,
                });
                setEditingId(null);
            } else {
                // create
                await addDoc(collection(db, "videos"), {
                    title,
                    category,
                    tags,
                    videoUrl,
                    createdAt: serverTimestamp(),
                });
            }

            // reset form
            setTitle("");
            setCategory("");
            setTags("");
            setFile(null);

            await fetchVideos();
        } catch (err) {
            console.error("Upload error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Yakin ingin menghapus video ini?")) return;
        await deleteDoc(doc(db, "videos", id));
        fetchVideos();
    };

    const handleEdit = (video) => {
        setTitle(video.title);
        setCategory(video.category);
        setTags(video.tags);
        setEditingId(video.id);
        window.scrollTo(0, 0);
    };

    return (
        <div className="max-w-xl mx-auto p-4">
            <h1 className="text-xl font-bold mb-4">Manage Videos</h1>

            {/* Form Upload */}
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow p-4 rounded-lg mb-6 space-y-3"
            >
                <input
                    type="text"
                    placeholder="Judul"
                    className="w-full border p-2 rounded"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Kategori"
                    className="w-full border p-2 rounded"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Tag (pisahkan dengan koma)"
                    className="w-full border p-2 rounded"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                />
                <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setFile(e.target.files[0])}
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
                >
                    {loading ? "Memproses..." : editingId ? "Update Video" : "Upload Video"}
                </button>
            </form>

            {/* List Videos */}
            <div className="grid gap-4">
                {videos.map((vid) => (
                    <div
                        key={vid.id}
                        className="bg-white shadow rounded-lg overflow-hidden"
                    >
                        <video
                            src={vid.videoUrl}
                            controls
                            className="w-full max-h-60 object-cover"
                        ></video>
                        <div className="p-3">
                            <h2 className="font-semibold">{vid.title}</h2>
                            <p className="text-sm text-gray-500">Kategori: {vid.category}</p>
                            {vid.tags && (
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {vid.tags.split(",").map((tag, i) => (
                                        <span
                                            key={i}
                                            className="text-xs bg-gray-100 px-2 py-1 rounded"
                                        >
                                            #{tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => handleEdit(vid)}
                                    className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(vid.id)}
                                    className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
