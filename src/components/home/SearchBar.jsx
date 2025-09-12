import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function SearchBar() {
  const [showModal, setShowModal] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // menu statis
  const staticMenus = [
    { name: "Home", path: "/home", icon: "ri-home-3-line", type: "menu" },
    { name: "Images", path: "/images", icon: "ri-image-2-line", type: "menu" },
    { name: "Videos", path: "/videos", icon: "ri-movie-line", type: "menu" },
    { name: "Quotes", path: "/quotes", icon: "ri-chat-quote-line", type: "menu" },
    { name: "Tutorials", path: "/others/tutorial", icon: "ri-book-open-line", type: "menu" },
    { name: "Audios", path: "/others/audios", icon: "ri-music-2-line", type: "menu" },
  ];

  // data dinamis (images + videos)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const imagesQ = query(collection(db, "images"), orderBy("createdAt", "desc"));
        const videosQ = query(collection(db, "videos"), orderBy("createdAt", "desc"));

        const [imagesSnap, videosSnap] = await Promise.all([
          getDocs(imagesQ),
          getDocs(videosQ),
        ]);

        const images = imagesSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          type: "image",
          path: `/images/${d.id}`,
        }));

        const videos = videosSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          type: "video",
          path: `/videos/${d.id}`,
        }));

        setResults([...staticMenus, ...images, ...videos]);
      } catch (err) {
        console.error("Error fetching search data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // filter suggestion
  const filtered =
    queryText.trim() === ""
      ? staticMenus
      : results.filter((item) => {
        if (item.type === "menu") {
          return item.name.toLowerCase().includes(queryText.toLowerCase());
        }
        return (
          (item.title && item.title.toLowerCase().includes(queryText.toLowerCase())) ||
          (item.category && item.category.toLowerCase().includes(queryText.toLowerCase())) ||
          (item.tags && item.tags.toLowerCase().includes(queryText.toLowerCase()))
        );
      });

  return (
    <>
      {/* Trigger */}
      <div className="mt-4">
        <button
          onClick={() => setShowModal(true)}
          className="w-full px-4 py-2 rounded-full border border-[#90b6d5] text-[#355485] text-left text-sm bg-white shadow-sm hover:bg-[#f4f9fc] transition"
        >
          <i className="ri-search-2-line mr-2"></i> Cari bahan mentahan...
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex justify-center items-start">
          <div className="w-full max-w-xl bg-[#fcfeff] h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#90b6d5] bg-white sticky top-0">
              <i className="ri-search-2-line text-[#355485] text-xl"></i>
              <input
                autoFocus
                type="text"
                placeholder="Cari fitur, halaman, kategori..."
                className="flex-1 p-2 text-sm outline-none bg-transparent text-[#355485]"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
              />
              <button
                onClick={() => {
                  setShowModal(false);
                  setQueryText("");
                }}
                className="text-[#355485] text-xl hover:text-[#4f90c6]"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>

            {/* Isi hasil */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center py-10 text-[#355485]/70">
                  <i className="ri-loader-2-line animate-spin text-2xl"></i>
                  <p className="text-sm mt-2">Memuat data...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-[#355485]/70">
                  <i className="ri-search-eye-line text-4xl mb-2"></i>
                  <p className="text-sm">Tidak ditemukan</p>
                </div>
              ) : (
                <>
                  {/* menu statis ditampilkan sebagai grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {filtered
                      .filter((f) => f.type === "menu")
                      .map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={() => setShowModal(false)}
                          className="flex flex-col items-center justify-center p-4 rounded-lg bg-white border border-[#90b6d5]/40 hover:bg-[#90b6d5]/20 transition"
                        >
                          <i className={`${item.icon} text-2xl text-[#355485] mb-2`}></i>
                          <span className="text-sm font-medium text-[#355485]">
                            {item.name}
                          </span>
                        </Link>
                      ))}
                  </div>

                  {/* hasil dari firestore */}
                  <div className="space-y-3">
                    {filtered
                      .filter((f) => f.type === "image" || f.type === "video")
                      .map((item) => (
                        <Link
                          key={item.id}
                          to={item.path}
                          onClick={() => setShowModal(false)}
                          className="flex items-center gap-3 p-2 rounded-lg bg-white border border-[#90b6d5]/40 hover:bg-[#90b6d5]/20 transition"
                        >
                          {item.type === "image" ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title || "image"}
                              className="w-14 h-14 rounded object-cover"
                            />
                          ) : (
                            <video
                              src={item.videoUrl}
                              className="w-14 h-14 rounded object-cover"
                              muted
                            />
                          )}
                          <div>
                            <p className="text-sm font-semibold text-[#355485] truncate">
                              {item.title || "Tanpa Judul"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.category || "-"}
                            </p>
                          </div>
                        </Link>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
