import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";

const BillingCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="bg-white border border-border max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <XCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Payment cancelled</CardTitle>
          <CardDescription>
            No payment was completed. You can try again whenever you like.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            className="w-full"
            onClick={() => navigate("/pricing")}
          >
            Back to Pricing
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/")}
          >
            Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingCancel;
