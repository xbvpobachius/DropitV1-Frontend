import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { apiFetch } from "@/lib/api";

const BillingSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { checkSubscription } = useSubscription();
  const [activating, setActivating] = useState(true);
  const [goingToDashboard, setGoingToDashboard] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const tids: ReturnType<typeof setTimeout>[] = [];

    const run = async () => {
      if (sessionId) {
        try {
          await apiFetch("/billing/confirm-session?session_id=" + encodeURIComponent(sessionId), {
            method: "POST",
          });
        } catch {
          // ignore (e.g. already confirmed by webhook)
        }
      }
      if (!cancelled) await checkSubscription();
      if (!cancelled) setActivating(false);
      tids.push(setTimeout(() => { if (!cancelled) checkSubscription(); }, 1500));
      tids.push(setTimeout(() => { if (!cancelled) checkSubscription(); }, 4000));
    };
    run();

    return () => {
      cancelled = true;
      tids.forEach((id) => clearTimeout(id));
    };
  }, [sessionId, checkSubscription]);

  const handleGoToDashboard = async () => {
    setGoingToDashboard(true);
    await checkSubscription();
    setGoingToDashboard(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="bg-white border border-border max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Payment successful</CardTitle>
          <CardDescription>
            {activating
              ? "Activating your subscription..."
              : "Your subscription is now active. You can access the dashboard and start publishing."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {activating ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <Button
                className="w-full"
                onClick={handleGoToDashboard}
                disabled={goingToDashboard}
              >
                {goingToDashboard ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Go to dashboard"
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/pricing")}
              >
                Back to Pricing
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingSuccess;
