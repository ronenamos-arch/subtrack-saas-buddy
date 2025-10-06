import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/browserClient";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    organization_name: "",
    currency: "ILS",
    notification_days: [7, 3, 1],
  });
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      setUserEmail(session.user.email || "");

      // Load profile data
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
      } else if (profileData) {
        setProfile({
          full_name: profileData.full_name || "",
          organization_name: profileData.organization_name || "",
          currency: profileData.currency || "ILS",
          notification_days: profileData.notification_days || [7, 3, 1],
        });
      }

      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        organization_name: profile.organization_name,
        currency: profile.currency,
        notification_days: profile.notification_days,
      })
      .eq("id", session.user.id);

    if (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את ההגדרות",
        variant: "destructive",
      });
    } else {
      toast({
        title: "הצלחה",
        description: "ההגדרות נשמרו בהצלחה",
      });
    }

    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div>
          <h1 className="text-4xl font-bold">הגדרות</h1>
          <p className="text-muted-foreground">נהל את ההעדפות והפרופיל שלך</p>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>פרטים אישיים</CardTitle>
            <CardDescription>עדכן את הפרטים האישיים שלך</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">דואר אלקטרוני</Label>
              <Input id="email" value={userEmail} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">שם מלא</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="הזן שם מלא"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization_name">שם ארגון (אופציונלי)</Label>
              <Input
                id="organization_name"
                value={profile.organization_name}
                onChange={(e) => setProfile({ ...profile, organization_name: e.target.value })}
                placeholder="הזן שם ארגון"
              />
            </div>
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card>
          <CardHeader>
            <CardTitle>העדפות מטבע</CardTitle>
            <CardDescription>בחר את מטבע ברירת המחדל</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="currency">מטבע ברירת מחדל</Label>
              <Select value={profile.currency} onValueChange={(value) => setProfile({ ...profile, currency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ILS">₪ שקל ישראלי</SelectItem>
                  <SelectItem value="USD">$ דולר אמריקאי</SelectItem>
                  <SelectItem value="EUR">€ יורו</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>התראות</CardTitle>
            <CardDescription>הגדר מתי לקבל התראות על חידוש מנויים</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>התרעות בימים</Label>
              <div className="flex gap-2">
                <Badge variant="secondary">7 ימים לפני</Badge>
                <Badge variant="secondary">3 ימים לפני</Badge>
                <Badge variant="secondary">יום אחד לפני</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                תקבל התראות כאשר תאריך החידוש מתקרב
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "שומר..." : "שמור שינויים"}
          </Button>
          <Button variant="outline" onClick={handleSignOut}>
            התנתק
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;