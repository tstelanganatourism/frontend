'use client';

import React, { useState, useEffect } from 'react';

const IMAGES = [
  'https://res.cloudinary.com/r929tquv/image/upload/v1784836276/e62df8f4-a296-43b0-aa24-c63cb3a8f38f_n6bdp6.png', // Official HD TS Boat Tourism Banner
  'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779431943/papikondalu-tour-packages-ap-1_hje1jh.jpg', // Boat Tour Experience
  'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779431926/papikondalu-3_jg6thw.png', // Godavari Waters / Cruise
  'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779431922/papikondalu-sunset_bmvm1e.jpg', // Papikondalu Sunset
];

export default function HeroBackgroundSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % IMAGES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#07242c]">
      {IMAGES.map((img, i) => {
        const isActive = i === index;
        const isOfficialBanner = i === 0;
        return (
          <div
            key={img}
            className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out ${
              isOfficialBanner 
                ? 'bg-contain md:bg-cover bg-center bg-no-repeat' 
                : 'bg-cover bg-center bg-no-repeat'
            } ${
              isActive 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
            style={{ 
              backgroundImage: `url(${img})`,
              transitionProperty: 'opacity, transform'
            }}
          />
        );
      })}
    </div>
  );
}
