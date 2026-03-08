import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Instagram, Send, Phone, BookOpen, CheckCircle, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const socialFields = [
  { key: "instagram_handle", label: "Instagram", icon: Instagram, placeholder: "@username" },
  { key: "telegram_handle", label: "Telegram", icon: Send, placeholder: "@username" },
  { key: "whatsapp_number", label: "WhatsApp", icon: Phone, placeholder: "+1234567890" },
  { key: "substack_url", label: "Substack", icon: BookOpen, placeholder: "yourname.substack.com" },
] as const;

type SocialKey = typeof socialFields[number]["key"];

export function SocialProfileLinks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [values, setValues] = useState<Record<SocialKey, string>>({
    instagram_handle: "",
    telegram_handle: "",
    whatsapp_number: "",
    substack_url: "",
  });
  const [verified, setVerified] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("profiles")
      .select("instagram_handle, telegram_handle, whatsapp_number, substack_url, social_verified")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setValues({
            instagram_handle: (data as any).instagram_handle || "",
            telegram_handle: (data as any).telegram_handle || "",
            whatsapp_number: (data as any).whatsapp_number || "",
            substack_url: (data as any).substack_url || "",
          });
          setVerified((data as any).social_verified || false);
        }
      });
  }, [user?.id]);

  const filledCount = Object.values(values).filter(v => v.trim().length > 0).length;
  const isVerifiable = filledCount >= 2;

  const validate = (): string | null => {
    const v = values;
    if (v.instagram_handle && !v.instagram_handle.startsWith("@")) return "Instagram handle must start with @";
    if (v.telegram_handle && !v.telegram_handle.startsWith("@")) return "Telegram handle must start with @";
    if (v.whatsapp_number && !/^\+\d{7,15}$/.test(v.whatsapp_number)) return "WhatsApp must be + followed by digits";
    if (v.substack_url && !v.substack_url.includes(".substack.com")) return "Substack URL must contain .substack.com";
    return null;
  };

  const handleSave = async () => {
    if (!user?.id) return;
    const err = validate();
    if (err) {
      toast({ title: "Validation Error", description: err, variant: "destructive" });
      return;
    }
    setSaving(true);
    const shouldVerify = isVerifiable && !verified;
    const { error } = await supabase
      .from("profiles")
      .update({
        ...values,
        ...(shouldVerify ? { social_verified: true } : {}),
      } as any)
      .eq("user_id", user.id);

    if (!error) {
      if (shouldVerify) setVerified(true);
      toast({ title: "Profile Updated", description: shouldVerify ? "Social verification achieved! ✨" : "Social links saved." });
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <motion.div
      className="glass-card rounded-xl p-5 space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-lg">Social Verification</h2>
        {verified && (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <CheckCircle className="h-3 w-3 mr-1" /> Verified
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Link 2+ social profiles to earn verification status and boost your trust score.
      </p>

      <div className="space-y-3">
        {socialFields.map((field) => {
          const Icon = field.icon;
          return (
            <div key={field.key} className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-primary shrink-0" />
              <Input
                value={values[field.key]}
                onChange={(e) => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="flex-1 bg-secondary/50 border-border text-sm"
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {filledCount}/4 linked {isVerifiable && !verified && "• Ready for verification"}
        </span>
        <Button onClick={handleSave} disabled={saving} size="sm" className="gradient-gold text-primary-foreground">
          <Save className="h-3 w-3 mr-1" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </motion.div>
  );
}
