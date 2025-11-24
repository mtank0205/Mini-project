import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Trophy, Calendar, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { reportApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function Reports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLatestReport = async () => {
      try {
        const response = await reportApi.getLatestReport();
        const data = response.data.data;
        setReport(data);
      } catch (error: any) {
        toast({
          title: "Failed to load report",
          description: error.response?.data?.message || "Could not fetch latest report",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestReport();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Report Available</h2>
              <p className="text-muted-foreground">
                Complete Idea Evaluation and Repository Analysis to generate your report.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const matchColor = report.ideaRepoMatch.matchScore >= 70 ? "text-green-500" : 
                     report.ideaRepoMatch.matchScore >= 50 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="animate-fade-in">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Unified <span className="bg-gradient-primary bg-clip-text text-transparent">Evaluation Report</span>
                </h1>
                <p className="text-muted-foreground text-lg">Latest Idea + Repository Analysis</p>
              </div>
              <Button className="gradient-primary" onClick={() => window.print()}>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(report.generatedAt).toLocaleDateString()}
              </div>
              <Badge variant={report.ideaRepoMatch.matched ? "default" : "destructive"}>
                {report.ideaRepoMatch.matched ? "✓ Match Verified" : "✗ Mismatch Detected"}
              </Badge>
            </div>
          </div>

          {/* Overall Score Card */}
          <Card className="border-2 border-primary animate-scale-in">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="inline-flex p-4 rounded-full bg-gradient-primary mb-4">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-4">Overall Score</h2>
                  <div className="text-8xl font-bold text-primary mb-2">
                    {report.scores.overallScore}
                  </div>
                  <p className="text-muted-foreground text-lg">out of 10.0</p>
                </div>
                
                <div className="flex flex-col justify-center space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Idea Score</span>
                    <span className="text-2xl font-bold">{report.scores.ideaScore}/10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Repository Score</span>
                    <span className="text-2xl font-bold">{report.scores.repoScore}/10</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="text-sm font-medium">Match Score</span>
                    <span className={`text-2xl font-bold ${matchColor}`}>
                      {report.ideaRepoMatch.matchScore}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Idea-Repo Matching Analysis */}
          <Card className="animate-scale-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {report.ideaRepoMatch.matched ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Idea-Repository Match Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-muted-foreground">{report.ideaRepoMatch.matchSummary}</p>
              </div>

              {report.ideaRepoMatch.alignments.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-green-600">✓ Alignments</h3>
                  <ul className="space-y-2">
                    {report.ideaRepoMatch.alignments.map((item, index) => (
                      <li key={index} className="flex gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.ideaRepoMatch.discrepancies.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-red-600">✗ Discrepancies</h3>
                  <ul className="space-y-2">
                    {report.ideaRepoMatch.discrepancies.map((item, index) => (
                      <li key={index} className="flex gap-2 text-sm">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Executive Summary */}
          <Card className="animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{report.executiveSummary}</p>
            </CardContent>
          </Card>

          {/* Strengths & Weaknesses */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="animate-scale-in" style={{ animationDelay: "0.3s" }}>
              <CardHeader>
                <CardTitle className="text-green-600">Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.strengths.map((item, index) => (
                    <li key={index} className="flex gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="animate-scale-in" style={{ animationDelay: "0.4s" }}>
              <CardHeader>
                <CardTitle className="text-red-600">Weaknesses</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.weaknesses.map((item, index) => (
                    <li key={index} className="flex gap-2 text-sm">
                      <span className="text-red-500">✗</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="animate-scale-in" style={{ animationDelay: "0.5s" }}>
            <CardHeader>
              <CardTitle>Recommendations for Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.recommendations.map((item, index) => (
                  <li key={index} className="flex gap-2 text-sm">
                    <span className="text-primary">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Final Verdict */}
          <Card className="border-2 border-primary animate-scale-in" style={{ animationDelay: "0.6s" }}>
            <CardHeader>
              <CardTitle>Final Verdict</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{report.finalVerdict}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
