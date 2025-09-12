import React, { useState, useEffect } from "react";
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

    // fetch data dari firestore (sort by createdAt desc)
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
    };

    // create new
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageFile) return alert("Pilih file gambar!");

        try {
            setLoading(true);
            const { url, public_id } = await uploadToCloudinary(imageFile);

            await addDoc(collection(db, "images"), {
                title,
                category,
                tags,
                imageUrl: url,
                public_id,
                createdAt: serverTimestamp(),
            });

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
        setTitle(img.title);
        setCategory(img.category);
        setTags(img.tags);
        setImageFile(null); // reset dulu
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editId) return;

        try {
            let updateData = { title, category, tags };

            // kalau user pilih file baru → upload ulang
            if (imageFile) {
                const { url, public_id } = await uploadToCloudinary(imageFile);
                updateData.imageUrl = url;
                updateData.public_id = public_id;
            }

            const docRef = doc(db, "images", editId);
            await updateDoc(docRef, updateData);

            resetForm();
            fetchImages();
        } catch (err) {
            console.error("Update error:", err);
            alert("Gagal update data");
        }
    };

    // delete firestore record only
    const handleDelete = async (id) => {
        if (!window.confirm("Yakin mau hapus data ini?")) return;
        await deleteDoc(doc(db, "images", id));
        fetchImages();
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-xl font-bold mb-4">Manage Images</h1>

            {/* Form Upload / Edit */}
            <form
                onSubmit={editId ? handleUpdate : handleSubmit}
                className="space-y-3 p-4 border rounded-lg bg-white shadow-sm mb-6"
            >
                <input
                    type="text"
                    placeholder="Title"
                    className="w-full border p-2 rounded"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Category"
                    className="w-full border p-2 rounded"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Tags (pisahkan dengan koma)"
                    className="w-full border p-2 rounded"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="w-full"
                    {...(!editId && { required: true })}
                />

                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Saving..." : editId ? "Update" : "Upload"}
                    </button>
                    {editId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {/* List Images */}
            <div className="space-y-3">
                {images.map((img) => (
                    <div
                        key={img.id}
                        className="flex items-center gap-3 border p-3 rounded bg-white shadow-sm"
                    >
                        <img
                            src={img.imageUrl}
                            alt={img.title}
                            className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                            <h3 className="font-semibold">{img.title}</h3>
                            <p className="text-sm text-gray-600">{img.category}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => handleEdit(img)}
                                className="text-blue-600 hover:underline text-sm"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(img.id)}
                                className="text-red-600 hover:underline text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
