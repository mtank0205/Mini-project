import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import {
  Lightbulb,
  GitBranch,
  FileText,
  Code2
} from "lucide-react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navigationCards = [
    {
      title: "Code Analyzer",
      description: "Get AI-powered feedback on your code quality and best practices",
      icon: Code2,
      gradient: "gradient-primary",
      link: "/code-analyzer",
    },
    {
      title: "Idea Evaluation",
      description: "Get AI-powered feedback on your hackathon idea",
      icon: Lightbulb,
      gradient: "gradient-accent",
      link: "/idea",
    },
    {
      title: "Repository Analysis",
      description: "Analyze your GitHub repository for best practices",
      icon: GitBranch,
      gradient: "gradient-secondary",
      link: "/repo",
    },
    {
      title: "View Reports",
      description: "Access your previous evaluation reports and scores",
      icon: FileText,
      gradient: "gradient-primary",
      link: "/reports",
    },
  ];


  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="bg-gradient-primary bg-clip-text text-transparent">{user.username}</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Ready to build something amazing? Let's get started.
          </p>
        </div>


        {/* Navigation Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {navigationCards.map((card, index) => (
              <Link key={index} to={card.link}>
                <Card
                  className="h-full hover-lift cursor-pointer border-2 transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 0.1} s` }}
                >
                  <CardHeader>
                    <div className={`inline - flex p - 3 rounded - xl ${card.gradient} w - fit mb - 4`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{card.title}</CardTitle>
                    <CardDescription className="text-base">
                      {card.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
