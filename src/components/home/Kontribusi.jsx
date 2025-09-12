import React from 'react'
import { Link } from 'react-router-dom'

function Kontribusi() {
    return (
        <div>
            <div className="px-4 mt-8">
                <div className="bg-[#90b6d5]/20 border border-[#90b6d5] rounded-xl p-5 shadow-sm text-center">
                    <h3 className="font-semibold text-[#355485] text-lg mb-2">
                        Yuk Kontribusi 🚀
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Kirim foto, video, quotes, atau bahan mentahan untuk memperkaya
                        konten StoryLab.
                    </p>
                    <Link
                        to="/contribute"
                        className="inline-block px-6 py-2 bg-[#355485] text-white rounded-lg hover:bg-[#4f90c6] transition"
                    >
                        Kirim Kontribusi
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Kontribusi
