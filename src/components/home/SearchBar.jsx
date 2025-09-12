import React from 'react'

function SearchBar() {
  return (
    <div>
          <div className="mt-4">
              <input
                  type="text"
                  placeholder="Cari bahan mentahan..."
                  className="w-full px-4 py-2 rounded-full border border-white/40 focus:ring-2 focus:ring-white focus:outline-none text-sm"
              />
          </div>
    </div>
  )
}

export default SearchBar
