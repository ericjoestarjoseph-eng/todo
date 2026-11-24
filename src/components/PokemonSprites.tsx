import { useMemo, useState } from 'react';

export type PokemonSpecies =
  | 'pikachu'
  | 'charmander'
  | 'squirtle'
  | 'bulbasaur'
  | 'eevee'
  | 'jigglypuff';

export type StickerType =
  | 'pokeball'
  | 'greatball'
  | 'ultraball'
  | 'pikachu-face'
  | 'thunderbolt'
  | 'oran-berry'
  | 'gym-badge'
  | 'charmander-face'
  | 'bulbasaur-face'
  | 'squirtle-face';

interface PixelArtProps {
  grid: string[];
  palette: Record<string, string>;
  className?: string;
}

/**
 * Renders an authentic crisp-edged pixel art matrix as merged horizontal SVG <rect> runs.
 */
function PixelArt({ grid, palette, className = 'w-10 h-10' }: PixelArtProps) {
  const height = grid.length;
  const width = grid[0]?.length ?? 16;

  const rects = useMemo(() => {
    const items: { x: number; y: number; w: number; fill: string }[] = [];
    for (let y = 0; y < height; y++) {
      const row = grid[y];
      let x = 0;
      while (x < row.length) {
        const ch = row[x];
        const fill = palette[ch];
        if (!fill) {
          x++;
          continue;
        }
        let span = 1;
        while (x + span < row.length && row[x + span] === ch) {
          span++;
        }
        items.push({ x, y, w: span, fill });
        x += span;
      }
    }
    return items;
  }, [grid, palette, height]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
    >
      {rects.map((r, idx) => (
        <rect key={idx} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
      ))}
    </svg>
  );
}

const SHARED_PALETTE: Record<string, string> = {
  K: '#18181B', // crisp pixel outline / pupil
  W: '#FFFFFF', // highlight
  Y: '#FACC15', // Pikachu yellow / gold
  S: '#EAB308', // yellow shade
  R: '#EF4444', // red cheeks / Pokeball top / fire
  O: '#F97316', // Charmander orange
  D: '#EA580C', // orange shade
  C: '#FEF3C7', // cream belly / ruff
  B: '#92400E', // brown stripe / shell / Eevee
  L: '#B45309', // lighter brown
  H: '#78350F', // dark brown
  Q: '#38BDF8', // Squirtle blue
  Z: '#0284C7', // blue shade / Charmander iris
  T: '#2DD4BF', // Bulbasaur teal
  M: '#0D9488', // Bulbasaur spot
  G: '#22C55E', // bulb green
  E: '#15803D', // bulb dark green
  P: '#F472B6', // Jigglypuff pink
  F: '#EC4899', // pink shade
  U: '#2563EB', // Great Ball / Oran Berry blue
  A: '#E2E8F0', // gray shadow
};

