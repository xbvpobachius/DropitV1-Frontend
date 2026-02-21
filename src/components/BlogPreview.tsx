import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";

const blogPosts = [
  {
    title: "Top 5 Viral Products to Sell in 2025",
    excerpt: "Discover the hottest trending products that are crushing it on TikTok right now.",
    date: "Jan 15, 2025",
    category: "Product Research",
    image: "📱",
  },
  {
    title: "How to Scale to $10K/Month with AI Videos",
    excerpt: "A step-by-step guide to reaching your first 5 figures using automated video marketing.",
    date: "Jan 12, 2025",
    category: "Growth Strategies",
    image: "🚀",
  },
  {
    title: "TikTok Algorithm Secrets for 2025",
    excerpt: "Learn the latest algorithm updates and how to leverage them for maximum reach.",
    date: "Jan 10, 2025",
    category: "TikTok Tips",
    image: "🎯",
  },
];

const BlogPreview = () => {
  return (
    <section className="py-24 px-4 bg-background relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-primary rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-end mb-16">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Latest from Our <span className="text-primary">Blog</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Tips, strategies, and insights to grow your dropshipping business
            </p>
          </div>
          <Button variant="link" className="text-primary hover:text-primary/80 hidden md:flex items-center gap-2">
            View All Posts
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <article
              key={index}
              className="group bg-white border border-border rounded-2xl overflow-hidden hover-lift cursor-pointer"
            >
              {/* Image placeholder */}
              <div className="h-48 bg-gradient-to-br from-primary/10 to-card flex items-center justify-center text-6xl border-b border-primary/10">
                {post.image}
              </div>

              <div className="p-6 space-y-4">
                {/* Category and date */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary font-medium">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{post.date}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-muted-foreground leading-relaxed">{post.excerpt}</p>

                {/* Read more */}
                <Button variant="link" className="text-primary hover:text-primary/80 p-0 h-auto group/btn">
                  Read More
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </article>
          ))}
        </div>

        {/* Mobile view all button */}
        <div className="mt-8 text-center md:hidden">
          <Button variant="link" className="text-primary hover:text-primary/80">
            View All Posts
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;
