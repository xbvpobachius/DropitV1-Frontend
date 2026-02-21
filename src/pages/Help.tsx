import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, HelpCircle, Video, Zap } from "lucide-react";
import NavbarWithScroll from "@/components/NavbarWithScroll";
import Footer from "@/components/Footer";

const Help = () => {
  const faqs = [
    {
      question: "How does DropIt work?",
      answer: "Connect your YouTube channel, add your Shorts to the calendar, and set publish times. DropIt publishes them automatically at the schedule you choose."
    },
    {
      question: "What does DropIt do?",
      answer: "DropIt automates the scheduling and publishing of your YouTube Shorts. Plan your content in advance and we handle the uploads at the times you set."
    },
    {
      question: "How many Shorts can I schedule per day?",
      answer: "It depends on your plan: Starter allows 1 Short/day, Pro allows 2/day, and Business allows 3/day. Check the pricing page for details."
    },
    {
      question: "Can I change my publish times?",
      answer: "Yes. You can set and update your daily publish times in the dashboard. Changes apply to future uploads."
    },
    {
      question: "Do I need technical skills?",
      answer: "No. DropIt is built for creators. Connect your channel, plan your content, and we take care of the rest."
    },
    {
      question: "What's included in the free trial?",
      answer: "The 7-day free trial gives you full access to schedule and publish Shorts. No credit card required."
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
              <CardDescription>Get started in three steps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Connect YouTube</h3>
                  <p className="text-muted-foreground">Link your YouTube channel via secure OAuth. You stay in control and can revoke access anytime.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Plan & schedule</h3>
                  <p className="text-muted-foreground">Add your Shorts to the calendar and choose when each one should go live. Plan days or weeks ahead.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Publish automatically</h3>
                  <p className="text-muted-foreground">We upload your Shorts at the times you set. No manual work. Stay consistent without the stress.</p>
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
