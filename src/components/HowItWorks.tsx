import { Fragment } from "react";

const steps = [
  {
    number: "01",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    ),
    title: "Copy Link",
    desc: "Copy the Instagram post, reel, or profile URL",
  },
  {
    number: "02",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    ),
    title: "Paste Here",
    desc: "Paste the link or enter the username above",
  },
  {
    number: "03",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
    title: "Download",
    desc: "Preview and download in HD quality instantly",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="max-w-[1100px] mx-auto px-6 py-20">
      <div className="text-center mb-14">
        <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">
          How It <span className="insta-gradient-text">Works</span>
        </h2>
        <p className="text-[rgba(255,255,255,0.65)] text-[17px]">
          Three simple steps to download any Instagram media
        </p>
      </div>

      <div className="flex items-center justify-center gap-6 flex-wrap">
        {steps.map((step, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <div className="hidden md:block text-[#e1306c] shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-[200px] max-w-[280px] text-center p-9 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-2xl relative transition-all duration-300 hover:-translate-y-1 hover:border-[#e1306c] hover:shadow-[0_12px_40px_rgba(225,48,108,0.15)]">
              <span className="absolute top-3.5 right-[18px] text-[42px] font-extrabold text-[rgba(255,255,255,0.04)] leading-none select-none">
                {step.number}
              </span>
              <div className="w-[60px] h-[60px] mx-auto mb-[18px] rounded-[16px] insta-gradient flex items-center justify-center text-white text-[22px] shadow-[0_8px_30px_rgba(225,48,108,0.3)]">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {step.icon}
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-[rgba(255,255,255,0.65)] text-sm leading-relaxed">{step.desc}</p>
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
