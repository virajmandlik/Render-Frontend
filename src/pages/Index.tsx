
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, CheckCircle, Clock, Search } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
      {/* Hero Section */}
      <div className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
            Student Job Tracker
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-muted-foreground">
            Track your job applications, manage your career path, and land your dream job with our all-in-one platform.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button 
              size="lg" 
              className="w-full sm:w-auto"
              onClick={() => navigate("/register")}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto"
              onClick={() => navigate("/login")}
            >
              Log In
            </Button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-12 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary">
              Everything You Need to Manage Your Job Search
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Streamline your job application process and increase your chances of landing the perfect role.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-card rounded-lg p-6 shadow-sm border border-border animate-fade-in">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-foreground">Track Applications</h3>
                <p className="mt-2 text-muted-foreground">
                  Keep all your job applications in one place with details about company, role, and status.
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 shadow-sm border border-border animate-fade-in delay-150">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-foreground">Never Miss a Deadline</h3>
                <p className="mt-2 text-muted-foreground">
                  Track application dates and interview schedules to stay on top of your job search timeline.
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 shadow-sm border border-border animate-fade-in delay-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-foreground">Powerful Insights</h3>
                <p className="mt-2 text-muted-foreground">
                  Filter and analyze your application data to optimize your job search strategy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold">Ready to Organize Your Job Search?</h2>
          <p className="mt-4 text-lg opacity-90">
            Join thousands of students who have streamlined their job hunt process.
          </p>
          <div className="mt-8">
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => navigate("/register")}
            >
              Create Free Account
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted/60 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start">
              <span className="font-bold text-primary text-lg">StudentJobTracker</span>
            </div>
            <div className="mt-8 flex justify-center md:mt-0">
              <div className="flex space-x-6">
                <Link to="/login" className="text-muted-foreground hover:text-foreground">
                  Login
                </Link>
                <Link to="/register" className="text-muted-foreground hover:text-foreground">
                  Register
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 md:flex md:items-center md:justify-between">
            <div className="text-sm text-center text-muted-foreground">
              © {new Date().getFullYear()} Student Job Tracker. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
