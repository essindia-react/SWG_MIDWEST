import React from "react";
export function MobilePhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex justify-center items-start min-h-screen overflow-y-auto p-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div
        className="rounded-3xl overflow-hidden flex flex-col"
        style={{
          width: "390px",
          minHeight: "780px",
          backgroundColor: "white",
          boxShadow: "0 25px 80px rgba(0,0,0,0.18), 0 0 0 12px #1B1B1B",
          flexShrink: 0,
        }}
      >
        <div
          className="flex items-center justify-between px-5 pt-3 pb-1"
          style={{ backgroundColor: "var(--brand-dark-green)" }}
        >
          <span className="text-white" style={{ fontSize: "12px", fontWeight: 600 }}>
            9:41
          </span>
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {[4, 3, 2, 1].map((h) => (
                <div
                  key={h}
                  className="w-1 bg-white rounded-sm"
                  style={{ height: `${h * 3}px`, opacity: h === 1 ? 0.4 : 1 }}
                />
              ))}
            </div>
            <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
              <rect x="0.5" y="0.5" width="16" height="9" rx="2" stroke="white" strokeOpacity="0.5" />
              <rect x="1.5" y="1.5" width="12" height="7" rx="1" fill="white" />
              <rect x="17" y="3" width="2" height="4" rx="1" fill="white" fillOpacity="0.5" />
            </svg>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
