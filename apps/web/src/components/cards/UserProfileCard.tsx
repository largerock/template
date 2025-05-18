'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PublicUserProfileExtended } from '@template/core-types';
import {
  EyeIcon,
  MapPinIcon,
  UsersIcon,
  ClockIcon
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '../../server/utils';

type UserProfileCardProps = {
  profile: PublicUserProfileExtended;
  showConnectionCounts?: boolean;
  connectionCount?: number;
  pendingConnections?: number;
}

export function UserProfileCard({
  profile,
  showConnectionCounts = false,
  connectionCount = 0,
  pendingConnections = 0,
}: UserProfileCardProps) {
  const city = profile.location?.city || '';
  const country = profile.location?.country || '';
  const jobTitleName = profile.headline || '';

  return (
    <div key={profile.clerkUserId}>
      <Card>
        <CardHeader className="pb-0 pt-6 px-6">
          <div className="flex items-start space-x-4">
            <div className="relative h-24 w-24 flex-shrink-0">
              <Image
                src={profile.imageUrl || '/default-avatar.png'}
                alt={`${profile.firstName} ${profile.lastName}`}
                fill
                className="rounded-full object-cover"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-card-foreground">
                  {profile.firstName} {profile.lastName}
                </h2>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    aria-label="View profile details"
                  >
                    <Link
                      href={`/profile/${profile.clerkUserId}`}
                      scroll={false}
                    >
                      <EyeIcon className="size-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 pt-4">
          <div className="ml-28">
            <div className="text-card-foreground">
              {jobTitleName && (
                <p className="font-medium">{jobTitleName}</p>
              )}
            </div>

            {(city || country) && (
              <div className="mt-2 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <MapPinIcon className="size-4 mr-1" />
                  {city}
                  {country && `, ${country}`}
                </span>
              </div>
            )}
          </div>
        </CardContent>

        {showConnectionCounts && (
          <CardFooter className="px-6 pt-2 border-t border-border mt-4">
            <div className="flex space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <UsersIcon className="size-4 mr-1" />
                {connectionCount} connections
              </span>
              {pendingConnections > 0 && (
                <span className={cn(
                  "flex items-center",
                  "text-yellow-600 dark:text-yellow-400"
                )}>
                  <ClockIcon className="size-4 mr-1" />
                  {pendingConnections} pending
                </span>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
