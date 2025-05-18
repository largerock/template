'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { UserButton } from '@clerk/nextjs';
import { KeyIcon } from '@heroicons/react/24/outline';
import { CreditCardIcon, UserIcon } from 'lucide-react';
import CONFIG from '@template/global-config';
import { useAppState } from 'src/states/useAppInitState';
import { useProfileState } from 'src/states/useUserProfileState';

export const ClerkUserButtonWithPages = () => {
  const currentEnv = process.env.NEXT_PUBLIC_ENVIRONMENT;
  const router = useRouter();
  const { decoded, token } = useAppState();
  const { profile } = useProfileState();

  return (
    <div>
      <UserButton>
        <UserButton.MenuItems>
          <UserButton.Action
            label="My Profile"
            labelIcon={<UserIcon className="w-4 h-4" />}
            onClick={() => router.push(`/profile/${profile?.clerkUserId}`)}
          />
          <UserButton.Action
            label="Billing"
            labelIcon={<CreditCardIcon className="w-4 h-4" />}
            onClick={() => router.push(`/billing-plan`)}
          />
        </UserButton.MenuItems>
        {(currentEnv === 'local' || currentEnv === 'development') && (
          <UserButton.UserProfilePage label="JWT Token" labelIcon={<KeyIcon className="w-4 h-4" />} url="jwt-token">
            <div className="p-4 bg-background text-foreground">
              <h2 className="text-lg font-semibold mb-4 text-foreground">JWT Token</h2>
              <p className="text-sm text-muted-foreground mb-4">
                This token is used to authenticate requests to the API. It is valid for 1 hour.
                Only available in development mode.
              </p>
              <pre className="text-xs overflow-auto mt-2 p-2 rounded border border-border bg-card/50">
                <div className="flex items-center gap-2 text-foreground">
                  <span>{token ? token.substring(0, 50) + '...' : 'No token'}</span>
                  {token && (
                    <button
                      onClick={() => navigator.clipboard.writeText(token)}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy token"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  )}
                </div>
              </pre>
              <div className="mt-2 text-sm">
                <a
                  href={`${CONFIG[currentEnv].API_URL}api-docs`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  View API Documentation →
                </a>
              </div>

              {token && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2 text-foreground">Decoded Token:</h3>
                  <pre className="text-xs overflow-auto p-2 rounded border border-border bg-card/50 text-foreground">
                    {JSON.stringify(decoded, undefined, 2)}
                  </pre>
                </div>
              )}
            </div>
          </UserButton.UserProfilePage>
        )}
      </UserButton>
    </div>
  );
};