import { useState } from "react";
import CitizenLayout from "@/components/citizen/CitizenLayout";
import { useCitizenAuth } from "@/hooks/useCitizenAuth";
import { useCitizenIssues, useCreateIssue } from "@/hooks/useCitizenIssues";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Plus, Send, CheckCircle, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";

const CATEGORIES = [
  { value: "missed_collection", label: "Missed Collection" },
  { value: "overflowing_bin", label: "Overflowing Bin" },
  { value: "illegal_dumping", label: "Illegal Dumping" },
  { value: "damaged_bin", label: "Damaged Bin" },
  { value: "noise_complaint", label: "Noise Complaint" },
  { value: "general", label: "General Issue" },
];

const SEVERITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const CitizenReport = () => {
  const { user } = useCitizenAuth();
  const { data: issues } = useCitizenIssues(user?.id);
  const createIssue = useCreateIssue();
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [severity, setSeverity] = useState("low");
  const [address, setAddress] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !description.trim()) return;
    await createIssue.mutateAsync({
      citizen_user_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category,
      severity,
      address: address.trim() || undefined,
    });
    setTitle("");
    setDescription("");
    setCategory("general");
    setSeverity("low");
    setAddress("");
    setShowForm(false);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "open": return <Clock className="w-3 h-3" />;
      case "resolved": return <CheckCircle className="w-3 h-3" />;
      default: return <XCircle className="w-3 h-3" />;
    }
  };

  return (
    <CitizenLayout>
      <div className="space-y-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display text-glow-secondary flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Report Issues
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Report problems in your area</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            size="sm"
            className={showForm ? "bg-muted text-foreground" : "glow-primary"}
          >
            <Plus className="w-4 h-4 mr-1" />
            {showForm ? "Cancel" : "New"}
          </Button>
        </div>

        {/* New Issue Form */}
        {showForm && (
          <Card className="glass border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display">New Report</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="Brief description..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={100}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Select value={severity} onValueChange={setSeverity}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SEVERITIES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address (optional)</Label>
                  <Input
                    placeholder="Street address or location..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe the issue in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    maxLength={1000}
                    rows={4}
                  />
                </div>
                <Button type="submit" className="w-full glow-primary" disabled={createIssue.isPending}>
                  <Send className="w-4 h-4 mr-2" />
                  {createIssue.isPending ? "Submitting..." : "Submit Report"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Issues List */}
        <div className="space-y-3">
          {issues?.length === 0 && !showForm && (
            <Card className="glass border-border/30">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No reports yet. Tap "New" to report an issue.</p>
              </CardContent>
            </Card>
          )}

          {issues?.map((issue) => (
            <Card key={issue.id} className="glass border-border/30 hover:border-border/60 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-medium flex-1">{issue.title}</h3>
                  <Badge
                    variant={issue.status === "open" ? "destructive" : issue.status === "resolved" ? "default" : "secondary"}
                    className="text-[10px] ml-2 flex items-center gap-1"
                  >
                    {statusIcon(issue.status)} {issue.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{issue.description}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Badge variant="outline" className="text-[10px] capitalize">{issue.category.replace("_", " ")}</Badge>
                  <span>•</span>
                  <span>{format(new Date(issue.created_at), "MMM d, yyyy")}</span>
                  {issue.address && (
                    <>
                      <span>•</span>
                      <span className="truncate">{issue.address}</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </CitizenLayout>
  );
};

export default CitizenReport;
