import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

function getLoggedInUser(): { email: string } | null {
  const token = localStorage.getItem("access_token");
  if (token) {
    const email = localStorage.getItem("user_email");
    return { email: email || "Account" };
  }
  return null;
}

const NavbarWithScroll = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(() => getLoggedInUser());
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const updateUser = () => {
      const dropitUser = getLoggedInUser();
      if (dropitUser) {
        setUser(dropitUser);
        return;
      }
      setUser(null);
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      });
    };

    updateUser();
    window.addEventListener("dropit-auth-change", updateUser);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!localStorage.getItem("access_token")) setUser(session?.user ?? null);
    });

    return () => {
      window.removeEventListener("dropit-auth-change", updateUser);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = () => {
    if (localStorage.getItem("access_token")) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_email");
      sessionStorage.removeItem("test_subscription");
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith("test_subscription_")) keysToRemove.push(key);
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));
      window.dispatchEvent(new Event("dropit-auth-change"));
    } else {
      supabase.auth.signOut();
      sessionStorage.removeItem("test_subscription");
    }
    toast({ title: "Signed out", description: "You've been successfully signed out." });
    navigate("/");
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Pricing", href: "/pricing" },
    { name: "Docs", href: "/help" },
  ];

  const navClass = isScrolled
    ? "bg-white/95 backdrop-blur-sm border-b border-border shadow-sm"
    : "bg-transparent";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 transition-all duration-200 ${navClass}`}>
      <div className="max-w-5xl mx-auto relative flex items-center justify-between h-14">
        {/* Logo - left */}
        <Link
          to="/"
          className="text-xl font-bold text-foreground hover:text-primary transition-colors shrink-0"
        >
          Drop<span className="text-primary">It</span>
        </Link>

        {/* Nav links - absolutely centered */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right - CTA or user, matches logo width for balance */}
        <div className="hidden md:flex items-center justify-end gap-3 shrink-0 min-w-[140px]">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/80">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground truncate max-w-[120px]">{user.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 -mr-2 rounded-lg hover:bg-muted shrink-0"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-border animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="block py-2 text-sm font-medium text-foreground hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-border space-y-2">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/80 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate">{user.email}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => { handleSignOut(); setIsMenuOpen(false); }}>
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Sign in</Button>
                  </Link>
                  <Link to="/auth?mode=signup" onClick={() => setIsMenuOpen(false)}>
                    <Button size="sm" className="w-full">Get started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavbarWithScroll;
