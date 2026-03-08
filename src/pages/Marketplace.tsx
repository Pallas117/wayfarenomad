import { useState } from "react";
import { motion } from "framer-motion";
import { Store, Shield, Plus, Wifi, Smartphone, ExternalLink, RefreshCw } from "lucide-react";
import { SailboatIcon, FloatingTravelBadges, WavesDivider } from "@/components/animations/TravelIcons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserRank } from "@/hooks/useUserRank";
import { useExpeditions } from "@/hooks/useExpeditions";
import { useAuth } from "@/hooks/useAuth";
import { TravelLoaderInline } from "@/components/animations/TravelLoader";
import { ExpeditionCard } from "@/components/ExpeditionCard";
import { CreateExpeditionForm } from "@/components/CreateExpeditionForm";

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
  const { user } = useAuth();
  const { expeditions, loading, createExpedition, bookExpedition, cancelBooking, updateExpedition, refresh } = useExpeditions();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="p-6 max-w-lg mx-auto pb-24">
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <FloatingTravelBadges />
        <div className="flex items-center gap-3">
          <SailboatIcon className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-display font-bold">Marketplace</h1>
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={refresh} className="h-9 w-9">
            <RefreshCw className="h-4 w-4" />
          </Button>
          {isCaptain && (
            <Button size="sm" className="gradient-gold text-primary-foreground min-h-[44px]" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1" /> Host
            </Button>
          )}
        </div>
      </motion.div>

      {!isCaptain && (
        <motion.div
          className="glass-card rounded-xl p-4 mb-6 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Shield className="h-5 w-5 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground">
            Reach <strong className="text-foreground">Captain</strong> rank to host Expeditions.
          </p>
        </motion.div>
      )}

      {/* Expeditions */}
      <div className="mb-8">
        <h2 className="font-display font-bold text-lg mb-4">Expeditions</h2>
        {loading ? (
          <TravelLoaderInline message="Loading expeditions…" />
        ) : expeditions.length === 0 ? (
          <motion.div
            className="glass-card rounded-xl p-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-muted-foreground text-sm">No expeditions yet. Captains can host the first one!</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {expeditions.map((exp, i) => (
              <ExpeditionCard
                key={exp.id}
                expedition={exp}
                isHost={exp.host_id === user?.id}
                onBook={() => bookExpedition(exp.id)}
                onCancel={() => cancelBooking(exp.id)}
                onComplete={() => updateExpedition(exp.id, { status: "completed" })}
                index={i}
              />
            ))}
          </div>
        )}
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
          <motion.a
            key={provider.name}
            href={provider.url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card rounded-xl p-4 block hover:border-primary/50 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 150 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
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
                <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
              ))}
            </div>
          </motion.a>
        ))}
      </div>

      <CreateExpeditionForm
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={createExpedition}
      />
    </div>
  );
}

export default function Marketplace() {
  return <MarketplaceContent />;
}
