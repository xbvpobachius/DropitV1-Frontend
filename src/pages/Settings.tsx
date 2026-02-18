import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, CreditCard, Bell, Shield, Clock } from "lucide-react";
import NavbarWithScroll from "@/components/NavbarWithScroll";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [publishingStatus, setPublishingStatus] = useState<{
    daily_video_limit: number;
    preferred_upload_hour_utc?: number | null;
  } | null>(null);
  const [savingHour, setSavingHour] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user || !localStorage.getItem("access_token")) return;
    apiFetch<{
      daily_video_limit: number;
      preferred_upload_hour_utc?: number | null;
    }>("/publishing/status")
      .then(setPublishingStatus)
      .catch(() => setPublishingStatus(null));
  }, [user]);

  const handleUploadHourChange = async (hourUtc: string) => {
    const value = hourUtc === "none" ? null : parseInt(hourUtc, 10);
    setSavingHour(true);
    try {
      const updated = await apiFetch<{ preferred_upload_hour_utc?: number | null }>("/publishing/settings", {
        method: "PATCH",
        body: JSON.stringify({ preferred_upload_hour_utc: value }),
      });
      setPublishingStatus((prev) =>
        prev ? { ...prev, preferred_upload_hour_utc: updated.preferred_upload_hour_utc ?? null } : null
      );
      toast({
        title: "Hora desada",
        description:
          value != null
            ? `Es publicarà ${publishingStatus?.daily_video_limit ?? 1} vídeo/dia a les ${String(value).padStart(2, "0")}:00 UTC.`
            : "Hora de pujada esborrada.",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "No s'ha pogut desar la hora",
        variant: "destructive",
      });
    } finally {
      setSavingHour(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavbarWithScroll />
      
      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Settings</h1>

          <div className="space-y-6">
            {/* Account Settings */}
            <Card className="card-premium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Account Information
                </CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    type="text"
                    placeholder="Enter your display name"
                    className="mt-1"
                  />
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Subscription */}
            <Card className="card-premium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Subscription
                </CardTitle>
                <CardDescription>Manage your subscription plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Current Plan</p>
                    <p className="text-sm text-muted-foreground">Free Trial</p>
                  </div>
                  <Button variant="secondary" onClick={() => navigate("/pricing")}>
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Programació de vídeos (hora de pujada diària) */}
            <Card className="card-premium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Programació de vídeos
                </CardTitle>
                <CardDescription>
                  Segons el teu pla es publica fins a {publishingStatus?.daily_video_limit ?? 1} vídeo/dia. Tria a quina hora (UTC) vols la pujada diària.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Label className="text-sm font-medium">Hora de pujada (UTC)</Label>
                  <Select
                    value={
                      publishingStatus?.preferred_upload_hour_utc != null
                        ? String(publishingStatus.preferred_upload_hour_utc)
                        : "none"
                    }
                    onValueChange={handleUploadHourChange}
                    disabled={savingHour}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Tria l'hora" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No configurada</SelectItem>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {String(i).padStart(2, "0")}:00 UTC
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {publishingStatus?.preferred_upload_hour_utc != null && (
                    <span className="text-sm text-muted-foreground">
                      {publishingStatus.daily_video_limit} vídeo(s)/dia a les{" "}
                      {String(publishingStatus.preferred_upload_hour_utc).padStart(2, "0")}:00 UTC
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="card-premium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notifications
                </CardTitle>
                <CardDescription>Configure your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <input type="checkbox" className="h-5 w-5 rounded border-border" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Product Updates</p>
                    <p className="text-sm text-muted-foreground">Get notified about new trending products</p>
                  </div>
                  <input type="checkbox" className="h-5 w-5 rounded border-border" />
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="card-premium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Security
                </CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="secondary">Change Password</Button>
                <Button variant="destructive">Delete Account</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
