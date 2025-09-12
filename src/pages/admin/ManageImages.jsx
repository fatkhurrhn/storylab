import React, { useState, useEffect, useRef } from "react";
import { db } from "../../firebase";
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    serverTimestamp,
    query,
    orderBy,
} from "firebase/firestore";
import { Link } from "react-router-dom";

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function ManageImages() {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState(null);

    const [activeTab, setActiveTab] = useState("All");
    const dropRef = useRef(null);

    // fetch data
    const fetchImages = async () => {
        const q = query(collection(db, "images"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setImages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    useEffect(() => {
        fetchImages();
    }, []);

    // upload ke cloudinary
    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: "POST", body: formData }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Upload gagal");

        return { url: data.secure_url, public_id: data.public_id };
    };

    // reset form
    const resetForm = () => {
        setTitle("");
        setCategory("");
        setTags("");
        setImageFile(null);
        setEditId(null);
        if (dropRef.current) dropRef.current.value = "";
    };

    // handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageFile && !editId) return alert("Pilih file gambar!");

        try {
            setLoading(true);
            let updateData = { title, category, tags };

            if (imageFile) {
                const { url, public_id } = await uploadToCloudinary(imageFile);
                updateData.imageUrl = url;
                updateData.public_id = public_id;
            }

            if (editId) {
                const docRef = doc(db, "images", editId);
                await updateDoc(docRef, updateData);
            } else {
                await addDoc(collection(db, "images"), {
                    ...updateData,
                    createdAt: serverTimestamp(),
                });
            }

            resetForm();
            fetchImages();
        } catch (err) {
            console.error("Upload error:", err);
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    // edit
    const handleEdit = (img) => {
        setEditId(img.id);
        setTitle(img.title || "");
        setCategory(img.category || "");
        setTags(img.tags || "");
        setImageFile(null);
        window.scrollTo(0, 0);
    };

    // delete
    const handleDelete = async (id) => {
        if (!window.confirm("Yakin mau hapus data ini?")) return;
        await deleteDoc(doc(db, "images", id));
        fetchImages();
    };

    // drag & drop & paste
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        if (file) setImageFile(file);
    };

    const handlePaste = (e) => {
        const file = e.clipboardData.files[0];
        if (file) setImageFile(file);
    };

    // hitung kategori
    const categoryCounts = images.reduce((acc, img) => {
        const cat = img.category || "Uncategorized";
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});

    // urut kategori A-Z
    const sortedCategories = Object.keys(categoryCounts).sort((a, b) =>
        a.localeCompare(b)
    );

    // filter images sesuai tab
    const filteredImages =
        activeTab === "All"
            ? images
            : images.filter((img) => (img.category || "Uncategorized") === activeTab);

    return (
        <div className="max-w-2xl mx-auto p-4">
<Link to="/dashboard">
                <h1 className="text-xl font-bold mb-4"><i class="ri-arrow-left-line"></i> Manage Images</h1>

</Link>
            {/* Form Upload / Edit */}
            <form
                onSubmit={handleSubmit}
                onPaste={handlePaste}
                className="bg-white shadow p-4 rounded-lg mb-6 space-y-3"
            >
                <input
                    type="text"
                    placeholder="Judul (opsional)"
                    className="w-full border p-2 rounded"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Kategori (opsional)"
                    className="w-full border p-2 rounded"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Tags (pisahkan dengan koma, opsional)"
                    className="w-full border p-2 rounded"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                />

                {/* Upload area */}
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition"
                    onClick={() => dropRef.current.click()}
                >
                    {imageFile ? (
                        <div className="flex flex-col items-center space-y-2">
                            <img
                                src={URL.createObjectURL(imageFile)}
                                alt="preview"
                                className="w-32 h-32 object-cover rounded-lg"
                            />
                            <p className="text-sm text-gray-600">{imageFile.name}</p>
                            <button
                                type="button"
                                onClick={() => setImageFile(null)}
                                className="text-xs text-red-500 underline"
                            >
                                Hapus File
                            </button>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">
                            Drag & Drop / Klik untuk pilih / Paste (Ctrl+V)
                        </p>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        ref={dropRef}
                        onChange={(e) => setImageFile(e.target.files[0])}
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? "Menyimpan..." : editId ? "Update" : "Upload"}
                    </button>
                    {editId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                        >
                            Batal
                        </button>
                    )}
                </div>
            </form>

            {/* Tabs kategori */}
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab("All")}
                    className={`px-4 py-1 rounded-full text-sm border ${activeTab === "All"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-blue-600 border-gray-300"
                        }`}
                >
                    All ({images.length})
                </button>
                {sortedCategories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`px-4 py-1 rounded-full text-sm border whitespace-nowrap ${activeTab === cat
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-blue-600 border-gray-300"
                            }`}
                    >
                        {cat} ({categoryCounts[cat]})
                    </button>
                ))}
            </div>

            {/* List Images */}
            <div className="grid gap-4">
                {filteredImages.map((img) => (
                    <div
                        key={img.id}
                        className="bg-white shadow rounded-lg overflow-hidden flex items-center gap-3 p-3"
                    >
                        <img
                            src={img.imageUrl}
                            alt={img.title}
                            className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                            <h3 className="font-semibold">{img.title || "Tanpa Judul"}</h3>
                            <p className="text-sm text-gray-600">
                                {img.category || "Uncategorized"}
                            </p>
                            {img.tags && (
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {img.tags.split(",").map((tag, i) => (
                                        <span
                                            key={i}
                                            className="text-xs bg-gray-100 px-2 py-1 rounded"
                                        >
                                            #{tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <button
                                onClick={() => handleEdit(img)}
                                className="px-3 py-1 bg-yellow-500 text-white rounded text-xs"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(img.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded text-xs"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
