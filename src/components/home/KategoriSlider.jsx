import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";

function KategoriSlider() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const snap = await getDocs(collection(db, "videos"));
                // ambil semua category, filter unik & valid
                const allCats = snap.docs
                    .map((doc) => doc.data().category)
                    .filter((cat) => cat && cat.trim() !== "");
                const uniqueCats = [...new Set(allCats)];
                setCategories(uniqueCats);
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };

        fetchCategories();
    }, []);

    return (
        <div className="px-4 mt-8">
            <h2 className="text-md font-semibold text-[#355485] mb-3">
                🔍 Jelajahi Kategori
            </h2>

            <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2">
                {categories.length > 0 ? (
                    categories.map((cat) => (
                        <Link
                            key={cat}
                            to={`/videos/kategori/${encodeURIComponent(cat)}`}
                            className="px-4 py-2 rounded-full bg-[#90b6d5]/30 text-[#355485] text-sm hover:bg-[#4f90c6] hover:text-white transition whitespace-nowrap"
                        >
                            {cat}
                        </Link>
                    ))
                ) : (
                    <p className="text-sm text-gray-400">Memuat kategori...</p>
                )}
            </div>
        </div>
    );
}

export default KategoriSlider;
