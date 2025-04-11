
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Loader2, User } from "lucide-react";

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { jobs } = useJobs();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Statistics for dashboard
  const totalApplications = jobs.length;
  const activeApplications = jobs.filter(
    job => job.status === "Applied" || job.status === "Interview"
  ).length;
  const successRate = totalApplications 
    ? Math.round((jobs.filter(job => job.status === "Offer").length / totalApplications) * 100) 
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await updateProfile({
        name,
        email,
        profilePicture
      });
      setIsEditing(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred while updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          View and manage your profile settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 md:col-span-2 lg:row-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              View and update your account details
            </CardDescription>
            <Button
              variant="outline"
              size="sm"
              className="absolute right-4 top-4"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            
            {!isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={user?.profilePicture} alt={user?.name || ""} />
                    <AvatarFallback className="text-4xl">
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="rounded-md border px-4 py-3">
                    {user?.name}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="rounded-md border px-4 py-3">
                    {user?.email}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-center">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={profilePicture} alt={name} />
                    <AvatarFallback className="text-4xl">
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="profilePicture">Profile Picture URL</Label>
                  <Input
                    id="profilePicture"
                    value={profilePicture}
                    onChange={(e) => setProfilePicture(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a URL for your profile picture
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                Jobs you've applied to
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Active Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeApplications}</div>
              <p className="text-xs text-muted-foreground">
                Applied or interviewing
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successRate}%</div>
              <p className="text-xs text-muted-foreground">
                Offers received
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
