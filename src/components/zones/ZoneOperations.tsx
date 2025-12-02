import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Megaphone, Calendar, Bell, FileText, Upload, 
  Plus, Download
} from "lucide-react";

interface ZoneOperationsProps {
  zoneId: string;
  zoneName: string;
}

export const ZoneOperations = ({ zoneId, zoneName }: ZoneOperationsProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display text-primary">Zone Operations</h2>
        <Badge variant="outline" className="font-mono">{zoneName}</Badge>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="campaigns">
            <Megaphone className="w-4 h-4 mr-2" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="w-4 h-4 mr-2" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="documents">
            <Upload className="w-4 h-4 mr-2" />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Card className="glass p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Campaign Management</h3>
              <Button className="bg-primary">
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Create and manage awareness campaigns, education programs, and incentive initiatives for this zone.
            </p>
            <div className="mt-4 space-y-2">
              <div className="p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">No campaigns yet. Create your first campaign to engage with households.</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card className="glass p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Collection Schedule</h3>
              <Button className="bg-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Schedule
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Define collection days, times, and truck assignments for different waste types.
            </p>
            <div className="mt-4 grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-3 rounded-lg border border-border text-center">
                  <p className="text-xs text-muted-foreground">{day}</p>
                  <p className="text-sm font-mono mt-1">-</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="glass p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Notifications & Alerts</h3>
              <Button className="bg-primary">
                <Plus className="w-4 h-4 mr-2" />
                New Notification
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Send warnings, reminders, and announcements to households via app, email, SMS, or printed posters.
            </p>
            <div className="mt-4 space-y-2">
              <div className="p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">No notifications sent yet. Create notifications to communicate with residents.</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card className="glass p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Zone Reports</h3>
              <Button className="bg-primary">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {["Weekly", "Monthly", "Quarterly", "Annual"].map((type) => (
                <Button key={type} variant="outline" className="h-20 flex flex-col">
                  <Download className="w-5 h-5 mb-2" />
                  <span className="text-sm">{type}</span>
                </Button>
              ))}
            </div>
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Recent Reports</h4>
              <div className="p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">No reports generated yet.</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card className="glass p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Document Storage</h3>
              <Button className="bg-primary">
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Store and manage maps, flyers, contracts, compliance documents, and other zone-related files.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["Maps", "Reports", "Flyers", "Contracts", "Compliance", "Other"].map((type) => (
                <div key={type} className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <FileText className="w-6 h-6 text-primary mb-2" />
                  <p className="text-sm font-medium">{type}</p>
                  <p className="text-xs text-muted-foreground">0 files</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};