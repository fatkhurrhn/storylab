import React from 'react'

function KategoriSlider() {
  return (
    <div>
          <div className="px-4 mt-8">
              <h2 className="text-md font-semibold text-[#355485] mb-3">
                  🔍 Jelajahi Kategori
              </h2>
              <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2">
                  {["Kucing", "Pemandangan", "Quotes", "Anime", "Motivasi"].map(
                      (cat) => (
                          <button
                              key={cat}
                              className="px-4 py-2 rounded-full bg-[#90b6d5]/30 text-[#355485] text-sm hover:bg-[#4f90c6] hover:text-white transition"
                          >
                              {cat}
                          </button>
                      )
                  )}
              </div>
          </div>
    </div>
  )
}

export default KategoriSlider
