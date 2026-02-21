import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, HelpCircle, Video, Zap } from "lucide-react";
import NavbarWithScroll from "@/components/NavbarWithScroll";
import Footer from "@/components/Footer";

const Help = () => {
  const faqs = [
    {
      question: "How does DropIt work?",
      answer: "DropIt automates your entire dropshipping workflow. Simply select a product, and our AI will generate your store, create engaging videos, and publish them automatically to YouTube."
    },
    {
      question: "What platforms does DropIt support?",
      answer: "DropIt focuses on YouTube organic marketing, including YouTube Shorts automation for maximum reach and engagement."
    },
    {
      question: "How many videos can I create per day?",
      answer: "It depends on your plan: Starter allows 1 video/day, Pro allows 2 videos/day, and Business allows 3 videos/day. All videos are AI-generated and optimized for engagement."
    },
    {
      question: "Can I customize the videos?",
      answer: "Yes! While our AI handles the heavy lifting, you can customize video style, captions, and posting schedule through your dashboard."
    },
    {
      question: "Do I need any technical skills?",
      answer: "No! DropIt is designed to be completely beginner-friendly. If you can click a button, you can run a dropshipping business with DropIt."
    },
    {
      question: "What's included in the free trial?",
      answer: "The 7-day free trial on our Starter plan gives you full access to 1 product, 1 store, and 1 video per day with no credit card required."
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <NavbarWithScroll />
      
      <main className="pt-44 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Help <span className="text-primary">Center</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about DropIt
            </p>
          </div>

          {/* Getting Started Guide */}
          <Card className="bg-white border border-border mb-8 animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <BookOpen className="h-6 w-6 text-primary" />
                Getting Started with DropIt
              </CardTitle>
              <CardDescription>Follow these 4 simple steps to start your dropshipping journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Select Your Product</h3>
                  <p className="text-muted-foreground">Browse our trending products page and choose winning products curated by AI.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Generate Your Website with AI</h3>
                  <p className="text-muted-foreground">Our AI instantly creates a professional dropshipping store optimized for conversions.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Create and Schedule Videos Automatically</h3>
                  <p className="text-muted-foreground">AI generates engaging product videos and schedules them to publish on YouTube.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Watch Your Organic Sales Grow</h3>
                  <p className="text-muted-foreground">Monitor performance, track analytics, and scale your business effortlessly.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white border border-border hover-lift">
              <CardHeader>
                <Video className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Video Tutorials</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Watch step-by-step guides</p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-border hover-lift">
              <CardHeader>
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Quick Start</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Get up and running in 5 minutes</p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-border hover-lift">
              <CardHeader>
                <HelpCircle className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Contact Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">We're here to help 24/7</p>
              </CardContent>
            </Card>
          </div>

          {/* FAQ */}
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-6">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
            
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-white border border-border px-6 border-none"
                >
                  <AccordionTrigger className="text-left font-semibold hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Help;
