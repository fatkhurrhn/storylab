import React, { useEffect, useState } from 'react'

function Quote() {
    const [quote, setQuote] = useState("");

    const quotes = [
        "Kreativitas adalah kecerdasan yang bersenang-senang.",
        "Jangan takut gagal, karena dari situlah kita belajar.",
        "Setiap karya adalah langkah menuju mimpi.",
        "Jangan tunggu sempurna untuk mulai, mulai dulu maka proses akan menyempurnakan.",
        "Konten kecil hari ini bisa jadi inspirasi besar bagi orang lain esok hari.",
        "Lebih baik satu konten sederhana terbit, daripada ide hebat yang hanya disimpan.",
        "Jangan takut tidak ada yang melihat, karena setiap karya pasti menemukan audiensnya.",
        "Konsistensi kecil membangun dampak besar dalam jangka panjang.",
        "Berkarya itu bukan soal siapa yang melihat, tapi soal siapa yang terbantu.",
        "Jangan malas membuat konten, karena dunia butuh suaramu.",
        "Kontenmu mungkin sederhana, tapi bisa jadi jawaban bagi orang lain.",
        "Semua kreator besar dulu pernah merasa tidak ada yang menonton.",
        "Membuat konten adalah investasi untuk kebermanfaatan masa depan.",
        "Jangan bandingkan awalmu dengan tengah perjalanan orang lain.",
        "Lebih baik kontenmu apa adanya, daripada tidak pernah ada.",
        "Setiap kali kamu berbagi, kamu menyalakan api inspirasi pada orang lain.",
        "Ketakutan terbesar bukanlah gagal, tapi tidak pernah mencoba.",
        "Konten yang konsisten akan selalu lebih kuat daripada konten yang sempurna.",
        "Mulai dari satu konten hari ini, siapa tahu jadi gerakan besar besok."
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
