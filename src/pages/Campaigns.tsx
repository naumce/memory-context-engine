import { useState } from "react";
import { Plus, Megaphone, Calendar, DollarSign, Users, TrendingUp } from "lucide-react";
import AdminNavigation from "@/components/admin/AdminNavigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const Campaigns = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [campaigns] = useState([
    {
      id: "1",
      name: "Clean Struga Initiative",
      type: "awareness",
      budget: 50000,
      spent: 23400,
      startDate: "2025-01-01",
      endDate: "2025-03-31",
      reach: 12500,
      engagement: 68,
      status: "active"
    },
    {
      id: "2",
      name: "Recycling Education Program",
      type: "education",
      budget: 30000,
      spent: 15200,
      startDate: "2025-01-15",
      endDate: "2025-06-30",
      reach: 8200,
      engagement: 74,
      status: "active"
    },
    {
      id: "3",
      name: "Community Cleanup Days",
      type: "community",
      budget: 20000,
      spent: 12800,
      startDate: "2025-02-01",
      endDate: "2025-12-31",
      reach: 15000,
      engagement: 82,
      status: "active"
    }
  ]);

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground";
  };

  const getCampaignIcon = (type: string) => {
    const icons: Record<string, any> = {
      awareness: Megaphone,
      education: Users,
      community: TrendingUp
    };
    return icons[type] || Megaphone;
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation />
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display text-primary text-glow-primary mb-2">
              Campaign Management
            </h1>
            <p className="text-muted-foreground font-mono">
              Public Awareness & Education Campaigns
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="glass max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Campaign Name</Label>
                  <Input placeholder="e.g., Summer Recycling Drive" />
                </div>
                <div>
                  <Label>Campaign Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="awareness">Public Awareness</SelectItem>
                      <SelectItem value="education">Education Program</SelectItem>
                      <SelectItem value="community">Community Engagement</SelectItem>
                      <SelectItem value="incentive">Incentive Program</SelectItem>
                      <SelectItem value="media">Media Campaign</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div>
                  <Label>Budget (MKD)</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div>
                  <Label>Campaign Description</Label>
                  <Textarea placeholder="Describe campaign goals and activities..." rows={4} />
                </div>
                <div>
                  <Label>Target Zones</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select zones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Zones</SelectItem>
                      <SelectItem value="zone-a">Zone A</SelectItem>
                      <SelectItem value="zone-b">Zone B</SelectItem>
                      <SelectItem value="zone-c">Zone C</SelectItem>
                      <SelectItem value="zone-d">Zone D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">
                  Launch Campaign
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Campaign Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass border-2 border-border p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Budget</span>
            </div>
            <p className="text-2xl font-display text-primary">100,000 MKD</p>
          </Card>
          <Card className="glass border-2 border-border p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Spent</span>
            </div>
            <p className="text-2xl font-display text-primary">51,400 MKD</p>
          </Card>
          <Card className="glass border-2 border-border p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Reach</span>
            </div>
            <p className="text-2xl font-display text-primary">35,700</p>
          </Card>
          <Card className="glass border-2 border-border p-6">
            <div className="flex items-center gap-3 mb-2">
              <Megaphone className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Active Campaigns</span>
            </div>
            <p className="text-2xl font-display text-primary">3</p>
          </Card>
        </div>

        {/* Campaign List */}
        <div className="space-y-6">
          {campaigns.map((campaign) => {
            const Icon = getCampaignIcon(campaign.type);
            const budgetUsed = (campaign.spent / campaign.budget) * 100;
            
            return (
              <Card key={campaign.id} className="glass border-2 border-border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/20">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg mb-1">{campaign.name}</h3>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {campaign.type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Duration</p>
                    <p className="text-sm font-mono">
                      {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Budget</p>
                    <p className="text-sm font-mono">
                      {campaign.spent.toLocaleString()} / {campaign.budget.toLocaleString()} MKD
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Reach</p>
                    <p className="text-sm font-mono">{campaign.reach.toLocaleString()} people</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Engagement</p>
                    <p className="text-sm font-mono">{campaign.engagement}%</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-muted-foreground">Budget Utilization</span>
                    <span className="font-mono">{budgetUsed.toFixed(1)}%</span>
                  </div>
                  <Progress value={budgetUsed} className="h-2" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Campaigns;
