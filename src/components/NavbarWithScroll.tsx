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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = () => {
    if (localStorage.getItem("access_token")) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_email");
      // Netejar subscripció de prova perquè el següent usuari no vegi "Active plan"
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
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
    navigate("/");
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Pricing", href: "/pricing" },
    { name: "Docs", href: "/help" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-4 py-4 transition-all duration-300 ${
      isScrolled ? 'bg-background/95 backdrop-blur-lg border-b border-border/50' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex-1">
            <Link 
              to="/" 
              className="text-2xl font-bold text-foreground transition-all duration-300 hover:drop-shadow-[0_0_8px_hsl(var(--primary))] inline-block"
            >
              Drop<span className="text-primary">It</span>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-foreground hover:text-primary transition-colors link-underline font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4 flex-1 justify-end">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{user.email}</span>
                </div>
                <Button 
                  variant="ghost" 
                  className="font-medium hover:text-primary"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" className="font-medium hover:text-primary">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button className="bg-primary hover:bg-primary/90 text-white font-semibold glow-primary">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-card rounded-lg transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 card-premium rounded-2xl p-6 space-y-4 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="block text-foreground hover:text-primary transition-colors py-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-border space-y-3">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground truncate">{user.email}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full font-medium"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full font-medium">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth?mode=signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold">
                      Get Started
                    </Button>
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
