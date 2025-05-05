
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function useAuthRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      // Auth routes should redirect to dashboard if already logged in
      if (data.session && (location.pathname === '/login' || location.pathname === '/register')) {
        navigate('/');
      }
    };
    
    checkAuth();
  }, [navigate, location.pathname]);
}
