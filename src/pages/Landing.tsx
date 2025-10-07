import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, CreditCard, TrendingUp, Bell, Mail, Shield, BarChart3, Zap, Play } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 px-6">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              פתרון חכם לניהול מנויים
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
              SubTrack
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              נהל את כל מנויי ה-SaaS שלך במקום אחד. חסוך זמן וכסף עם מעקב אוטומטי, התראות חכמות וניתוח עלויות.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90 shadow-lg">
                <Link to="/auth">התחל ניסיון חינם</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                onClick={() => setDemoOpen(true)}
              >
                <Play className="h-5 w-5 ml-2" />
                צפה בהדגמה
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">למה SubTrack?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              כל מה שאתה צריך כדי לשלוט במנויים שלך ולהפסיק לזרוק כסף
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">מעקב מרכזי</CardTitle>
                <CardDescription>
                  כל המנויים במקום אחד. סוף לכרטיסי אשראי מפוזרים והפתעות בחיוב.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-success" />
                </div>
                <CardTitle className="text-xl">התראות חכמות</CardTitle>
                <CardDescription>
                  קבל התראות לפני חידוש אוטומטי. אל תשלם על שירותים שלא משתמש בהם.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-warning" />
                </div>
                <CardTitle className="text-xl">סריקת חשבוניות</CardTitle>
                <CardDescription>
                  קישור למייל וזיהוי אוטומטי של חשבוניות. מעקב ללא מאמץ.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-danger/10 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-danger" />
                </div>
                <CardTitle className="text-xl">ניתוח עלויות</CardTitle>
                <CardDescription>
                  הבן לאן הכסף הולך. קבל המלצות לחיסכון והפחתת עלויות.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="text-5xl font-bold text-primary mb-2">₪2,400</div>
              <p className="text-lg text-muted-foreground">חיסכון ממוצע בשנה</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-5xl font-bold text-primary mb-2">15+</div>
              <p className="text-lg text-muted-foreground">מנויים ממוצעים לעסק</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-5xl font-bold text-primary mb-2">3 דק׳</div>
              <p className="text-lg text-muted-foreground">זמן הגדרה</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">תמחור פשוט ושקוף</h2>
            <p className="text-xl text-muted-foreground">
              בחר את התוכנית המתאימה לך
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₪0</span>
                  <span className="text-muted-foreground">/חודש</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-success" />
                    <span>עד 20 יוזרים</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-success" />
                    <span>התראות בסיסיות</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-success" />
                    <span>דוחות חודשיים</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline" asChild>
                  <Link to="/auth">התחל חינם</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="relative border-primary shadow-glow">
              <div className="absolute -top-4 right-1/2 translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">הכי פופולרי</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₪25</span>
                  <span className="text-muted-foreground">/חודש</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-success" />
                    <span>מנויים ללא הגבלה</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-success" />
                    <span>סריקת מיילים אוטומטית</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-success" />
                    <span>ניתוח עלויות מתקדם</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-success" />
                    <span>המלצות AI</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-success" />
                    <span>ייצוא נתונים</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" asChild>
                  <Link to="/auth">התחל ניסיון</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">מותאם</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-success" />
                    <span>כל התכונות של Pro</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-success" />
                    <span>ניהול צוות</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-success" />
                    <span>SSO/SAML</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-success" />
                    <span>תמיכה מועדפת</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-success" />
                    <span>SLA מובטח</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline">
                  צור קשר
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <Zap className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-4">
            מוכן להתחיל לחסוך?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            הצטרף ל-SubTrack היום וקבל שליטה מלאה על כל המנויים שלך
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
            <Link to="/auth">התחל ניסיון חינם - ללא כרטיס אשראי</Link>
          </Button>
        </div>
      </section>

      {/* Demo Video Dialog */}
      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent className="max-w-4xl w-full p-0" dir="rtl">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl">סרטון הדגמה - SubTrack</DialogTitle>
          </DialogHeader>
          <div className="relative w-full pb-[56.25%] bg-muted rounded-b-lg overflow-hidden">
            {/* Replace the src URL below with your actual demo video URL */}
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="SubTrack Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="p-6 pt-4 text-center text-sm text-muted-foreground">
            <p>צפה כיצד SubTrack עוזר לך לנהל מנויים, להעלות חשבוניות ולעקוב אחר עלויות בקלות</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="py-12 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl">SubTrack</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">תנאי שימוש</a>
              <a href="#" className="hover:text-foreground transition-colors">מדיניות פרטיות</a>
              <a href="#" className="hover:text-foreground transition-colors">צור קשר</a>
            </div>
          </div>
          <div className="text-center mt-8 text-sm text-muted-foreground">
            © 2025 SubTrack. כל הזכויות שמורות.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;