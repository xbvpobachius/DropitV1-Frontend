import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Alex R.",
    location: "Creator",
    image: "👤",
    rating: 5,
    text: "Finally I can plan my Shorts in advance. No more rushing to post every day.",
  },
  {
    name: "Sarah C.",
    location: "Influencer",
    image: "👤",
    rating: 5,
    text: "My channel stays consistent now. I batch my content on weekends and forget about it.",
  },
  {
    name: "Marcus J.",
    location: "Content creator",
    image: "👤",
    rating: 5,
    text: "Simple tool that does one thing well. Scheduling without the stress.",
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-blue-50/40">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Loved by creators
          </h2>
          <p className="text-muted-foreground">
            What influencers say about DropIt
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-border p-6 hover-lift"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-foreground mb-6 text-sm leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
                  {t.image}
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
