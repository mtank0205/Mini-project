import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { ProgressBar } from "@/components/ProgressBar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Download, Star, Code, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { evaluationApi } from "@/lib/api";
import { generateRepoEvaluationPDF } from "@/lib/pdfGenerator";

export default function RepoEvaluation() {
  const [repoUrl, setRepoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleAnalyze = async () => {
    if (!repoUrl || !repoUrl.includes("github.com")) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid GitHub repository URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const roomId = `repo-${Date.now()}`;
      const response = await evaluationApi.evaluateRepo({
        roomId,
        repoUrl,
      });

      const data = response.data.data || response.data;
      const repoMeta = data.repoMetadata || {};
      setResults({
        repoInfo: {
          name: repoMeta.name || 'Repository',
          stars: repoMeta.stars || 0,
          language: repoMeta.language || 'Unknown',
          contributors: repoMeta.contributors || 0,
        },
        overall: Math.round((data.scores?.organization + data.scores?.documentation + data.scores?.commitQuality + data.scores?.contributorBalance + data.scores?.projectMaturity + data.scores?.techStackSuitability) / 6 * 10),
        scores: {
          organization: Math.round(data.scores?.organization * 10 || 0),
          documentation: Math.round(data.scores?.documentation * 10 || 0),
          commitQuality: Math.round(data.scores?.commitQuality * 10 || 0),
          contributorBalance: Math.round(data.scores?.contributorBalance * 10 || 0),
          projectMaturity: Math.round(data.scores?.projectMaturity * 10 || 0),
          techStackSuitability: Math.round(data.scores?.techStackSuitability * 10 || 0),
        },
        strengths: data.strengths || [],
        improvements: data.improvements || [],
      });

      toast({
        title: "Analysis Complete!",
        description: "Repository has been analyzed",
      });
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: error.response?.data?.message || "Failed to analyze repository. Please try again.",
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
        description: "Please analyze a repository first",
        variant: "destructive",
      });
      return;
    }

    try {
      generateRepoEvaluationPDF({
        repoUrl,
        results,
      });

      toast({
        title: "PDF Downloaded!",
        description: "Your repository analysis has been saved",
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
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-primary bg-clip-text text-transparent">Repository</span> Analysis
            </h1>
            <p className="text-muted-foreground text-lg">
              Get comprehensive analysis of your GitHub repository
            </p>
          </div>

          {/* Input Section */}
          <Card className="mb-8 animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-primary" />
                Repository URL
              </CardTitle>
              <CardDescription>Enter your GitHub repository URL for analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="repoUrl">GitHub Repository URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="repoUrl"
                    type="url"
                    placeholder="https://github.com/username/repository"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                  />
                  <Button
                    className="gradient-primary px-8"
                    onClick={handleAnalyze}
                    disabled={isLoading}
                  >
                    {isLoading ? "Analyzing..." : "Analyze"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {isLoading ? (
            <Card>
              <CardContent className="py-12">
                <LoadingSpinner size="lg" />
                <p className="text-center text-muted-foreground mt-4">
                  Analyzing repository...
                </p>
              </CardContent>
            </Card>
          ) : results ? (
            <div className="space-y-6">
              {/* Repository Info */}
              <Card className="animate-scale-in">
                <CardHeader>
                  <CardTitle>Repository Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-semibold">{results.repoInfo.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Language:</span>
                        <Badge variant="secondary">{results.repoInfo.language}</Badge>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Stars:</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-warning fill-warning" />
                          <span className="font-semibold">{results.repoInfo.stars}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Contributors:</span>
                        <span className="font-semibold">{results.repoInfo.contributors}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Overall Score */}
              <Card className="border-2 animate-scale-in" style={{ animationDelay: "0.1s" }}>
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

              {/* Detailed Scores */}
              <Card className="animate-scale-in" style={{ animationDelay: "0.2s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Detailed Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ProgressBar label="Organization" value={results.scores.organization} />
                  <ProgressBar label="Code Quality" value={results.scores.codeQuality} />
                  <ProgressBar label="Documentation" value={results.scores.documentation} />
                  <ProgressBar label="Commit Quality" value={results.scores.commitQuality} />
                  <ProgressBar label="Contributor Balance" value={results.scores.contributorBalance} />
                  <ProgressBar label="Project Maturity" value={results.scores.projectMaturity} />
                  <ProgressBar label="Tech Stack Suitability" value={results.scores.techStackSuitability} />
                </CardContent>
              </Card>

              {/* Strengths and Improvements */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="animate-scale-in" style={{ animationDelay: "0.3s" }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="h-5 w-5" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {results.strengths.map((strength: string, index: number) => (
                        <li key={index} className="flex gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="animate-scale-in" style={{ animationDelay: "0.4s" }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-warning">
                      <AlertTriangle className="h-5 w-5" />
                      Improvements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {results.improvements.map((improvement: string, index: number) => (
                        <li key={index} className="flex gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Download Report */}
              <Card className="animate-scale-in" style={{ animationDelay: "0.5s" }}>
                <CardContent className="py-6">
                  <Button className="w-full" variant="outline" size="lg" onClick={handleDownloadReport}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Detailed Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-2 border-dashed">
              <CardContent className="py-12 text-center">
                <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Enter a GitHub repository URL and click "Analyze" to see results
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
