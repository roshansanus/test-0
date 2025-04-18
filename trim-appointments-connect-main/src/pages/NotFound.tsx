
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <h1 className="text-9xl font-bold text-salon-primary">404</h1>
        <h2 className="text-3xl md:text-4xl font-semibold mt-6 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="bg-salon-primary hover:bg-salon-secondary">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    </Layout>
  );
};

export default NotFound;
