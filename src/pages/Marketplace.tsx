import { Store, Shield, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoleGate } from "@/components/RoleGate";
import { useUserRank } from "@/hooks/useUserRank";

function MarketplaceContent() {
  const { isCaptain } = useUserRank();

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Store className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-display font-bold">Marketplace</h1>
        </div>
        {isCaptain && (
          <Button size="sm" className="gradient-coral text-primary-foreground">
            <Plus className="h-4 w-4 mr-1" /> Host Expedition
          </Button>
        )}
      </div>

      {!isCaptain && (
        <div className="glass-card rounded-xl p-4 mb-6 flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground">
            Reach <strong className="text-foreground">Captain</strong> rank to host Expeditions. Lead 3 trips & earn 500+ Stardust.
          </p>
        </div>
      )}

      <div className="glass-card rounded-xl p-8 text-center">
        <p className="text-muted-foreground">Expeditions coming soon</p>
      </div>
    </div>
  );
}

export default function Marketplace() {
  return <MarketplaceContent />;
}
