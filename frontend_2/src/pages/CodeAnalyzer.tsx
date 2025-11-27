import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Code2,
  Sparkles,
  FileCode,
  Lightbulb,
  AlertTriangle,
  Info
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { evaluationApi } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function CodeAnalyzer() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast({
        title: "Code Required",
        description: "Please enter some code to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await evaluationApi.evaluateCode({
        roomId: `analysis-${Date.now()}`,
        code,
        fileName: "code.txt",
        language: "auto-detect",
      });

      const data = response.data.data || response.data;
      setAnalysis(data);

      toast({
        title: "Analysis Complete!",
        description: "Your code has been analyzed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: error.response?.data?.message || "Failed to analyze code",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    if (score >= 4) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return "bg-green-50 border-green-200";
    if (score >= 6) return "bg-yellow-50 border-yellow-200";
    if (score >= 4) return "bg-orange-50 border-orange-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl gradient-primary">
                <Code2 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold">
                <span className="gradient-primary bg-clip-text text-transparent">Code Analyzer</span>
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Get AI-powered feedback on your code quality, security, performance, and best practices
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Code Input Section */}
            <Card className="animate-scale-in lg:h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="h-5 w-5" />
                  Submit Your Code
                </CardTitle>
                <CardDescription>
                  Paste your code below for comprehensive AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Textarea
                    id="code"
                    placeholder="Paste your code here...

The AI will automatically detect the programming language and provide a harsh, honest review of your code quality."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="font-mono text-sm min-h-[400px]"
                  />
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full gradient-primary"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Analyze Code
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Results Section */}
            <Card className="animate-scale-in" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Analysis Results
                </CardTitle>
                <CardDescription>
                  AI-powered insights and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!analysis ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 rounded-full bg-muted mb-4">
                      <Code2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      Submit your code to see detailed analysis
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">


                    {/* Overall Score */}
                    <div className="p-6 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">Overall Code Score</p>
                        <p className={`text-5xl font-bold mb-2 ${getScoreColor(Math.round(parseFloat(analysis.average || 0) * 10))}`}>
                          {Math.round(parseFloat(analysis.average || 0) * 10)}/100
                        </p>
                        <Badge variant="secondary" className="mt-2">
                          {analysis.detectedLanguage || "Code"}
                        </Badge>
                      </div>
                    </div>

                    {/* Summary Description */}
                    {analysis.summary && (
                      <div className="p-4 rounded-lg bg-muted border">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Analysis Summary
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {analysis.summary}
                        </p>
                      </div>
                    )}

                    {/* Code Improvements */}
                    {analysis.suggestions && analysis.suggestions.length > 0 && (
                      <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                        <h3 className="font-semibold mb-3 flex items-center gap-2 text-yellow-900">
                          <Lightbulb className="h-5 w-5 text-yellow-600" />
                          Code Improvements
                        </h3>
                        <ul className="space-y-2">
                          {analysis.suggestions.map((suggestion: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-yellow-900">
                              <span className="font-semibold mt-0.5">{index + 1}.</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
