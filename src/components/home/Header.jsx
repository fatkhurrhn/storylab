import React from 'react'
import SearchBar from './SearchBar'
import { Link } from 'react-router-dom'

function Header() {
    return (
        <div>
            <div className="bg-gradient-to-r from-[#355485] to-[#4f90c6] rounded-b-3xl shadow-lg px-5 py-6">
                <div className="flex items-center justify-between -mt-2">
                    <h1 className="text-2xl font-bold text-white">StoryLab</h1>
                    <Link to="/login">
                        <i className="ri-notification-3-line text-white text-xl"></i>
                    </Link>
                </div>
                <p className="text-sm text-[#d8e8f6] mt-1">
                    Explore • Create • Share
                </p>

                {/* Search bar */}
                <SearchBar/>
            </div>
        </div>
    )
}

export default Header
