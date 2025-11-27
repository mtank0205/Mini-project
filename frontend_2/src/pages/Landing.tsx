import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Sparkles, Code2, GitBranch, Zap, Users, BarChart3 } from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Sparkles,
      title: "AI Idea Evaluation",
      description: "Get instant feedback on your hackathon ideas with AI-powered scoring across innovation, feasibility, and impact.",
      gradient: "gradient-primary",
    },
    {
      icon: Code2,
      title: "Real-time Collaboration",
      description: "Code together seamlessly with your team in our live collaborative editor with syntax highlighting.",
      gradient: "gradient-secondary",
    },
    {
      icon: GitBranch,
      title: "GitHub Repo Analysis",
      description: "Comprehensive repository evaluation covering organization, documentation, and code quality.",
      gradient: "gradient-accent",
    },
    {
      icon: Zap,
      title: "Instant Feedback",
      description: "Receive detailed reports and actionable suggestions to improve your hackathon project instantly.",
      gradient: "gradient-primary",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10 animate-gradient-shift bg-[length:200%_200%]" />

        <div className="container relative mx-auto px-4 pt-32 pb-24">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-card/50 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered Hackathon Coach</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Simulate. Evaluate.{" "}
              <span className="gradient-accent bg-clip-text text-transparent font-bold font-sans">
                Win.
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Perfect your hackathon project with AI-driven insights, real-time collaboration,
              and comprehensive evaluation before you even submit.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link to="/signup">
                <Button size="lg" className="gradient-primary shadow-glow text-lg px-8">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Login
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>5,000+ Teams</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>98% Success Rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Everything you need to{" "}
            <span className="gradient-primary bg-clip-text text-transparent">
              succeed
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help your team create winning hackathon projects
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="hover-lift border-2 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className={`inline-flex p-3 rounded-xl ${feature.gradient} w-fit mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <Card className="relative overflow-hidden border-2">
          <div className="absolute inset-0 gradient-hero opacity-10" />
          <CardContent className="relative p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to build your winning project?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of teams using HackSim to perfect their hackathon submissions
            </p>
            <Link to="/signup">
              <Button size="lg" className="gradient-primary shadow-glow text-lg px-8">
                Start For Free
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  );
}
