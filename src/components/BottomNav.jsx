import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

export default function BottomNav() {
    const [showSheet, setShowSheet] = useState(false);
    const location = useLocation();

    const navItems = [
        { name: "Home", path: "/home", icon: "ri-home-3" },
        { name: "Images", path: "/images", icon: "ri-image-2" },
        { name: "Quotes", path: "/quotes", icon: "ri-chat-quote" },
        { name: "Videos", path: "/videos", icon: "ri-movie" },
    ];

    // cek apakah halaman sekarang termasuk menu others
    const isOthersActive = location.pathname.startsWith("/others");

    return (
        <>
            {/* Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#fcfeff] border-t border-gray-200 shadow-md z-50">
                <div className="max-w-xl mx-auto flex justify-around items-center py-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className="flex flex-col items-center text-xs"
                            >
                                <i
                                    className={`${item.icon}${isActive ? "-fill" : "-line"} ${isActive ? "text-[#355485]" : "text-gray-400"
                                        } text-xl transition-colors`}
                                ></i>
                                <span
                                    className={`${isActive ? "text-[#355485]" : "text-gray-400"
                                        } text-[11px]`}
                                >
                                    {item.name}
                                </span>
                            </NavLink>
                        );
                    })}

                    {/* Others */}
                    <button
                        onClick={() => setShowSheet(true)}
                        className="flex flex-col items-center text-xs focus:outline-none"
                    >
                        <i
                            className={`ri-apps-${isOthersActive ? "fill" : "line"} ${isOthersActive ? "text-[#355485]" : "text-gray-400"
                                } text-xl transition-colors`}
                        ></i>
                        <span
                            className={`${isOthersActive ? "text-[#355485]" : "text-gray-400"
                                } text-[11px]`}
                        >
                            Others
                        </span>
                    </button>
                </div>
            </div>

            {/* Bottom Sheet */}
            {showSheet && (
                <div className="fixed inset-0 z-50 flex justify-center items-end bg-black/40">
                    <div className="bg-[#fcfeff] w-full max-w-xl rounded-t-2xl p-4 shadow-lg">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-sm font-semibold text-[#355485]">
                                More Features
                            </h2>
                            <button
                                onClick={() => setShowSheet(false)}
                                className="text-xl text-gray-500 hover:text-[#4f90c6] transition"
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <NavLink
                                to="/others/audios"
                                onClick={() => setShowSheet(false)}
                                className="flex flex-col items-center"
                            >
                                <i className="ri-music-2-line text-2xl text-[#4f90c6]"></i>
                                <span className="text-xs mt-1 text-gray-600">Audios</span>
                            </NavLink>
                            <NavLink
                                to="/others/tutorial"
                                onClick={() => setShowSheet(false)}
                                className="flex flex-col items-center"
                            >
                                <i className="ri-book-open-line text-2xl text-[#4f90c6]"></i>
                                <span className="text-xs mt-1 text-gray-600">Tutorial</span>
                            </NavLink>
                            <NavLink
                                to="/others/tools"
                                onClick={() => setShowSheet(false)}
                                className="flex flex-col items-center"
                            >
                                <i className="ri-tools-line text-2xl text-[#4f90c6]"></i>
                                <span className="text-xs mt-1 text-gray-600">Tools</span>
                            </NavLink>
                            <NavLink
                                to="/others/favorites"
                                onClick={() => setShowSheet(false)}
                                className="flex flex-col items-center"
                            >
                                <i className="ri-star-line text-2xl text-yellow-500"></i>
                                <span className="text-xs mt-1 text-gray-600">Favorites</span>
                            </NavLink>
                            <NavLink
                                to="/others/settings"
                                onClick={() => setShowSheet(false)}
                                className="flex flex-col items-center"
                            >
                                <i className="ri-settings-3-line text-2xl text-gray-600"></i>
                                <span className="text-xs mt-1 text-gray-600">Settings</span>
                            </NavLink>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
