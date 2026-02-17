import { useEffect, useState } from 'react';

const ERROR_MESSAGES: Record<string, string> = {
  missing_code: 'Sign-in was cancelled or invalid.',
  server_config: 'Server is not configured for Google sign-in.',
  no_email: 'Google did not provide an email.',
  userinfo_failed: 'Could not load your Google profile.',
  callback_failed: 'Sign-in failed. Please try again.',
};

/**
 * Reads the `error` query parameter from the URL (if present) and maps it to a
 * human-readable error message. The query param is cleared after first read so
 * re-renders don't keep showing the same error.
 */
export function useSignInError(): string | null {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get('error');
    if (!errorCode) return;

    const message = ERROR_MESSAGES[errorCode] ?? 'Something went wrong.';
    setErrorMessage(message);

    // Remove error from URL so it does not persist across navigation.
    window.history.replaceState({}, '', window.location.pathname);
  }, []);

  return errorMessage;
}

