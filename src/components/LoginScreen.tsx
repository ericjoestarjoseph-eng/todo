import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import { PokeballIcon, StickerBadge } from './PokemonSprites';
import { RoamingPokemon } from './RoamingPokemon';

export function LoginScreen() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error: unknown) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String((error as { code?: unknown }).code)
          : '';
      if (code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in popup was closed before completing. Please try again.');
      } else if (code === 'auth/popup-blocked') {
        setErrorMessage('Popup was blocked by your browser. Please allow popups and try again.');
      } else {
        setErrorMessage('Unable to sign in right now. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="bg-trainer-grid flex min-h-screen flex-col text-slate-900">
      <div className="h-2 w-full bg-gradient-to-r from-red-600 via-red-500 to-amber-400" />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          <div className="absolute -left-3 -top-3">
            <StickerBadge type="pikachu-face" rotate={-12} title="Pikachu" />
          </div>
          <div className="absolute -right-3 -top-3">
            <StickerBadge type="greatball" rotate={12} title="Great Ball" />
          </div>
          <div className="absolute -bottom-3 -left-3 hidden sm:block">
            <StickerBadge type="bulbasaur-face" rotate={-8} title="Bulbasaur" />
          </div>
          <div className="absolute -bottom-3 -right-3 hidden sm:block">
            <StickerBadge type="charmander-face" rotate={10} title="Charmander" />
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-red-50">
              <PokeballIcon caught={true} className="h-9 w-9" />
            </div>

            <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              My Todo List
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
              Sign in with your Google account to save your trainer tasks, track progress,
              and pick up right where you left off.
            </p>
          </div>

          <div className="mt-6">
            <RoamingPokemon />
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="inline-flex min-h-[46px] w-full items-center justify-center gap-3 whitespace-nowrap rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-2xs transition-colors duration-150 hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.54-.21-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.08 3.56-5.15 3.56-8.65Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.87-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.95H1.28v3.1A12 12 0 0 0 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.3A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.57.38-2.3V6.6H1.28a12 12 0 0 0 0 10.8l4-3.1Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.6l4 3.1C6.23 6.86 8.88 4.75 12 4.75Z"
                />
              </svg>
              <span>{isSigningIn ? 'Signing in...' : 'Sign in with Google'}</span>
            </button>

            {errorMessage && (
              <p
                role="alert"
                className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-center text-xs font-medium text-red-700"
              >
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
