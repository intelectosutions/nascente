import { FarmGrid } from "@/components/farm-grid";

export const dynamic = "force-dynamic";

export default function PainelHome() {
  return <FarmGrid basePath="/painel" title="Enviar planilha" subtitle="Escolha a fazenda" />;
}
