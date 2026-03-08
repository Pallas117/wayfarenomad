import { useState } from "react";
import { Camera, Loader2, MapPin, X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const CITIES = ["Kuala Lumpur", "Singapore", "Krabi"];

interface CommunityPhoto {
  id: string;
  image_url: string;
  caption: string | null;
  city: string;
  event_title: string | null;
  created_at: string;
  user_id: string;
}

export function CommunityPhotoBoard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [city, setCity] = useState("Kuala Lumpur");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { data: photos = [] } = useQuery({
    queryKey: ["community-photos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_photos" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data as any[]) as CommunityPhoto[];
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB", variant: "destructive" });
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!user || !selectedFile) return;
    setUploading(true);

    const ext = selectedFile.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: storageError } = await supabase.storage
      .from("community-photos")
      .upload(path, selectedFile);

    if (storageError) {
      toast({ title: "Upload failed", description: storageError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("community-photos").getPublicUrl(path);

    const { error: dbError } = await supabase.from("community_photos" as any).insert({
      user_id: user.id,
      image_url: urlData.publicUrl,
      caption: caption.trim() || null,
      event_title: eventTitle.trim() || null,
      city,
    });

    if (dbError) {
      toast({ title: "Error saving photo", description: dbError.message, variant: "destructive" });
    } else {
      toast({ title: "Photo shared! 📸", description: "Thanks for showing the vibes." });
      setCaption("");
      setEventTitle("");
      setSelectedFile(null);
      setPreview(null);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["community-photos"] });
    }
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold text-sm">Community Moments</h3>
        </div>
        {user && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                <ImagePlus className="h-3.5 w-3.5" /> Share Photo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="font-display flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Share a Moment
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                    <button onClick={() => { setSelectedFile(null); setPreview(null); }} className="absolute top-2 right-2 bg-background/80 rounded-full p-1">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                    <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">Tap to select photo</span>
                    <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  </label>
                )}
                <Input placeholder="Caption..." value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={200} />
                <Input placeholder="Event name (optional)" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} maxLength={200} />
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button className="w-full gradient-gold" onClick={handleUpload} disabled={!selectedFile || uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Share Photo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="glass-card rounded-xl p-6 text-center">
          <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
          <p className="text-sm text-muted-foreground">No community moments yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group rounded-xl overflow-hidden aspect-square">
              <img
                src={photo.image_url}
                alt={photo.caption || "Community moment"}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                {photo.event_title && (
                  <span className="text-[10px] font-display font-semibold text-primary truncate">{photo.event_title}</span>
                )}
                {photo.caption && (
                  <span className="text-[10px] text-foreground truncate">{photo.caption}</span>
                )}
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <MapPin className="h-2.5 w-2.5" />{photo.city}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
