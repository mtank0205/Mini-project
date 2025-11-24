import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  FileCode, 
  Save, 
  Sparkles, 
  Users, 
  MessageSquare,
  ChevronRight,
  FolderTree
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { evaluationApi } from "@/lib/api";
import * as socketService from "@/lib/socket";

export default function CodeEditor() {
  const { roomId } = useParams();
  const [code, setCode] = useState(`// Welcome to HackSim Collaborative Editor
// Room ID: ${roomId}

function greet(name) {
  return \`Hello, \${name}! Let's build something amazing!\`;
}

console.log(greet("Hackathon Team"));`);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ user: string; text: string; time: string }>>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Initialize Socket.io and join room
  useEffect(() => {
    if (roomId) {
      socketService.initSocket();
      socketService.joinRoom(roomId);

      // Listen for code updates from other users
      socketService.onCodeUpdate((data) => {
        if (data.fileName === "index.tsx") {
          setCode(data.code);
        }
      });

      // Listen for chat messages
      socketService.onReceiveMessage((data) => {
        setMessages((prev) => [...prev, data]);
      });

      return () => {
        socketService.disconnectSocket();
      };
    }
  }, [roomId]);

  // Emit code changes to other users
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (roomId) {
      socketService.emitCodeChange(roomId, "index.tsx", newCode);
    }
  };

  const files = [
    { name: "index.tsx", folder: "src", active: true },
    { name: "App.tsx", folder: "src", active: false },
    { name: "utils.ts", folder: "src/lib", active: false },
    { name: "styles.css", folder: "src", active: false },
  ];

  const connectedUsers = [
    { name: "John Doe", color: "bg-primary" },
    { name: "Jane Smith", color: "bg-secondary" },
    { name: "Bob Johnson", color: "bg-accent" },
  ];

  const handleSave = () => {
    toast({
      title: "Code saved",
      description: "Your changes have been saved successfully",
    });
  };

  const handleEvaluate = async () => {
    if (!roomId) return;
    
    try {
      toast({
        title: "Evaluating code...",
        description: "AI is analyzing your code quality",
      });

      const response = await evaluationApi.evaluateCode({
        roomId,
        code,
        fileName: "index.tsx",
        language: "typescript",
      });

      const data = response.data.data || response.data;
      const avgScore = data.scores?.average ? Math.round(parseFloat(data.scores.average) * 10) : 'N/A';
      toast({
        title: "Evaluation Complete!",
        description: `Code Score: ${avgScore}/100`,
      });
    } catch (error: any) {
      toast({
        title: "Evaluation Failed",
        description: error.response?.data?.message || "Failed to evaluate code",
        variant: "destructive",
      });
    }
  };

  const sendMessage = () => {
    if (message.trim() && roomId && user) {
      socketService.sendMessage(roomId, message, user.username || user.email);
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={user} />
      
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">Room: {roomId}</h2>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Collaborative Coding Session</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="flex -space-x-2">
                  {connectedUsers.map((user, index) => (
                    <div
                      key={index}
                      className={`h-8 w-8 rounded-full ${user.color} flex items-center justify-center text-white text-xs font-semibold border-2 border-background`}
                      title={user.name}
                    >
                      {user.name.charAt(0)}
                    </div>
                  ))}
                </div>
              </div>
              
              <Button variant="outline" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              
              <Button className="gradient-primary" onClick={handleEvaluate}>
                <Sparkles className="mr-2 h-4 w-4" />
                Evaluate Code
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Tree Sidebar */}
        <div className="w-64 border-r bg-card p-4 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold">
            <FolderTree className="h-4 w-4" />
            Files
          </div>
          <div className="space-y-1">
            {files.map((file, index) => (
              <button
                key={index}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                  file.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <FileCode className="h-4 w-4" />
                <div className="flex-1 truncate">
                  <div className="font-medium">{file.name}</div>
                  <div className="text-xs opacity-70">{file.folder}</div>
                </div>
                {file.active && <ChevronRight className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 flex flex-col bg-muted/20">
          <div className="border-b bg-card px-4 py-2 flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            <span className="text-sm font-medium">index.tsx</span>
          </div>
          <div className="flex-1 p-4">
            <Textarea
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="w-full h-full font-mono text-sm resize-none"
              placeholder="Start coding..."
            />
          </div>
        </div>

        {/* Chat Panel */}
        <div className="w-80 border-l bg-card flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 font-semibold">
              <MessageSquare className="h-4 w-4" />
              Team Chat
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{msg.user}</span>
                  <span className="text-xs text-muted-foreground">{msg.time}</span>
                </div>
                <p className="text-sm bg-muted p-2 rounded-lg">{msg.text}</p>
              </div>
            ))}
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="resize-none"
                rows={2}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
