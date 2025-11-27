import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code2, LogOut, User, Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, User as AuthUser } from "@/lib/auth";
import { useTheme } from "@/components/theme-provider";

interface NavbarProps {
  user?: AuthUser | null;
}

export const Navbar = ({ user: propUser }: NavbarProps) => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  // Use auth context user if no prop user provided
  const user = propUser || authUser;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
          <div className="p-2 rounded-lg gradient-primary">
            <Code2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
            HackSim
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="flex-col items-start">
                    <div className="font-medium">{user?.username || user?.name || user?.email}</div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup">
                <Button className="gradient-primary">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
