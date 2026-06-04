export type Farm = { slug: string; nome: string; codigo: string | null };

// Fazendas conhecidas (config estática — não são dados semeados no banco).
// A property só é criada no banco quando a 1ª planilha real daquela fazenda é importada.
export const FARMS: Farm[] = [
  { slug: "fazenda-nascente", nome: "Nascente", codigo: "50985" },
  { slug: "sao-jose", nome: "São José", codigo: null },
  { slug: "santa-monica", nome: "Santa Mônica", codigo: null },
  { slug: "sao-carlos", nome: "São Carlos", codigo: null },
];

export function getFarm(slug: string): Farm | undefined {
  return FARMS.find((f) => f.slug === slug);
}
