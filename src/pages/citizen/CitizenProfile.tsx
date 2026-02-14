import { useState, useEffect } from "react";
import CitizenLayout from "@/components/citizen/CitizenLayout";
import { useCitizenAuth } from "@/hooks/useCitizenAuth";
import { useCitizenProfile, useUpdateCitizenProfile } from "@/hooks/useCitizenProfile";
import { useZones } from "@/hooks/useZones";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Save, MapPin } from "lucide-react";
import { toast } from "sonner";

const CitizenProfile = () => {
  const { user } = useCitizenAuth();
  const { data: profile, isLoading } = useCitizenProfile(user?.id);
  const { data: zones } = useZones();
  const updateProfile = useUpdateCitizenProfile();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zoneId, setZoneId] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
      setZoneId(profile.zone_id || "");
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await updateProfile.mutateAsync({
      userId: user.id,
      updates: {
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
        zone_id: zoneId || null,
      },
    });
  };

  if (isLoading) return <CitizenLayout><div className="py-8 text-center text-muted-foreground">Loading...</div></CitizenLayout>;

  return (
    <CitizenLayout>
      <div className="space-y-6 py-4">
        <div>
          <h1 className="text-2xl font-display text-glow-secondary flex items-center gap-2">
            <User className="w-6 h-6" />
            My Profile
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your citizen account</p>
        </div>

        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-display">Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled className="opacity-60" />
              </div>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  required
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+389 XX XXX XXX"
                  maxLength={20}
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Your street address"
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Your Zone
                </Label>
                <Select value={zoneId} onValueChange={setZoneId}>
                  <SelectTrigger><SelectValue placeholder="Select your zone" /></SelectTrigger>
                  <SelectContent>
                    {zones?.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name} ({zone.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full glow-primary" disabled={updateProfile.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {updateProfile.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </CitizenLayout>
  );
};

export default CitizenProfile;
