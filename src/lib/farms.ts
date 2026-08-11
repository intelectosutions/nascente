export type Farm = { slug: string; nome: string; codigo: string | null; municipio?: string; restricaoAte?: string };

// Fazendas conhecidas (config estática — não são dados semeados no banco).
// A property só é criada no banco quando há dado real (planilha ou saldo informado).
// restricaoAte = data de término da noventena (GTA Chile/UE), formato ISO yyyy-mm-dd.
export const FARMS: Farm[] = [
  { slug: "fazenda-nascente", nome: "Nascente", codigo: "50985" },
  { slug: "sao-jose", nome: "São José", codigo: "354420204580001", municipio: "Riolândia/SP" },
  { slug: "santa-monica", nome: "Santa Monica II", codigo: "354420204640001", restricaoAte: "2026-10-12" },
  { slug: "sao-carlos", nome: "São Carlos", codigo: "354420205480001", municipio: "Riolândia/SP" },
];

export function getFarm(slug: string): Farm | undefined {
  return FARMS.find((f) => f.slug === slug);
}

// Restrição vigente enquanto hoje (Brasília) não passou do fim da noventena.
// Depois da data, a fazenda volta ao normal sozinha — sem precisar mexer no código.
export function restricaoInfo(farm: Farm): { ateBR: string } | null {
  if (!farm.restricaoAte) return null;
  const fim = new Date(farm.restricaoAte + "T23:59:59-03:00");
  if (Date.now() > fim.getTime()) return null;
  const [y, m, d] = farm.restricaoAte.split("-");
  return { ateBR: `${d}/${m}/${y}` };
}

// Faixas etárias oficiais (mesmas do sistema do produtor). key compõe as colunas m<key>/f<key>.
export const AGE_BANDS = [
  { key: "0_2", label: "0 a 2 meses" },
  { key: "3_8", label: "3 a 8 meses" },
  { key: "9_12", label: "9 a 12 meses" },
  { key: "13_24", label: "13 a 24 meses" },
  { key: "25_36", label: "25 a 36 meses" },
  { key: "37plus", label: "Acima de 36 meses" },
] as const;

export type AgeBandKey = (typeof AGE_BANDS)[number]["key"];
