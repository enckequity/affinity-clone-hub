
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setIsLoading(true);
        
        // Get the session from the URL
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error retrieving auth session:', error.message);
          toast({
            title: 'Authentication Error',
            description: error.message,
            variant: 'destructive',
          });
          navigate('/login', { replace: true });
          return;
        }

        if (!data.session) {
          console.warn('No session found');
          toast({
            title: 'Authentication Error',
            description: 'No session found. Please try logging in again.',
            variant: 'destructive',
          });
          navigate('/login', { replace: true });
          return;
        }

        console.log('Authentication successful, redirecting to dashboard');
        
        // Redirect to the main app
        navigate('/', { replace: true });
      } catch (error: any) {
        console.error('Unexpected error during auth callback:', error);
        toast({
          title: 'Authentication Error',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
        navigate('/login', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {isLoading ? (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg">Completing authentication...</p>
        </>
      ) : (
        <p className="text-lg">Redirecting you...</p>
      )}
    </div>
  );
}
