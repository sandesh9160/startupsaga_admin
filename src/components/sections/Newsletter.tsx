"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";

interface NewsletterProps {
  title?: string;
  description?: string;
  buttonText?: string;
}

export function Newsletter({ title, description, buttonText }: NewsletterProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="section-alt section-padding">
      <div className="container-wide">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-6">
            <Mail className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {title || "Stay Updated with Startup Stories"}
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            {description || "Get the latest startup stories, founder insights, and ecosystem updates delivered to your inbox every week."}
          </p>

          {submitted ? (
            <div className="flex items-center justify-center gap-3 p-6 rounded-xl bg-accent/10 animate-fade-in">
              <CheckCircle className="h-6 w-6 text-accent" />
              <span className="text-foreground font-medium">
                Thanks for subscribing! Check your inbox soon.
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-12 bg-background"
                required
                suppressHydrationWarning
              />
              <Button type="submit" variant="accent" size="lg" className="gap-2" suppressHydrationWarning>
                {buttonText || "Subscribe"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  );
}
