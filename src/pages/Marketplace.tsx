import { Store } from "lucide-react";

export default function Marketplace() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Store className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-display font-bold">Marketplace</h1>
      </div>
      <div className="glass-card rounded-xl p-8 text-center">
        <p className="text-muted-foreground">Trips & Guides coming soon</p>
      </div>
    </div>
  );
}
