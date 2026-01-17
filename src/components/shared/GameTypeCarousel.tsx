'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const gameTypeImages = [
  { src: '/images/game-types/venison.jpg', alt: 'Venison' },
  { src: '/images/game-types/elk.jpg', alt: 'Elk' },
  { src: '/images/game-types/wild-boar.jpg', alt: 'Wild Boar' },
  { src: '/images/game-types/duck.jpg', alt: 'Duck' },
  { src: '/images/game-types/turkey.jpg', alt: 'Wild Turkey' },
  { src: '/images/game-types/rabbit.jpg', alt: 'Rabbit' },
];

export function GameTypeCarousel() {
  const [mounted, setMounted] = useState(false);
  const [rotation, setRotation] = useState(0);

  const itemCount = gameTypeImages.length;
  const angleStep = (2 * Math.PI) / itemCount;
  const radius = 230;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setRotation((prev) => prev + 0.003);
    }, 16);

    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-xl bg-transparent" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden isolate">
      {gameTypeImages.map((image, index) => {
        const angle = rotation + index * angleStep;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        const scale = (z + radius) / (2 * radius) * 0.5 + 0.5;
        const zIndex = Math.round((z + radius) * 10);
        const opacity = scale * 0.25 + 0.75;

        return (
          <div
            key={image.src}
            className="absolute w-48 h-48 sm:w-56 sm:h-56 transition-opacity duration-150"
            style={{
              transform: `translateX(${x}px) scale(${scale})`,
              zIndex,
              opacity,
            }}
          >
            <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg border-2 border-white/30">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="150px"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
