import React from 'react'
import { Link } from 'react-router-dom'

function QuickMenu() {
    return (
        <div>
            <div className="px-4 mt-6">
                <h2 className="text-md font-semibold text-[#355485] mb-3">
                    🚀 Akses Cepat
                </h2>
                <div className="grid grid-cols-4 gap-4 text-center">
                    {[
                        { name: "Images", icon: "ri-image-2-line", path: "/images" },
                        { name: "Videos", icon: "ri-movie-line", path: "/videos" },
                        { name: "Quotes", icon: "ri-chat-quote-line", path: "/quotes" },
                        { name: "Tutorial", icon: "ri-book-open-line", path: "/tutorial" },
                        { name: "Audios", icon: "ri-music-2-line", path: "/audios" },
                        { name: "Tools", icon: "ri-tools-line", path: "/others/tools" },
                        { name: "Favorites", icon: "ri-star-line", path: "/others/favorites" },
                        { name: "Settings", icon: "ri-settings-3-line", path: "/others/settings" },
                    ].map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className="flex flex-col items-centerjustify-center bg-[#f1f6fb] hover:bg-[#e3edf7] rounded-xl p-3 shadow-sm transition"
                        >
                            <i className={`${item.icon} text-2xl text-[#4f90c6]`}></i>
                            <span className="text-xs -mt-0">{item.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default QuickMenu