const POKEMON_FRAMES: Record<PokemonSpecies, [string[], string[]]> = {
  pikachu: [
    [
      '.KK.......KK......',
      'KYKK.....KKYK.....',
      'KYYK.....KYYK.....',
      '.KYYKKKKKYYK......',
      '.KYYYYYYYYYK......',
      'KYYWKYYYWKYYK..KK.',
      'KYYKKYKYKKYYK.KYYK',
      'KYRRYYYYYRRYK.KYYK',
      '.KYYYYYYYYYK.KYYK.',
      '..KYYYYYYYYK.KBYK.',
      '..KYYYBYYYYKKBBK..',
      '.KYYYYBYYYYYBBK...',
      '.KYSSYYYYYSSYK....',
      '..KYYYYYYYYYK.....',
      '..KYYSSSSSSYK.....',
      '..KYYK....KYYK....',
      '..KKK......KKK....',
      '..................',
    ],
    [
      '..................',
      '.KK.......KK......',
      'KYKK.....KKYK.....',
      'KYYKKKKKKYYK......',
      '.KYYYYYYYYYK......',
      'KYYWKYYYWKYYK.KK..',
      'KYYKKYKYKKYYKKYYK.',
      'KYRRYYYYYRRYKKYYK.',
      '.KYYYYYYYYYKKYYK..',
      '..KYYYYYYYYKKBYK..',
      '..KYYYBYYYYKBBK...',
      '.KYYYYBYYYYYBK....',
      '.KYSSYYYYYSSYK....',
      '..KYYYYYYYYYK.....',
      '..KYYSSSSSSYK.....',
      '...KYYK..KYYK.....',
      '...KKK....KKK.....',
      '..................',
    ],
  ],

  charmander: [
    [
      '....KKKK..........',
      '...KOOOOK.........',
      '..KOOOOOOK........',
      '..KOWKOOOK.....KK.',
      '..KOZKOOOK....KRK.',
      '.KOOOOOOOK...KRYRK',
      '.KOOOOOOOK...KRYRK',
      '..KOOOOOK....KRYK.',
      '...KCCOOOK....KOK.',
      '..KCCCOOOK....KOK.',
      '..KCCCOOOOK..KOOK.',
      '..KCCCOOOOOKKOOK..',
      '..KCCCOOOOOOOOK...',
      '...KCCDOOOOODK....',
      '...KDDK...KDDK....',
      '..KKKK.....KKKK...',
      '..................',
      '..................',
    ],
    [
      '..................',
      '....KKKK..........',
      '...KOOOOK.........',
      '..KOOOOOOK....KK..',
      '..KOWKOOOK...KRYK.',
      '..KOZKOOOK...KRYRK',
      '.KOOOOOOOK...KRYK.',
      '.KOOOOOOOK....KRK.',
      '..KOOOOOK.....KOK.',
      '...KCCOOOK....KOK.',
      '..KCCCOOOOK..KOOK.',
      '..KCCCOOOOOKKOOK..',
      '..KCCCOOOOOOOOK...',
      '...KCCDOOOOODK....',
      '....KDDK.KDDK.....',
      '...KKKK...KKKK....',
      '..................',
      '..................',
    ],
  ],

  squirtle: [
    [
      '...KKKKK..........',
      '..KQQQQQK.........',
      '.KQQQQQQQK........',
      '.KQQWKQQQK........',
      '.KQQRKQQQK........',
      '.KQQQQQQQK...KKK..',
      '..KQQQQQK...KQQQK.',
      '..KCCQQKBBK.KQQQZK',
      '.KCCCQQKBBLK.KZZQK',
      '.KCCCQQKBBBLKKQQK.',
      '.KCCCQQKBBBLKQQK..',
      '.KCCCQQKBBBLQQK...',
      '..KCCQQKBBBBK.....',
      '..KCCZZKBBBK......',
      '...KQQK..KQQK.....',
      '..KKKK....KKKK....',
      '..................',
      '..................',
    ],
    [
      '..................',
      '...KKKKK..........',
      '..KQQQQQK.........',
      '.KQQQQQQQK........',
      '.KQQWKQQQK........',
      '.KQQRKQQQK...KKK..',
      '.KQQQQQQQK..KQQQK.',
      '..KQQQQQK...KQQQZK',
      '..KCCQQKBBK..KZZQK',
      '.KCCCQQKBBLKKQQQK.',
      '.KCCCQQKBBBLKQQK..',
      '.KCCCQQKBBBLQQK...',
      '..KCCQQKBBBBK.....',
      '..KCCZZKBBBK......',
      '....KQQKKQQK......',
      '...KKKK..KKKK.....',
      '..................',
      '..................',
    ],
  ],

  bulbasaur: [
    [
      '.........KKKK.....',
      '........KGGGGK....',
      '.......KGGEEGGK...',
      '..KK..KKGGEEGGKK..',
      '.KTTKKTTKGGGGKGGK.',
      '.KTTTTTTKGGGGGGK..',
      'KTTWKTTWKTTTTTK...',
      'KTTRKTTRKTTMMTTK..',
      'KTTTTTTTKTTTMMTK..',
      'KTTTTTTTKTTTTTTK..',
      '.KTTTTTTKTTTTTTK..',
      '..KTTTTTTTTTTTTK..',
      '..KTTMMTTTTMMTTK..',
      '..KTTK.KTTKKTTK...',
      '..KKK..KKK..KKK...',
      '..................',
      '..................',
      '..................',
    ],
    [
      '..................',
      '.........KKKK.....',
      '........KGGGGK....',
      '..KK..KKGGEEGGK...',
      '.KTTKKTTKGGEEGGKK.',
      '.KTTTTTTKGGGGKGGK.',
      'KTTWKTTWKGGGGGGK..',
      'KTTRKTTRKTTTTTK...',
      'KTTTTTTTKTTMMTTK..',
      'KTTTTTTTKTTTMMTK..',
      '.KTTTTTTKTTTTTTK..',
      '..KTTTTTTTTTTTTK..',
      '..KTTMMTTTTMMTTK..',
      '...KTTKKTTK.KTTK..',
      '...KKK.KKK..KKK...',
      '..................',
      '..................',
      '..................',
    ],
  ],

  eevee: [
    [
      'K........K........',
      'KLK.....KLK.......',
      'KLDK...KLDK.......',
      'KLLK...KLLK.......',
      '.KLKKKKKLK.....KK.',
      '.KLLLLLLLK....KCCK',
      'KLWKLLLWKLK..KCCLK',
      'KLKKLLKKKLK..KCLLK',
      '.KLLLLLLLK..KLLLLK',
      '.KCCCLCCCK..KLLLK.',
      'KCCCCCCCCK.KLLLK..',
      '.KCCCCCCCKKLLLK...',
      '..KCLLLLLLLLLK....',
      '..KLLLLLLLLLK.....',
      '..KLLK...KLLK.....',
      '..KKK.....KKK.....',
      '..................',
      '..................',
    ],
    [
      '..................',
      'K........K........',
      'KLK.....KLK.......',
      'KLDK...KLDK.......',
      '.KLKKKKKLK....KK..',
      '.KLLLLLLLK...KCCK.',
      'KLWKLLLWKLK..KCCLK',
      'KLKKLLKKKLK..KCLLK',
      '.KLLLLLLLK..KLLLLK',
      '.KCCCLCCCK..KLLLK.',
      'KCCCCCCCCK.KLLLK..',
      '.KCCCCCCCKKLLLK...',
      '..KCLLLLLLLLLK....',
      '..KLLLLLLLLLK.....',
      '...KLLK.KLLK......',
      '...KKK...KKK......',
      '..................',
      '..................',
    ],
  ],

  jigglypuff: [
    [
      '..KK.......KK.....',
      '.KPPK..KKKKPPK....',
      '.KPPPKKPPPPPPK....',
      '.KPPPPPPPKPPPK....',
      'KPPPPPPPKKPPPPK...',
      'KPPWKPPPWKPPPPK...',
      'KPPZKPPPZKPPPPK...',
      'KPPPPPPPPPPPPPK...',
      'KPPPPKKKKPPPPPK...',
      'KPPPPPPPPPPPPPK...',
      '.KPPPPPPPPPPPK....',
      '.KPPFFPPPFFPPK....',
      '..KPPPPPPPPPK.....',
      '..KPPK...KPPK.....',
      '..KKK.....KKK.....',
      '..................',
      '..................',
      '..................',
    ],
    [
      '..................',
      '..KK.......KK.....',
      '.KPPK..KKKKPPK....',
      '.KPPPKKPPPPPPK....',
      '.KPPPPPPPKPPPK....',
      'KPPWKPPPWKPPPPK...',
      'KPPZKPPPZKPPPPK...',
      'KPPPPPPPPPPPPPK...',
      'KPPPPKKKKPPPPPK...',
      'KPPPPPPPPPPPPPK...',
      '.KPPPPPPPPPPPK....',
      '.KPPFFPPPFFPPK....',
      '..KPPPPPPPPPK.....',
      '...KPPK.KPPK......',
      '...KKK...KKK......',
      '..................',
      '..................',
      '..................',
    ],
  ],
};

