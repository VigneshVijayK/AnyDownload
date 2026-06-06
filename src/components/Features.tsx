const features = [
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    ),
    title: "Reels & Videos",
    desc: "Download Reels and IGTV videos in original HD quality",
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
    title: "Carousel Posts",
    desc: "Save entire carousel posts — every single image and video",
  },
  {
    icon: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </>
    ),
    title: "Stories & Highlights",
    desc: "Download active stories and story highlights anonymously",
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    ),
    title: "Profile Pictures",
    desc: "Download profile pictures in full HD resolution",
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    ),
    title: "Unlimited Downloads",
    desc: "No daily limits or restrictions on downloads",
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
    title: "100% Free & Safe",
    desc: "No login required, your privacy is fully protected",
  },
];

export default function Features() {
  return (
    <section id="features" className="max-w-[1100px] mx-auto px-6 py-20">
      <div className="text-center mb-14">
        <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">
          Premium <span className="insta-gradient-text">Features</span>
        </h2>
        <p className="text-[rgba(255,255,255,0.65)] text-[17px]">
          Everything you need to save Instagram content
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
        {features.map((f) => (
          <div
            key={f.title}
            className="p-8 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-[16px] transition-all duration-300 hover:-translate-y-[3px] hover:border-[#e1306c] hover:shadow-[0_12px_40px_rgba(225,48,108,0.12)]"
          >
            <div className="w-12 h-12 rounded-[10px] insta-gradient flex items-center justify-center text-white text-lg mb-[18px] shadow-[0_6px_20px_rgba(225,48,108,0.3)]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {f.icon}
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
            <p className="text-[rgba(255,255,255,0.65)] text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
