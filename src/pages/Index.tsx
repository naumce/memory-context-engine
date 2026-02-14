import { Link } from "react-router-dom";
import { Zap, Eye, Smartphone, Shield, TrendingUp, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="container mx-auto px-6 py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-8">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-mono text-primary">Environmental Emergency Response System</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-display mb-6 text-glow-primary">
              PROJECT PHOENIX
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Transforming Struga from waste crisis to circular economy model in 180 days through radical transparency and economic incentive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/admin">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-display text-lg glow-primary">
                  <Eye className="w-5 h-5 mr-2" />
                  Command Center
                </Button>
              </Link>
              <Link to="/citizen/auth">
                <Button size="lg" variant="outline" className="glass font-display text-lg border-secondary text-secondary hover:bg-secondary/10">
                  <Smartphone className="w-5 h-5 mr-2" />
                  Citizen Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass rounded-lg p-8 border-2 border-primary/30 hover:border-primary/50 transition-all">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
              <Eye className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-xl mb-3">The Mayor's Eye</h3>
            <p className="text-muted-foreground">
              Real-time 3D digital twin with live fleet tracking, predictive AI, and crisis response protocols.
            </p>
          </div>

          <div className="glass rounded-lg p-8 border-2 border-secondary/30 hover:border-secondary/50 transition-all">
            <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-display text-xl mb-3">The Oracle AI</h3>
            <p className="text-muted-foreground">
              Predictive intelligence that prevents problems before they happen using pattern recognition and simulation.
            </p>
          </div>

          <div className="glass rounded-lg p-8 border-2 border-border hover:border-warning/50 transition-all">
            <div className="w-12 h-12 rounded-lg bg-warning/20 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-warning" />
            </div>
            <h3 className="font-display text-xl mb-3">Performance Analytics</h3>
            <p className="text-muted-foreground">
              Real-time metrics and KPIs tracking collection efficiency, citizen participation, and environmental impact.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="glass rounded-lg border-2 border-border p-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-5xl font-display text-primary text-glow-primary mb-2">180</p>
              <p className="text-sm text-muted-foreground font-mono uppercase">Days to Transform</p>
            </div>
            <div>
              <p className="text-5xl font-display text-secondary text-glow-secondary mb-2">94</p>
              <p className="text-sm text-muted-foreground font-mono uppercase">City Health Score</p>
            </div>
            <div>
              <p className="text-5xl font-display text-warning mb-2">8/10</p>
              <p className="text-sm text-muted-foreground font-mono uppercase">Active Trucks</p>
            </div>
            <div>
              <p className="text-5xl font-display text-foreground mb-2">42T</p>
              <p className="text-sm text-muted-foreground font-mono uppercase">Waste Collected</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-display mb-6">Join the Green Army</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Every citizen is a soldier in the fight for a cleaner city. Get rewarded for recycling, track your impact, and compete on the leaderboard.
          </p>
          <Link to="/admin">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-display text-lg glow-primary">
              <TrendingUp className="w-5 h-5 mr-2" />
              Access Control Panel
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
