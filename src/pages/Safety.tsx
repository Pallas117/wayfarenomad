import { useState } from "react";
import {
  AlertTriangle,
  MapPin,
  Phone,
  Shield,
  Plus,
  CheckCircle,
  Siren,
  Building2,
  Heart,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RoleGate } from "@/components/RoleGate";
import { useAuth } from "@/hooks/useAuth";
import { useUserRank } from "@/hooks/useUserRank";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const safeSpaceCategories = [
  { id: "all", label: "All", icon: Shield },
  { id: "embassy", label: "Embassy", icon: Building2 },
  { id: "medical", label: "Medical", icon: Stethoscope },
  { id: "shelter", label: "Shelter", icon: Heart },
  { id: "general", label: "General", icon: MapPin },
];

const categoryIcons: Record<string, React.ElementType> = {
  embassy: Building2,
  medical: Stethoscope,
  shelter: Heart,
  general: MapPin,
};

function SafetyContent() {
  const { user } = useAuth();
  const { isSteward } = useUserRank();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("beacon");
  const [spaceCategory, setSpaceCategory] = useState("all");
  const [sosMessage, setSosMessage] = useState("");
  const [showSosConfirm, setShowSosConfirm] = useState(false);
  const [showAddSpace, setShowAddSpace] = useState(false);
  const [newSpace, setNewSpace] = useState({
    name: "",
    description: "",
    category: "general",
    city: "",
    address: "",
    phone: "",
  });

  // Fetch active emergency beacons
  const { data: activeBeacons = [] } = useQuery({
    queryKey: ["emergency-beacons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emergency_beacons")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch safe spaces
  const { data: safeSpaces = [] } = useQuery({
    queryKey: ["safe-spaces", spaceCategory],
    queryFn: async () => {
      let query = supabase
        .from("safe_spaces")
        .select("*")
        .order("verified", { ascending: false });
      if (spaceCategory !== "all") {
        query = query.eq("category", spaceCategory);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Activate SOS beacon
  const sosMutation = useMutation({
    mutationFn: async () => {
      // Use a default location (in production, use Geolocation API)
      const { error } = await supabase.from("emergency_beacons").insert({
        user_id: user!.id,
        lat: 38.7223,
        lng: -9.1393,
        message: sosMessage || "Emergency - need help",
        status: "active",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "🚨 Emergency Beacon Activated",
        description: "Nearby Stewards have been alerted. Stay safe.",
      });
      setSosMessage("");
      setShowSosConfirm(false);
      queryClient.invalidateQueries({ queryKey: ["emergency-beacons"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to activate beacon. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Resolve own beacon
  const resolveMutation = useMutation({
    mutationFn: async (beaconId: string) => {
      const { error } = await supabase
        .from("emergency_beacons")
        .update({ status: "resolved", resolved_at: new Date().toISOString() })
        .eq("id", beaconId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Beacon resolved", description: "Glad you're safe!" });
      queryClient.invalidateQueries({ queryKey: ["emergency-beacons"] });
    },
  });

  // Add safe space
  const addSpaceMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("safe_spaces").insert({
        ...newSpace,
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Safe space added", description: "Thank you for contributing!" });
      setShowAddSpace(false);
      setNewSpace({ name: "", description: "", category: "general", city: "", address: "", phone: "" });
      queryClient.invalidateQueries({ queryKey: ["safe-spaces"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add safe space.", variant: "destructive" });
    },
  });

  const myActiveBeacon = activeBeacons.find((b) => b.user_id === user?.id);

  return (
    <div className="p-6 max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-display font-bold">Safety Hub</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full bg-secondary/50">
          <TabsTrigger value="beacon" className="flex-1 text-xs">
            <Siren className="h-3.5 w-3.5 mr-1" /> Emergency
          </TabsTrigger>
          <TabsTrigger value="spaces" className="flex-1 text-xs">
            <MapPin className="h-3.5 w-3.5 mr-1" /> Safe Spaces
          </TabsTrigger>
        </TabsList>

        {/* Emergency Beacon Tab */}
        <TabsContent value="beacon" className="space-y-4 mt-4">
          {/* SOS Button */}
          <div className="glass-card rounded-xl p-6 text-center space-y-4">
            <div className="mx-auto h-20 w-20 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-destructive animate-pulse" />
            </div>
            <h2 className="font-display text-lg font-bold">Emergency Beacon</h2>
            <p className="text-sm text-muted-foreground">
              Activate to alert nearby verified Stewards of your location and situation.
            </p>

            {myActiveBeacon ? (
              <div className="space-y-3">
                <Badge variant="destructive" className="text-sm px-4 py-1">
                  🚨 Beacon Active
                </Badge>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => resolveMutation.mutate(myActiveBeacon.id)}
                  disabled={resolveMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" /> I'm Safe — Resolve Beacon
                </Button>
              </div>
            ) : (
              <Dialog open={showSosConfirm} onOpenChange={setShowSosConfirm}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 text-base font-bold"
                  >
                    <Siren className="h-5 w-5 mr-2" /> Activate SOS Beacon
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="font-display text-destructive">
                      Confirm Emergency Beacon
                    </DialogTitle>
                    <DialogDescription>
                      This will broadcast your approximate location to all nearby Stewards. Only use in genuine emergencies.
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    placeholder="Describe your situation (optional)..."
                    value={sosMessage}
                    onChange={(e) => setSosMessage(e.target.value)}
                    className="bg-secondary/50 border-border"
                  />
                  <Button
                    className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => sosMutation.mutate()}
                    disabled={sosMutation.isPending}
                  >
                    {sosMutation.isPending ? "Activating..." : "Confirm — Send SOS"}
                  </Button>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Active Beacons Nearby */}
          {activeBeacons.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Active Beacons Nearby
              </h3>
              {activeBeacons.map((beacon) => (
                <div
                  key={beacon.id}
                  className="glass-card rounded-xl p-4 border-l-4 border-destructive"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Siren className="h-4 w-4 text-destructive" />
                        <span className="text-sm font-semibold">SOS Alert</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {beacon.message || "Emergency — assistance needed"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(beacon.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    {beacon.user_id === user?.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveMutation.mutate(beacon.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Safe Spaces Tab */}
        <TabsContent value="spaces" className="space-y-4 mt-4">
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {safeSpaceCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSpaceCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                  spaceCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                )}
              >
                <cat.icon className="h-3 w-3" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Add Safe Space Button */}
          {isSteward && (
            <Dialog open={showAddSpace} onOpenChange={setShowAddSpace}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Add Safe Space
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="font-display">Add Safe Space</DialogTitle>
                  <DialogDescription>
                    Help the community by adding verified safe locations.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <Input
                    placeholder="Name (e.g. US Embassy Lisbon)"
                    value={newSpace.name}
                    onChange={(e) => setNewSpace((p) => ({ ...p, name: e.target.value }))}
                    className="bg-secondary/50 border-border"
                  />
                  <select
                    className="w-full rounded-md bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground"
                    value={newSpace.category}
                    onChange={(e) => setNewSpace((p) => ({ ...p, category: e.target.value }))}
                  >
                    <option value="general">General</option>
                    <option value="embassy">Embassy</option>
                    <option value="medical">Medical</option>
                    <option value="shelter">Shelter</option>
                  </select>
                  <Input
                    placeholder="City"
                    value={newSpace.city}
                    onChange={(e) => setNewSpace((p) => ({ ...p, city: e.target.value }))}
                    className="bg-secondary/50 border-border"
                  />
                  <Input
                    placeholder="Address"
                    value={newSpace.address}
                    onChange={(e) => setNewSpace((p) => ({ ...p, address: e.target.value }))}
                    className="bg-secondary/50 border-border"
                  />
                  <Input
                    placeholder="Phone number"
                    value={newSpace.phone}
                    onChange={(e) => setNewSpace((p) => ({ ...p, phone: e.target.value }))}
                    className="bg-secondary/50 border-border"
                  />
                  <Textarea
                    placeholder="Description..."
                    value={newSpace.description}
                    onChange={(e) => setNewSpace((p) => ({ ...p, description: e.target.value }))}
                    className="bg-secondary/50 border-border"
                  />
                  <Button
                    className="w-full gradient-gold text-primary-foreground min-h-[44px]"
                    onClick={() => addSpaceMutation.mutate()}
                    disabled={!newSpace.name || !newSpace.city || addSpaceMutation.isPending}
                  >
                    {addSpaceMutation.isPending ? "Adding..." : "Add Safe Space"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Safe Spaces List */}
          <div className="space-y-3">
            {safeSpaces.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center">
                <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No safe spaces listed yet.</p>
                {isSteward && (
                  <p className="text-xs text-muted-foreground mt-1">Be the first to add one!</p>
                )}
              </div>
            ) : (
              safeSpaces.map((space, i) => {
                const CatIcon = categoryIcons[space.category] || MapPin;
                return (
                  <div
                    key={space.id}
                    className="glass-card rounded-xl p-4 animate-slide-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CatIcon className="h-4 w-4 text-primary" />
                        <Badge variant="secondary" className="text-xs capitalize">
                          {space.category}
                        </Badge>
                        {space.verified && (
                          <Badge className="text-xs bg-primary/20 text-primary border-primary/30">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <h3 className="font-display font-semibold mb-1">{space.name}</h3>
                    {space.description && (
                      <p className="text-sm text-muted-foreground mb-2">{space.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {space.city}
                        {space.address && ` — ${space.address}`}
                      </span>
                      {space.phone && (
                        <a
                          href={`tel:${space.phone}`}
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <Phone className="h-3 w-3" /> {space.phone}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Safety() {
  return (
    <RoleGate minRank={1}>
      <SafetyContent />
    </RoleGate>
  );
}
