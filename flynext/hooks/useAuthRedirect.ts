import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/contexts/UserContext';

/**
 * Hook to handle authentication check and redirect
 * @param redirectPath - The path to redirect to after successful login
 */
export function useAuthRedirect(redirectPath: string) {
  const router = useRouter();
  const { isAuthenticated, isLoading, fetchWithAuth } = useUserContext();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store the current page URL to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', redirectPath);
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, redirectPath, router]);

  return {
    isAuthenticated,
    isLoading,
    fetchWithAuth
  };
}