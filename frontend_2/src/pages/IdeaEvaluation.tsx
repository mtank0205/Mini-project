import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { ProgressBar } from "@/components/ProgressBar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Sparkles, Download, TrendingUp, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { evaluationApi } from "@/lib/api";
import { generateIdeaEvaluationPDF } from "@/lib/pdfGenerator";

export default function IdeaEvaluation() {
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [features, setFeatures] = useState("");
  const [techStack, setTechStack] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleEvaluate = async () => {
    if (!problem || !solution) {
      toast({
        title: "Missing information",
        description: "Please fill in at least the problem and solution fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const roomId = `idea-${Date.now()}`;
      const response = await evaluationApi.evaluateIdea({
        roomId,
        problemStatement: problem,
        idea: solution,
        features: features.split('\n').filter(f => f.trim()),
        techStack: techStack.split('\n').filter(t => t.trim()),
      });

      const data = response.data.data || response.data;
      setResults({
        overall: Math.round((data.scores?.innovation + data.scores?.feasibility + data.scores?.impact + data.scores?.scalability + data.scores?.clarity) / 5 * 10),
        scores: {
          innovation: Math.round(data.scores?.innovation * 10 || 0),
          feasibility: Math.round(data.scores?.feasibility * 10 || 0),
          impact: Math.round(data.scores?.impact * 10 || 0),
          scalability: Math.round(data.scores?.scalability * 10 || 0),
          clarity: Math.round(data.scores?.clarity * 10 || 0),
        },
        feedback: data.summary || "Evaluation completed successfully.",
        improvements: data.improvements || [],
      });

      toast({
        title: "Evaluation Complete!",
        description: "Your idea has been evaluated by AI",
      });
    } catch (error: any) {
      toast({
        title: "Evaluation Failed",
        description: error.response?.data?.message || "Failed to evaluate idea. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const handleDownloadReport = () => {
    if (!results) {
      toast({
        title: "No results to download",
        description: "Please evaluate your idea first",
        variant: "destructive",
      });
      return;
    }

    try {
      generateIdeaEvaluationPDF({
        problem,
        solution,
        features: features.split('\n').filter(f => f.trim()),
        techStack: techStack.split('\n').filter(t => t.trim()),
        results,
      });

      toast({
        title: "PDF Downloaded!",
        description: "Your evaluation report has been saved",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold mb-2">
              <span className="gradient-primary bg-clip-text text-transparent">AI-Powered</span> Idea Evaluation
            </h1>
            <p className="text-muted-foreground text-lg">
              Get comprehensive feedback on your hackathon idea from our AI judge
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Your Idea
                  </CardTitle>
                  <CardDescription>Provide details about your hackathon project</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="problem">Problem Statement *</Label>
                    <Textarea
                      id="problem"
                      placeholder="What problem are you solving?"
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="solution">Your Solution/Idea *</Label>
                    <Textarea
                      id="solution"
                      placeholder="Describe your proposed solution..."
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="features">Key Features (one per line)</Label>
                    <Textarea
                      id="features"
                      placeholder="- Real-time collaboration&#10;- AI-powered suggestions&#10;- Cloud storage"
                      value={features}
                      onChange={(e) => setFeatures(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="techStack">Tech Stack (one per line)</Label>
                    <Textarea
                      id="techStack"
                      placeholder="- React&#10;- Node.js&#10;- PostgreSQL"
                      value={techStack}
                      onChange={(e) => setTechStack(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button
                    className="w-full gradient-primary"
                    size="lg"
                    onClick={handleEvaluate}
                    disabled={isLoading}
                  >
                    {isLoading ? "Evaluating..." : "Evaluate Idea"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {isLoading ? (
                <Card>
                  <CardContent className="py-12">
                    <LoadingSpinner size="lg" />
                    <p className="text-center text-muted-foreground mt-4">
                      AI is analyzing your idea...
                    </p>
                  </CardContent>
                </Card>
              ) : results ? (
                <>
                  <Card className="border-2 animate-scale-in">
                    <CardHeader>
                      <CardTitle>Overall Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className={`text-7xl font-bold mb-2 ${getScoreColor(results.overall)}`}>
                          {results.overall}
                        </div>
                        <p className="text-muted-foreground">out of 100</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="animate-scale-in" style={{ animationDelay: "0.1s" }}>
                    <CardHeader>
                      <CardTitle>Detailed Scores</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ProgressBar label="Innovation" value={results.scores.innovation} />
                      <ProgressBar label="Feasibility" value={results.scores.feasibility} />
                      <ProgressBar label="Impact" value={results.scores.impact} />
                      <ProgressBar label="Scalability" value={results.scores.scalability} />
                      <ProgressBar label="Clarity" value={results.scores.clarity} />
                    </CardContent>
                  </Card>

                  <Card className="animate-scale-in" style={{ animationDelay: "0.2s" }}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        AI Feedback
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">{results.feedback}</p>

                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Suggestions for Improvement
                        </h4>
                        <ul className="space-y-2">
                          {results.improvements.map((improvement: string, index: number) => (
                            <li key={index} className="flex gap-2 text-sm text-muted-foreground">
                              <span className="text-warning">•</span>
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button className="w-full" variant="outline" onClick={handleDownloadReport}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Report
                      </Button>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="border-2 border-dashed">
                  <CardContent className="py-12 text-center">
                    <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Fill in your idea details and click "Evaluate Idea" to see results
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
