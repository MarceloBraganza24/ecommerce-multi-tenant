"use client";

import { useEffect, useState } from "react";

type Props = {
  whatsapp: string;
};

export function FloatingButtons({ whatsapp }: Props) {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setShowTop(window.scrollY > 500);
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="floatingButtons">
      {showTop && (
        <button
          className="floatButton"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Volver arriba"
        >
          ↑
        </button>
      )}

      <a
        className="floatButton whatsappButton"
        href={`https://wa.me/${whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
      >
        W
      </a>
    </div>
  );
}