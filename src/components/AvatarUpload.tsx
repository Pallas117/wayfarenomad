import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { haptic } from "@/lib/haptics";

interface AvatarUploadProps {
  currentUrl: string | null;
  displayName: string;
  onUploaded: (url: string) => void;
}

export function AvatarUpload({ currentUrl, displayName, onUploaded }: AvatarUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = (displayName || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image.", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5 MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    haptic("tap");

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar.${ext}`;

    // Remove old avatar files first
    const { data: existingFiles } = await supabase.storage.from("avatars").list(user.id);
    if (existingFiles?.length) {
      await supabase.storage.from("avatars").remove(existingFiles.map((f) => `${user.id}/${f.name}`));
    }

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    // Save to profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("user_id", user.id);

    if (updateError) {
      toast({ title: "Profile update failed", description: updateError.message, variant: "destructive" });
    } else {
      onUploaded(publicUrl);
      haptic("success");
      toast({ title: "Avatar updated ✦" });
    }

    setUploading(false);
  };

  return (
    <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
        disabled={uploading}
      />

      <div className="h-24 w-24 rounded-full overflow-hidden glow-gold border-2 border-primary/30 transition-all group-hover:border-primary">
        {currentUrl ? (
          <img
            src={currentUrl}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full gradient-gold flex items-center justify-center text-primary-foreground font-display font-bold text-2xl">
            {initials}
          </div>
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 rounded-full flex items-center justify-center bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity">
        {uploading ? (
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        ) : (
          <Camera className="h-6 w-6 text-primary" />
        )}
      </div>
    </div>
  );
}