interface MiniPokemonSpriteProps {
  species: PokemonSpecies;
  frame?: 0 | 1;
  className?: string;
}

/**
 * Authentic pixelated Pokemon sprites rendered with crispEdges & 2-frame walk cycle.
 */
export function MiniPokemonSprite({
  species,
  frame = 0,
  className = 'w-10 h-10',
}: MiniPokemonSpriteProps) {
  const frames = POKEMON_FRAMES[species];
  return <PixelArt grid={frames[frame]} palette={SHARED_PALETTE} className={className} />;
}

const STICKER_GRIDS: Record<StickerType, string[]> = {
  pokeball: [
    '....KKKKKK....',
    '..KKRRRRRRKK..',
    '.KRRRRRRRRRRK.',
    '.KRRRRRRRRRRK.',
    'KRRRRKKKKRRRRK',
    'KRRRRKWWKRRRRK',
    'KKKKKKWWKKKKKK',
    'KWWWWKAAKWWWWK',
    'KWWWWKKKKWWWWK',
    '.KWWWWWWWWWWK.',
    '.KAAWWWWWWAAK.',
    '..KKWWWWWWKK..',
    '....KKKKKK....',
  ],
  greatball: [
    '....KKKKKK....',
    '..KKUUUUUUKK..',
    '.KRRUUUUUURRK.',
    '.KUUURUUURUUUK'.slice(0, 14),
    'KUUUUUKKKKUUUK',
    'KUUUUKWWKUUUUK',
    'KKKKKKWWKKKKKK',
    'KWWWWKAAKWWWWK',
    'KWWWWKKKKWWWWK',
    '.KWWWWWWWWWWK.',
    '.KAAWWWWWWAAK.',
    '..KKWWWWWWKK..',
    '....KKKKKK....',
  ],
  ultraball: [
    '....KKKKKK....',
    '..KKKKKKKKKK..',
    '.KKYYKKKKYYKK.',
    '.KKYYKKKKYYKK.',
    'KKKYYKKKKYYKKK',
    'KKKKKKWWKKKKKK',
    'KKKKKKWWKKKKKK',
    'KWWWWKAAKWWWWK',
    'KWWWWKKKKWWWWK',
    '.KWWWWWWWWWWK.',
    '.KAAWWWWWWAAK.',
    '..KKWWWWWWKK..',
    '....KKKKKK....',
  ],
  'pikachu-face': [
    'KK..........KK',
    'KYK........KYK',
    'KYYKKKKKKKKYYK',
    '.KYYYYYYYYYYK.',
    '.KYYWKYYWKYYK.',
    '.KYYKKYYKKYYK.',
    'KRRYYYYYYYYRRK',
    'KRRYYKYYKYYRRK',
    '.KYYYYKKYYYYK.',
    '..KYYYYYYYYK..',
    '...KKKKKKKK...',
  ],
  thunderbolt: [
    '......KKKK....',
    '.....KYYYK....',
    '....KYYYK.....',
    '...KYYYK......',
    '..KYYYYKKKK...',
    '.KYYYYYYYYK...',
    '..KKKKYYYK....',
    '.....KYYK.....',
    '....KYYK......',
    '...KYYK.......',
    '..KYYK........',
    '..KKK.........',
  ],
  'oran-berry': [
    '...KK....KK...',
    '..KGGK..KGGK..',
    '...KKGGGGKK...',
    '..KKUUUUUUKK..',
    '.KUUWWUUUUUUK.',
    '.KUUWUUUUUUUK.',
    'KUUUUUUUUUUUUK',
    'KUUUUUUUUUUZUK',
    '.KUUUUUUUUZUK.',
    '..KKUUUUZZKK..',
    '....KKKKKK....',
  ],
  'gym-badge': [
    '......KK......',
    '.....KYYK.....',
    '....KYYYYK....',
    '.KKKKYYYYKKKK.',
    'KYYYYWYYYYYYYK',
    '.KYYYYYYYYYYK.',
    '..KYYSSSSYYK..',
    '..KYYKYYKYYK..',
    '.KYYK....KYYK.',
    '.KKK......KKK.',
  ],
  'charmander-face': [
    '...KKKKKK...',
    '..KOOOOOOK..',
    '.KOOOOOOOOk.'.replace('k', 'K'),
    'KOOWKOOOWKOK',
    'KOOZKOOOZKOK',
    'KOOOOOOOOOOK',
    'KOOKOOOOOKOK',
    '.KOOKKKKOOK.',
    '..KKKKKKKK..',
  ],
  'bulbasaur-face': [
    '.KK......KK.',
    'KTTKKKKKKTTK',
    'KTTTTTTTTTTK',
    'KTWKTTTTWKTK',
    'KTRKTTTTRKTK',
    'KTTTTTTTTTTK',
    '.KTTKKKKTTK.',
    '..KKKKKKKK..',
  ],
  'squirtle-face': [
    '...KKKKKK...',
    '..KQQQQQQK..',
    '.KQQQQQQQQK.',
    'KQQWKQQQWKQK',
    'KQQRKQQQRKQK',
    'KQQQQQQQQQQK',
    'KQQKQQQQKQQK',
    '.KQQKKKKQQK.',
    '..KKKKKKKK..',
  ],
};

