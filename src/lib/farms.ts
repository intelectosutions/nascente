export type Farm = { slug: string; nome: string; codigo: string | null; municipio?: string };

// Fazendas conhecidas (config estática — não são dados semeados no banco).
// A property só é criada no banco quando há dado real (planilha ou saldo informado).
export const FARMS: Farm[] = [
  { slug: "fazenda-nascente", nome: "Nascente", codigo: "50985" },
  { slug: "sao-jose", nome: "São José", codigo: "354420204580001", municipio: "Riolândia/SP" },
  { slug: "santa-monica", nome: "Santa Monica II", codigo: "354420204640001" },
  { slug: "sao-carlos", nome: "São Carlos", codigo: "354420205480001", municipio: "Riolândia/SP" },
];

export function getFarm(slug: string): Farm | undefined {
  return FARMS.find((f) => f.slug === slug);
}

export const AGE_BANDS = [
  { key: "age0_2", label: "0 a 2 meses" },
  { key: "age3_8", label: "3 a 8 meses" },
  { key: "age9_12", label: "9 a 12 meses" },
  { key: "age13_24", label: "13 a 24 meses" },
  { key: "age25_36", label: "25 a 36 meses" },
  { key: "age37plus", label: "Acima de 36 meses" },
] as const;

export type AgeBandKey = (typeof AGE_BANDS)[number]["key"];
