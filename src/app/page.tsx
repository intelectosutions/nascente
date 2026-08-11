import { FarmGrid } from "@/components/farm-grid";
import { PushEnable } from "@/components/push-enable";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="flex flex-col gap-5">
      <PushEnable />
      <FarmGrid basePath="/f" />
    </div>
  );
}
