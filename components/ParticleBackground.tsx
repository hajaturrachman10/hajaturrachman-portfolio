"use client";



const particles = Array.from({ length: 28 }, (_, index) => ({
  id: index,
  size: 0.24 + (index % 6) * 0.09,
  left: 4 + ((index * 13) % 92),
  top: 8 + ((index * 19) % 80),
  delay: (index % 9) * 0.24,
  duration: 5.4 + (index % 7) * 0.55
}));

const orbs = [
  "left-[6%] top-[14%] h-72 w-72 bg-primary/16",
  "right-[7%] top-[18%] h-72 w-72 bg-secondary/14",
  "bottom-[7%] right-[14%] h-80 w-80 bg-accent/12",
  "bottom-[18%] left-[20%] h-56 w-56 bg-rose-500/8"
];

export function ParticleBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="grid-mask absolute inset-0" />

      {orbs.map((orb) => (
        <div
          key={orb}
          className={`absolute rounded-full blur-3xl pulsing-orb ${orb}`}
        />
      ))}

      <div
        className="absolute left-1/2 top-1/2 h-[38rem] w-[38rem] rounded-full border border-primary/10 rotating-circle-cw"
      />
      <div
        className="absolute left-1/2 top-1/2 h-[26rem] w-[26rem] rounded-full border border-accent/10 rotating-circle-ccw"
      />

      {particles.map((particle) => (
        <span
          key={particle.id}
          className="absolute rounded-full bg-primary/30 shadow-glow floating-particle"
          style={{
            width: `${particle.size}rem`,
            height: `${particle.size}rem`,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            // @ts-ignore
            "--duration": `${particle.duration}s`,
            "--delay": `${particle.delay}s`,
            "--px": `${particle.id % 2 === 0 ? 10 : -10}px`
          }}
        />
      ))}
    </div>
  );
}
