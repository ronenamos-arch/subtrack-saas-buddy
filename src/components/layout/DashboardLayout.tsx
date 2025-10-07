import { ReactNode, useEffect, useState } from "react";
import {
  LayoutDashboard,
  CreditCard,
  Settings,
  BarChart3,
  Mail,
  Plug,
  LogOut,
  Shield,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/browserClient";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const menuItems = [
  { title: "דשבורד", url: "/dashboard", icon: LayoutDashboard },
  { title: "מנויים", url: "/subscriptions", icon: CreditCard },
  { title: "דוחות", url: "/reports", icon: BarChart3 },
  { title: "חשבוניות", url: "/invoices", icon: Mail },
  { title: "אינטגרציות", url: "/integrations", icon: Plug },
];

function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" side="right">
      <SidebarContent>
        <div className="p-4 flex items-center gap-2" dir="rtl">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          {!collapsed && <span className="font-bold text-lg">SubTrack</span>}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>תפריט ראשי</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<{ full_name?: string; email?: string }>({});

  useEffect(() => {
    const loadUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      setUserProfile({
        full_name: profile?.full_name || "",
        email: user.email,
      });
    };

    loadUserProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "התנתקת בהצלחה",
    });
    navigate("/");
  };

  const getInitials = () => {
    if (userProfile.full_name) {
      return userProfile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return userProfile.email?.[0]?.toUpperCase() || "U";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full relative" dir="rtl">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto relative z-10">
          <div className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex-1" />
            
            {/* User Profile Menu */}
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {userProfile.full_name || userProfile.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="text-right">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {userProfile.full_name || "משתמש"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {userProfile.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer flex items-center">
                    <Settings className="ml-2 h-4 w-4" />
                    <span>הגדרות</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="ml-2 h-4 w-4" />
                  <span>התנתק</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};