import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, CreditCard, Bell, Shield } from "lucide-react";
import NavbarWithScroll from "@/components/NavbarWithScroll";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
