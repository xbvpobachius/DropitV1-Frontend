import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Alex Rivera",
    location: "Miami, FL",
    image: "👨‍💼",
    rating: 5,
    text: "DropIt helped me automate 5 stores and 3x my sales in just 2 months. The AI video generator is insane!",
  },
  {
    name: "Sarah Chen",
    location: "Los Angeles, CA",
    image: "👩‍💻",
    rating: 5,
    text: "Finally, a tool that actually delivers on its promise. My YouTube channel is growing on complete autopilot.",
  },
  {
    name: "Marcus Johnson",
    location: "New York, NY",
    image: "🧑‍🚀",
    rating: 5,
    text: "Game changer for my agency. We're managing 50+ brands now with DropIt. ROI is through the roof.",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 px-4 bg-secondary/30 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-primary rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Loved by <span className="text-primary">Entrepreneurs</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            See what our users are saying about DropIt
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="card-premium rounded-2xl p-8 hover-lift"
            >
              {/* Rating stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>

              {/* Testimonial text */}
              <p className="text-lg mb-6 leading-relaxed text-foreground">"{testimonial.text}"</p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-2xl">
                  {testimonial.image}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
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
