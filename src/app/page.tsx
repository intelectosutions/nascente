import { FarmGrid } from "@/components/farm-grid";

export const dynamic = "force-dynamic";

export default function Home() {
  return <FarmGrid basePath="/f" title="Escolha a fazenda" />;
}