interface StickerBadgeProps {
  type: StickerType;
  className?: string;
  rotate?: number;
  title?: string;
}

/**
 * Pixel-art die-cut vinyl sticker with crisp white border, subtle shadow, and peel bounce on click.
 */
export function StickerBadge({ type, className = '', rotate = 0, title }: StickerBadgeProps) {
  const [popped, setPopped] = useState(false);

  const handlePop = () => {
    setPopped(true);
    window.setTimeout(() => setPopped(false), 320);
  };

  return (
    <button
      type="button"
      onClick={handlePop}
      title={title}
      aria-label={title ? `${title} sticker` : 'Decorative Pokemon sticker'}
      style={{ transform: `rotate(${rotate}deg)` }}
      className={`group/sticker inline-flex select-none items-center justify-center rounded-xl bg-white p-1.5 shadow-[0_3px_10px_rgba(15,23,42,0.15),0_0_0_2px_rgba(255,255,255,0.98)] ring-1 ring-slate-200 transition-transform duration-200 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 cursor-pointer ${
        popped ? 'scale-125' : ''
      } ${className}`}
    >
      <PixelArt grid={STICKER_GRIDS[type]} palette={SHARED_PALETTE} className="h-7 w-7" />
    </button>
  );
}

const POKEBALL_CAUGHT_GRID = [
  '....KKKK....',
  '..KKRRRRKK..',
  '.KRRRRRRRRK.',
  'KRRRRKKRRRRK',
  'KRRRKWWKRRRK',
  'KKKKKWWKKKKK',
  'KWWWKAAKWWWK',
  'KWWWWKKWWWWK',
  '.KWWWWWWWWK.',
  '..KKWWWWKK..',
  '....KKKK....',
];

const POKEBALL_OPEN_GRID = [
  '....KKKK....',
  '..KKAAAAKK..',
  '.KAAWWWWAAK.',
  'KAAWWKKWWAAK',
  'KAAWKWWKWAAK',
  'KKKKKWWKKKKK',
  'KWWWKAAKWWWK',
  'KWWWWKKWWWWK',
  '.KWWWWWWWWK.',
  '..KKWWWWKK..',
  '....KKKK....',
];

export function PokeballIcon({
  caught,
  className = 'h-6 w-6',
}: {
  caught: boolean;
  className?: string;
}) {
  return (
    <PixelArt
      grid={caught ? POKEBALL_CAUGHT_GRID : POKEBALL_OPEN_GRID}
      palette={{
        ...SHARED_PALETTE,
        A: caught ? '#CBD5E1' : '#94A3B8',
      }}
      className={className}
    />
  );
}
