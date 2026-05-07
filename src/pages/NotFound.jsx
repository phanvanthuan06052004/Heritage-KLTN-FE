import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";

import { Button } from "~/components/common/ui/Button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User accessed non-existent path:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="text-center animate-fade-in space-y-6 max-w-md">
        {/* Large 404 */}
        <h1 className="text-9xl font-extrabold text-heritage/20 select-none">
          404
        </h1>

        {/* Icon */}
        <div className="w-24 h-24 rounded-full bg-heritage-light/50 flex items-center justify-center mx-auto">
          <ArrowLeft className="w-12 h-12 text-heritage" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground">
            Oops! The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action */}
        <Link to="/" className="inline-block">
          <Button size="lg">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
