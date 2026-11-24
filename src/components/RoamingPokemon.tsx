import { useEffect, useRef, useState } from 'react';
import { MiniPokemonSprite, PokemonSpecies } from './PokemonSprites';

interface CompanionState {
  id: string;
  name: string;
  species: PokemonSpecies;
  xPercent: number;
  direction: 1 | -1;
  speed: number;
  emote: string | null;
  hopping: boolean;
  pauseTicks: number;
}

const INITIAL_COMPANIONS: CompanionState[] = [
  {
    id: 'pika',
    name: 'Pikachu',
    species: 'pikachu',
    xPercent: 10,
    direction: 1,
    speed: 0.44,
    emote: null,
    hopping: false,
    pauseTicks: 0,
  },
  {
    id: 'char',
    name: 'Charmander',
    species: 'charmander',
    xPercent: 28,
    direction: -1,
    speed: 0.35,
    emote: null,
    hopping: false,
    pauseTicks: 0,
  },
  {
    id: 'squirt',
    name: 'Squirtle',
    species: 'squirtle',
    xPercent: 48,
    direction: 1,
    speed: 0.31,
    emote: null,
    hopping: false,
    pauseTicks: 0,
  },
  {
    id: 'bulb',
    name: 'Bulbasaur',
    species: 'bulbasaur',
    xPercent: 66,
    direction: -1,
    speed: 0.27,
    emote: null,
    hopping: false,
    pauseTicks: 0,
  },
  {
    id: 'eev',
    name: 'Eevee',
    species: 'eevee',
    xPercent: 82,
    direction: -1,
    speed: 0.4,
    emote: null,
    hopping: false,
    pauseTicks: 0,
  },
  {
    id: 'jiggly',
    name: 'Jigglypuff',
    species: 'jigglypuff',
    xPercent: 92,
    direction: -1,
    speed: 0.29,
    emote: null,
    hopping: false,
    pauseTicks: 0,
  },
];

const EMOTES_BY_SPECIES: Record<PokemonSpecies, string> = {
  pikachu: '⚡',
  charmander: '🔥',
  squirtle: '💧',
  bulbasaur: '🌿',
  eevee: '★',
  jigglypuff: '♪',
};

interface RoamingPokemonProps {
  celebrationTrigger?: number;
}

/**
 * Retro pixel-meadow strip where 2-frame pixelated Pokemon sprites trot back and forth,
 * pause with emotes, and hop when clicked or when a task is completed.
 */
export function RoamingPokemon({ celebrationTrigger = 0 }: RoamingPokemonProps) {
  const [companions, setCompanions] = useState<CompanionState[]>(INITIAL_COMPANIONS);
  const [walkFrame, setWalkFrame] = useState<0 | 1>(0);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mediaQuery.matches;
    const handleChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    let tickCount = 0;
    const interval = window.setInterval(() => {
      if (reducedMotionRef.current) return;

      tickCount++;
      if (tickCount % 3 === 0) {
        setWalkFrame((prev) => (prev === 0 ? 1 : 0));
      }

      setCompanions((prev) =>
        prev.map((poke) => {
          if (poke.pauseTicks > 0) {
            return {
              ...poke,
              pauseTicks: poke.pauseTicks - 1,
              emote: poke.pauseTicks === 1 ? null : poke.emote,
            };
          }

          let nextX = poke.xPercent + poke.direction * poke.speed;
          let nextDir = poke.direction;

          if (nextX >= 95) {
            nextX = 95;
            nextDir = -1;
          } else if (nextX <= 3) {
            nextX = 3;
            nextDir = 1;
          } else if (Math.random() < 0.008) {
            nextDir = poke.direction === 1 ? -1 : 1;
          }

          const shouldPause = Math.random() < 0.009;
          return {
            ...poke,
            xPercent: nextX,
            direction: nextDir,
            pauseTicks: shouldPause ? 28 : 0,
            emote: shouldPause ? EMOTES_BY_SPECIES[poke.species] : poke.emote,
          };
        })
      );
    }, 65);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (celebrationTrigger === 0) return;

    setCompanions((prev) =>
      prev.map((poke) => ({
        ...poke,
        hopping: true,
        emote: EMOTES_BY_SPECIES[poke.species],
      }))
    );

    const timer = window.setTimeout(() => {
      setCompanions((prev) =>
        prev.map((poke) => ({
          ...poke,
          hopping: false,
          emote: null,
        }))
      );
    }, 850);

    return () => window.clearTimeout(timer);
  }, [celebrationTrigger]);

  const handleCompanionTap = (id: string) => {
    setCompanions((prev) =>
      prev.map((poke) =>
        poke.id === id
          ? {
              ...poke,
              hopping: true,
              emote: EMOTES_BY_SPECIES[poke.species],
              pauseTicks: 18,
            }
          : poke
      )
    );

    window.setTimeout(() => {
      setCompanions((prev) =>
        prev.map((poke) =>
          poke.id === id
            ? {
                ...poke,
                hopping: false,
                emote: null,
              }
            : poke
        )
      );
    }, 650);
  };

  return (
    <div
      aria-label="Roaming pixelated Pokemon companions"
      className="relative h-14 w-full overflow-hidden rounded-xl border border-emerald-200/90 bg-gradient-to-b from-sky-50 via-emerald-50/50 to-emerald-100/80"
    >
      {/* Pixelated grass path ground */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3 border-t border-emerald-300/80 bg-emerald-200/75" />
      <svg
        viewBox="0 0 800 16"
        preserveAspectRatio="none"
        shapeRendering="crispEdges"
        className="pointer-events-none absolute inset-x-0 bottom-2.5 h-3 w-full text-emerald-500/40"
        aria-hidden="true"
      >
        <path
          d="M24 16 V10 H26 V16 M28 16 V8 H30 V16 M88 16 V10 H90 V16 M92 16 V12 H94 V16 M180 16 V8 H182 V16 M184 16 V11 H186 V16 M275 16 V9 H277 V16 M390 16 V8 H392 V16 M394 16 V11 H396 V16 M495 16 V10 H497 V16 M610 16 V8 H612 V16 M614 16 V11 H616 V16 M735 16 V9 H737 V16"
          fill="currentColor"
        />
      </svg>

      {companions.map((poke, index) => {
        const currentFrame: 0 | 1 =
          poke.pauseTicks > 0 ? 0 : ((walkFrame + (index % 2)) % 2 as 0 | 1);
        return (
          <button
            key={poke.id}
            type="button"
            onClick={() => handleCompanionTap(poke.id)}
            title={`${poke.name} (click to say hi!)`}
            aria-label={`${poke.name} running around`}
            style={{
              left: `${poke.xPercent}%`,
            }}
            className="absolute bottom-1 -translate-x-1/2 select-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 cursor-pointer"
          >
            {poke.emote && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] leading-none shadow-xs ring-1 ring-slate-200"
              >
                {poke.emote}
              </span>
            )}
            <div
              className={`transition-transform duration-150 ${
                poke.hopping
                  ? '-translate-y-3 scale-110'
                  : poke.pauseTicks === 0
                    ? 'animate-poke-scurry'
                    : ''
              }`}
            >
              <div style={{ transform: `scaleX(${poke.direction === 1 ? -1 : 1})` }}>
                <MiniPokemonSprite
                  species={poke.species}
                  frame={currentFrame}
                  className="h-10 w-10 drop-shadow-xs"
                />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
