import React from 'react'

function VidMotivasi() {
  return (
    <div>
          <div className="px-4 mt-6">
              <h2 className="text-md font-semibold text-[#355485] mb-2">
                  🎬 Video Motivasi
              </h2>
              <div className="rounded-xl overflow-hidden shadow-lg bg-black">
                  <video
                      src="/videos/motivasi.mp4"
                      className="w-full"
                      controls
                      playsInline
                  />
              </div>
          </div>
    </div>
  )
}

export default VidMotivasi
