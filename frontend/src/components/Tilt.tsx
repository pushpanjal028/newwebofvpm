import React, { useRef, useState } from 'react';

interface TiltProps {
  children: React.ReactNode;
  className?: string;
  maxRotation?: number; // Maximum tilt rotation in degrees
  perspective?: number; // Perspective value in pixels
  scale?: number; // Scale on hover
}

export default function Tilt({
  children,
  className = '',
  maxRotation = 10,
  perspective = 1000,
  scale = 1.02,
}: TiltProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>('perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x coordinate within the element
    const y = e.clientY - rect.top;  // y coordinate within the element

    const width = rect.width;
    const height = rect.height;

    // Calculate rotation percentage (-0.5 to 0.5)
    const px = (x / width) - 0.5;
    const py = (y / height) - 0.5;

    // Calculate rotation degrees (Y rotation corresponds to mouse movement along X axis, and vice versa)
    const rotateX = -py * maxRotation;
    const rotateY = px * maxRotation;

    setTransformStyle(
      `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(${scale})`
    );
  };

  const handleMouseLeave = () => {
    // Smooth reset back to initial state
    setTransformStyle(`perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: 'transform 0.1s ease-out, box-shadow 0.1s ease-out',
        willChange: 'transform',
        transformStyle: 'preserve-3d',
      }}
      className={`transition-shadow duration-300 ${className}`}
    >
      <div style={{ transform: 'translateZ(10px)', transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </div>
  );
}
