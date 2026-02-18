import { Youtube } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    Product: ["Features", "Pricing", "Demo", "Updates"],
    Company: ["About", "Blog", "Careers", "Contact"],
    Resources: ["Documentation", "Help Center", "Community", "Status"],
    Legal: ["Terms", "Privacy", "Security", "Compliance"],
  };

  return (
    <footer className="border-t border-border/50 bg-secondary/20 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Drop<span className="text-primary">It</span>
            </h3>
            <p className="text-muted-foreground mb-6">
              Automate your dropshipping video marketing with AI.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full card-premium flex items-center justify-center hover:bg-primary/10 hover:border-primary/40 hover:scale-110 transition-all"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full card-premium flex items-center justify-center hover:bg-primary/10 hover:border-primary/40 hover:scale-110 transition-all"
                aria-label="Twitter/X"
              >
                <span className="text-lg">𝕏</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full card-premium flex items-center justify-center hover:bg-primary/10 hover:border-primary/40 hover:scale-110 transition-all"
                aria-label="YouTube Channel"
              >
                <span className="text-lg">📺</span>
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4 text-foreground">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2025 DropIt. All rights reserved.</p>
          <p>Built with AI • Powered by Innovation</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
