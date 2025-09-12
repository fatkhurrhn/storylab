import React from 'react'

function Populer() {
  return (
    <div>
          <div className="px-4 mt-8">
              <h2 className="text-md font-semibold text-[#355485] mb-2">
                  🔥 Yang Lagi Populer
              </h2>
              <div className="columns-2 gap-2 space-y-2">
                  {[1, 2, 3, 4].map((id) => (
                      <img
                          key={id}
                          src={`https://picsum.photos/300/40${id}`}
                          alt=""
                          className="w-full rounded-lg shadow-sm object-cover"
                          loading="lazy"
                      />
                  ))}
              </div>
          </div>
    </div>
  )
}

export default Populer
