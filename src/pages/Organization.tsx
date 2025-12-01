import { Building, Users, Truck, UserCog, Shield, Phone } from "lucide-react";
import AdminNavigation from "@/components/admin/AdminNavigation";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const Organization = () => {
  const orgStructure = {
    leadership: [
      { name: "The Chairman", role: "Project Director", phone: "+389 XX XXX XXX", icon: Shield },
      { name: "Operations Lead", role: "Operations Manager", phone: "+389 XX XXX XXX", icon: UserCog }
    ],
    departments: [
      {
        name: "Fleet Management",
        head: "Fleet Coordinator",
        members: 12,
        icon: Truck,
        teams: ["Truck Drivers", "Maintenance Crew", "Route Planners"]
      },
      {
        name: "Zone Operations",
        head: "Zone Supervisor",
        members: 8,
        icon: Users,
        teams: ["Zone Coordinators", "Field Officers", "Data Analysts"]
      },
      {
        name: "Public Relations",
        head: "Communications Director",
        members: 5,
        icon: Building,
        teams: ["Campaign Managers", "Community Liaisons", "Media Relations"]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display text-primary text-glow-primary mb-2">
            Organization Structure
          </h1>
          <p className="text-muted-foreground font-mono">
            Project Phoenix - Struga Municipality
          </p>
        </div>

        {/* Leadership */}
        <div className="mb-8">
          <h2 className="text-xl font-display mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Leadership
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orgStructure.leadership.map((leader) => {
              const Icon = leader.icon;
              return (
                <Card key={leader.name} className="glass border-2 border-primary/50 p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary">
                      <AvatarFallback className="bg-primary/20 text-primary text-xl">
                        {leader.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-display text-lg mb-1">{leader.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{leader.role}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span className="font-mono">{leader.phone}</span>
                      </div>
                    </div>
                    <Icon className="w-8 h-8 text-primary/50" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Departments */}
        <div>
          <h2 className="text-xl font-display mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            Departments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {orgStructure.departments.map((dept) => {
              const Icon = dept.icon;
              return (
                <Card key={dept.name} className="glass border-2 border-border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-primary/20">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg">{dept.name}</h3>
                      <p className="text-xs text-muted-foreground">{dept.head}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Badge variant="outline" className="font-mono">
                      {dept.members} Members
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Teams:</p>
                    <div className="space-y-1">
                      {dept.teams.map((team) => (
                        <div key={team} className="text-sm pl-3 border-l-2 border-primary/30">
                          {team}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass border-2 border-border p-4 text-center">
            <p className="text-2xl font-display text-primary mb-1">25</p>
            <p className="text-xs text-muted-foreground">Total Staff</p>
          </Card>
          <Card className="glass border-2 border-border p-4 text-center">
            <p className="text-2xl font-display text-primary mb-1">3</p>
            <p className="text-xs text-muted-foreground">Departments</p>
          </Card>
          <Card className="glass border-2 border-border p-4 text-center">
            <p className="text-2xl font-display text-primary mb-1">12</p>
            <p className="text-xs text-muted-foreground">Active Trucks</p>
          </Card>
          <Card className="glass border-2 border-border p-4 text-center">
            <p className="text-2xl font-display text-primary mb-1">4</p>
            <p className="text-xs text-muted-foreground">Service Zones</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Organization;
