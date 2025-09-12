import React, { useEffect, useState } from 'react'

function Quote() {
    const [quote, setQuote] = useState("");
    
      const quotes = [
        "Kreativitas adalah kecerdasan yang bersenang-senang.",
        "Jangan takut gagal, karena dari situlah kita belajar.",
        "Setiap karya adalah langkah menuju mimpi.",
      ];
    
      useEffect(() => {
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
      }, []);
  return (
    <div>
          <div className="px-4 -mt-4">
              <div className="bg-white rounded-xl shadow-md p-4 text-center">
                  <i className="ri-double-quotes-l text-[#4f90c6] text-2xl"></i>
                  <p className="italic text-[#355485] mt-2">“{quote}”</p>
              </div>
          </div>
    </div>
  )
}

export default Quote
