"use client";

import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function OfflinePage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <Card className="max-w-sm w-full">
        <CardContent className="py-12">
          <WifiOff className="h-16 w-16 mx-auto text-muted-foreground/50 mb-6" />
          <h1 className="text-2xl font-bold mb-2">You&apos;re Offline</h1>
          <p className="text-muted-foreground mb-6">
            Some features may be unavailable until your connection is restored.
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
