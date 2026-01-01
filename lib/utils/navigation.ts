import { router } from 'expo-router';

/**
 * Safe navigation helper that ensures router is ready before navigating
 * Uses requestAnimationFrame and setTimeout to ensure router is initialized
 */
export const safeNavigate = (path: string, delay = 0) => {
  const navigate = () => {
    try {
      router.replace(path as any);
    } catch (error) {
      // Router might not be ready, retry after a short delay
      setTimeout(() => {
        try {
          router.replace(path as any);
        } catch (retryError) {
          // Final retry after longer delay
          setTimeout(() => {
            try {
              router.replace(path as any);
            } catch (finalError) {
              console.error('Navigation failed after retries:', finalError);
            }
          }, 200);
        }
      }, 100);
    }
  };

  if (delay > 0) {
    setTimeout(() => {
      requestAnimationFrame(navigate);
    }, delay);
  } else {
    // Use requestAnimationFrame to ensure router is ready
    requestAnimationFrame(navigate);
  }
};

export const safePush = (path: string) => {
  const push = () => {
    try {
      router.push(path as any);
    } catch (error) {
      // Router might not be ready, retry after a short delay
      setTimeout(() => {
        try {
          router.push(path as any);
        } catch (retryError) {
          // Final retry after longer delay
          setTimeout(() => {
            try {
              router.push(path as any);
            } catch (finalError) {
              console.error('Navigation failed after retries:', finalError);
            }
          }, 200);
        }
      }, 100);
    }
  };

  requestAnimationFrame(push);
};

