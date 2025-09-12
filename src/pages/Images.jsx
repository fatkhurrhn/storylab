import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export default function Images() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [categories, setCategories] = useState(["all"]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Scroll hide/show header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Shuffle array (Fisher-Yates)
  const shuffleArray = (arr) => {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  // Fetch data Firestore
  const fetchImages = async () => {
    try {
      const q = query(collection(db, "images"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // urutan acak untuk "all"
      setImages(shuffleArray(data));

      // ambil kategori unik & sort alphabet
      const uniqueCats = [
        ...new Set(data.map((img) => img.category).filter(Boolean)),
      ].sort((a, b) => a.localeCompare(b));

      setCategories(["all", ...uniqueCats]);
    } catch (err) {
      console.error("Error fetching images:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Filter images by search + category
  const filteredImages = images.filter((img) => {
    const title = img.title?.toLowerCase() || "";
    const category = img.category?.toLowerCase() || "";
    const tags = img.tags?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();

    const matchSearch =
      !term ||
      title.includes(term) ||
      category.includes(term) ||
      tags.includes(term);

    const matchCategory =
      selectedCategory === "all" ||
      img.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchSearch && matchCategory;
  });

  return (
    <div className="max-w-xl mx-auto min-h-screen bg-[#fcfeff] pb-16">
      {/* Header */}
      <div
        className={`fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200 transition-transform duration-300 ${showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
      >
        <div className="max-w-xl mx-auto flex items-center justify-between px-3 py-3">
          {showSearch ? (
            // Mode search: tampilkan input
            <div className="flex items-center w-full gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Cari title, kategori, atau tags..."
                className="flex-1 ml-1 p-1 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#4f90c6] text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                onClick={() => {
                  setSearchTerm("");
                  setShowSearch(false);
                }}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
          ) : (
            <>
              <Link to="/">
                <h1 className="flex items-center font-semibold gap-2 text-[#355485] text-[15px]">
                  <i className="ri-arrow-left-line"></i> Images
                </h1>
              </Link>
              <button
                className="text-[#355485]"
                onClick={() => setShowSearch(true)}
              >
                <i className="ri-search-2-line text-xl"></i>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Category bar */}
      <div className="pt-16 px-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1 rounded-full text-sm whitespace-nowrap border transition ${selectedCategory === cat
                  ? "bg-[#355485] text-white border-[#355485]"
                  : "bg-white text-[#355485] border-gray-300 hover:bg-gray-100"
                }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid images */}
      <div className="px-2 pb-2">
        {loading ? (
          <div className="columns-2 gap-2 space-y-2 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="w-full rounded-lg bg-gray-200 aspect-[3/4]"
              ></div>
            ))}
          </div>
        ) : filteredImages.length > 0 ? (
          <div className="columns-2 gap-2 space-y-2">
            {filteredImages.map((img) => (
              <Link
                key={img.id}
                to={`/images/${img.id}`}
                className="break-inside-avoid block"
              >
                <img
                  src={img.imageUrl}
                  alt={img.title || ""}
                  className="w-full rounded-lg shadow-sm object-cover hover:opacity-90 transition"
                  loading="lazy"
                />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-10">
            Tidak ada gambar ditemukan
          </p>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
