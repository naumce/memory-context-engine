import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCitizenAuth } from "@/hooks/useCitizenAuth";
import CitizenNavbar from "./CitizenNavbar";
import { Skeleton } from "@/components/ui/skeleton";

interface CitizenLayoutProps {
  children: React.ReactNode;
}

const CitizenLayout = ({ children }: CitizenLayoutProps) => {
  const { user, loading } = useCitizenAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/citizen/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <CitizenNavbar />
      <main className="pt-16 pb-20 px-4 container mx-auto max-w-2xl">
        {children}
      </main>
    </div>
  );
};

export default CitizenLayout;
