import { motion } from "motion/react";

export function Particles() {
  // Fewer, dimmer stars — the dense glowing field was washing the scene lighter.
  const particles = Array.from({ length: 55 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.6 + 0.4,
    duration: Math.random() * 30 + 20,
    delay: Math.random() * 10,
    opacity: Math.random() * 0.22 + 0.05,
    isUltraviolet: Math.random() > 0.8
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            backgroundColor: particle.isUltraviolet ? '#7a52e0' : '#6f9de8',
            boxShadow: particle.isUltraviolet
              ? '0 0 8px rgba(122,82,224,0.35)'
              : '0 0 6px rgba(90,140,235,0.28)',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -100, -200],
            opacity: [0, particle.opacity, 0],
            scale: [0.8, 1.5, 0.8]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
}
