import { Check } from "lucide-react";

const benefits = [
  "Plan your Shorts in batches — no more daily stress",
  "Set publish times once and let automation do the rest",
  "Keep your channel consistent without burning out",
  "One connected YouTube channel, all your content scheduled",
];

const VideoShowcase = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Why influencers use DropIt
        </h2>
        <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
          A simple way to automate your YouTube Shorts. Plan, schedule, publish. That's it.
        </p>
        <ul className="space-y-4 text-left">
          {benefits.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <Check className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default VideoShowcase;
