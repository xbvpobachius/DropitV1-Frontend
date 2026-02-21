import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Alex Rivera",
    location: "Miami, FL",
    image: "👨‍💼",
    rating: 5,
    text: "DropIt helped me automate 5 stores and 3x my sales in just 2 months. The AI video generator is a game changer.",
  },
  {
    name: "Sarah Chen",
    location: "Los Angeles, CA",
    image: "👩‍💻",
    rating: 5,
    text: "Finally, a tool that delivers. My YouTube channel is growing on autopilot.",
  },
  {
    name: "Marcus Johnson",
    location: "New York, NY",
    image: "🧑‍🚀",
    rating: 5,
    text: "Game changer for my agency. We're managing 50+ brands with DropIt.",
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
            What our users say about DropIt
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
