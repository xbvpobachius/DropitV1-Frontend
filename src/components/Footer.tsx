import { Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const footerLinks = {
    Product: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Help", href: "/help" },
    ],
    Company: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contact", href: "#" },
    ],
    Legal: [
      { label: "Terms", href: "#" },
      { label: "Privacy", href: "#" },
    ],
  };

  return (
    <footer className="bg-white border-t border-border py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-xl font-semibold text-foreground">
              <span>Drop<span className="text-primary">It</span></span>
            </Link>
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              Plan, schedule & automate your YouTube Shorts. For influencers and creators.
            </p>
            <a
              href="#"
              className="inline-flex w-9 h-9 rounded-lg border border-border items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="h-4 w-4" />
            </a>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-medium text-foreground mb-3 text-sm">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} DropIt. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
