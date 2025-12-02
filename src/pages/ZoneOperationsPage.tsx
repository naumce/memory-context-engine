import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AdminNavigation from "@/components/admin/AdminNavigation";
import { Button } from "@/components/ui/button";
import { useZones } from "@/hooks/useZones";
import { ZoneOperations } from "@/components/zones/ZoneOperations";

const ZoneOperationsPage = () => {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const { data: zones, isLoading } = useZones();
  
  const zone = zones?.find(z => z.id === zoneId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading zone...</p>
      </div>
    );
  }

  if (!zone) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Zone not found</p>
          <Button onClick={() => navigate("/admin/zones")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Zones
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation />
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate("/admin/zones")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-display text-primary text-glow-primary mb-2">
              {zone.name}
            </h1>
            <p className="text-muted-foreground font-mono">{zone.code}</p>
          </div>
        </div>

        <ZoneOperations zoneId={zone.id} zoneName={zone.name} />
      </div>
    </div>
  );
};

export default ZoneOperationsPage;