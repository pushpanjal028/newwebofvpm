import React, { useEffect, useRef } from 'react';

export default function GlobeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width = 600;
    let height = canvas.height = 600;

    // Handle resizing or high DPI screens
    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = canvas.width = rect.width * window.devicePixelRatio;
      height = canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      width = rect.width;
      height = rect.height;
    };
    
    resize();
    window.addEventListener('resize', resize);

    // Globe parameters
    const globeRadius = Math.min(width, height) * 0.4;
    const perspective = 800;
    let rotationY = 0;
    let rotationX = 0.2; // slight tilt

    // Generate points on a sphere (Fibonacci lattice)
    const pointsCount = 180;
    const points: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < pointsCount; i++) {
      const theta = Math.acos(1 - 2 * (i + 0.5) / pointsCount);
      const phi = Math.sqrt(pointsCount * Math.PI) * theta;
      
      points.push({
        x: Math.sin(theta) * Math.cos(phi),
        y: Math.sin(theta) * Math.sin(phi),
        z: Math.cos(theta)
      });
    }

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Increment Y rotation (slow rotation)
      rotationY += 0.0035;

      // Project and collect points with depth info
      const projectedPoints = points.map((p) => {
        // Rotate Y
        let x1 = p.x * Math.cos(rotationY) - p.z * Math.sin(rotationY);
        let z1 = p.x * Math.sin(rotationY) + p.z * Math.cos(rotationY);
        
        // Rotate X (tilt)
        let y2 = p.y * Math.cos(rotationX) - z1 * Math.sin(rotationX);
        let z2 = p.y * Math.sin(rotationX) + z1 * Math.cos(rotationX);

        const scale = perspective / (perspective + z2 * globeRadius);
        const projX = centerX + x1 * globeRadius * scale;
        const projY = centerY + y2 * globeRadius * scale;

        return {
          x: projX,
          y: projY,
          depth: z2, // Z value for sorting and sizing
        };
      });

      // Sort points so back dots are drawn first
      projectedPoints.sort((a, b) => b.depth - a.depth);

      // Draw subtle latitude/longitude grid rings first (3D styled)
      ctx.lineWidth = 1;
      
      // Draw Latitude Rings
      const latRingsCount = 8;
      for (let r = 1; r < latRingsCount; r++) {
        const theta = (Math.PI / latRingsCount) * r;
        const ringRadius = Math.sin(theta) * globeRadius;
        const ringY = Math.cos(theta) * globeRadius;

        ctx.beginPath();
        // Generate points for the ring
        for (let a = 0; a <= 64; a++) {
          const angle = (Math.PI * 2 / 64) * a;
          const x = Math.cos(angle) * ringRadius;
          const z = Math.sin(angle) * ringRadius;

          // Rotate ring point around tilt axis
          let x1 = x * Math.cos(rotationY) - z * Math.sin(rotationY);
          let z1 = x * Math.sin(rotationY) + z * Math.cos(rotationY);
          let y2 = ringY * Math.cos(rotationX) - z1 * Math.sin(rotationX);
          let z2 = ringY * Math.sin(rotationX) + z1 * Math.cos(rotationX);

          const scale = perspective / (perspective + z2);
          const px = centerX + x1 * scale;
          const py = centerY + y2 * scale;

          // Fade rings that are on the back side
          const isBack = z2 > 0;
          ctx.strokeStyle = isBack
            ? 'rgba(99, 102, 241, 0.05)'
            : 'rgba(212, 175, 55, 0.15)';

          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Draw dots
      projectedPoints.forEach((p) => {
        const isBack = p.depth > 0;
        
        ctx.beginPath();
        // Back points are smaller and dimmer, front points are larger and brighter
        const size = isBack ? 1 : 2.5;
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        
        if (isBack) {
          ctx.fillStyle = 'rgba(99, 102, 241, 0.2)'; // Faded indigo
        } else {
          // Dynamic glow based on depth
          ctx.fillStyle = 'rgba(212, 175, 55, 0.8)'; // Bright Gold
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'rgba(212, 175, 55, 0.5)';
        }
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] md:w-[650px] md:h-[650px] opacity-25 dark:opacity-40 pointer-events-none z-0"
    />
  );
}
