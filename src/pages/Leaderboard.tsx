import { Trophy, Star, MapPin } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const mockLeaders = [
  { rank: 1, name: "Elena V.", city: "Barcelona", points: 2840, avatar: "EV" },
  { rank: 2, name: "Tom K.", city: "Berlin", points: 2510, avatar: "TK" },
  { rank: 3, name: "Priya S.", city: "Lisbon", points: 2280, avatar: "PS" },
  { rank: 4, name: "Marco D.", city: "Rome", points: 1920, avatar: "MD" },
  { rank: 5, name: "Yuki T.", city: "Tokyo", points: 1750, avatar: "YT" },
];

export default function Leaderboard() {
  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-display font-bold">Stellar Canopy</h1>
      </div>

      <Tabs defaultValue="europe" className="mb-6">
        <TabsList className="w-full bg-secondary/50">
          <TabsTrigger value="uk" className="flex-1 text-xs">UK</TabsTrigger>
          <TabsTrigger value="europe" className="flex-1 text-xs">Europe</TabsTrigger>
          <TabsTrigger value="asia" className="flex-1 text-xs">Asia</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {mockLeaders.map((user, i) => (
          <div
            key={user.rank}
            className="glass-card rounded-xl p-4 flex items-center gap-4 animate-slide-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
              user.rank === 1 ? "gradient-coral text-primary-foreground" :
              user.rank <= 3 ? "bg-secondary text-foreground" :
              "bg-muted text-muted-foreground"
            }`}>
              {user.rank}
            </div>

            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-display font-semibold text-sm">
              {user.avatar}
            </div>

            <div className="flex-1">
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {user.city}
              </p>
            </div>

            <div className="flex items-center gap-1 text-primary">
              <Star className="h-4 w-4" />
              <span className="font-display font-bold text-sm">{user.points.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
