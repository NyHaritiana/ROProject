import React, { useState, useRef, useEffect } from "react";

function Navbar() {
  const [active, setActive] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const buttonsRef = useRef([]);

  const links = ["Ordonnancement", "Dates au plus tot", "Dates au plus tard", "Chemin critique"];

  const updateIndicator = () => {
    if (buttonsRef.current[active]) {
      const button = buttonsRef.current[active];
      setIndicatorStyle({
        width: button.offsetWidth,
        left: button.offsetLeft,
      });
    }
  };

  useEffect(() => {
    updateIndicator();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div className="w-full flex justify-center mt-6">
      <div className="relative flex bg-gray-100 rounded-full p-1">
        {/* Background animé */}
        <span
            className="absolute top-1 h-[calc(100%-8px)] bg-blue-500 rounded-full transition-all duration-300"
            style={{
                width: indicatorStyle.width,
                left: indicatorStyle.left,
            }}
        ></span>

        {/* Liens */}
        {links.map((link, index) => (
          <button
            key={index}
            ref={(el) => (buttonsRef.current[index] = el)}
            onClick={() => setActive(index)}
            className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300 whitespace-nowrap ${
              active === index ? "text-white" : "text-gray-600"
            }`}
          >
            {link}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Navbar;