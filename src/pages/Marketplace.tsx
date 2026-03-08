import { Store, Shield, Plus, Wifi, Smartphone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleGate } from "@/components/RoleGate";
import { useUserRank } from "@/hooks/useUserRank";

const esimProviders = [
  {
    name: "Airalo",
    description: "eSIMs for 200+ countries. Pay-as-you-go data plans starting at $4.50.",
    url: "https://www.airalo.com",
    regions: ["Global", "Europe", "Asia"],
  },
  {
    name: "Holafly",
    description: "Unlimited data eSIMs for travelers. Simple activation, no contracts.",
    url: "https://www.holafly.com",
    regions: ["Europe", "Americas", "Asia"],
  },
  {
    name: "Nomad eSIM",
    description: "Affordable local & regional data plans designed for digital nomads.",
    url: "https://www.getnomad.app",
    regions: ["Global", "Regional"],
  },
];

function MarketplaceContent() {
  const { isCaptain } = useUserRank();

  return (
    <div className="p-6 max-w-lg mx-auto pb-24">
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

      {/* Expeditions placeholder */}
      <div className="glass-card rounded-xl p-8 text-center mb-8">
        <p className="text-muted-foreground">Expeditions coming soon</p>
      </div>

      {/* eSIM Marketplace */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-primary" />
          <h2 className="font-display font-bold text-lg">Stay Connected</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Get an eSIM before you travel. Instant activation, no physical SIM needed.
        </p>

        {esimProviders.map((provider, i) => (
          <a
            key={provider.name}
            href={provider.url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card rounded-xl p-4 block hover:border-primary/50 transition-colors animate-slide-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-primary" />
                <h3 className="font-display font-semibold">{provider.name}</h3>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">{provider.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {provider.regions.map((r) => (
                <Badge key={r} variant="secondary" className="text-xs">
                  {r}
                </Badge>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function Marketplace() {
  return <MarketplaceContent />;
}
