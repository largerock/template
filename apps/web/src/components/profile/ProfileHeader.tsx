import { UserProfileExtended } from "@template/core-types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {  DollarSign, Calendar } from "lucide-react";
import { getInitials } from "../../server/utils";

interface ProfileHeaderProps {
  profile: UserProfileExtended;
}

const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  return (
    <div className="bg-card dark:bg-card rounded-lg shadow-md overflow-hidden">
      {/* Cover photo */}
      <div className="h-32 bg-gradient-to-r from-[#0A66C2] to-[#0D9488]" />

      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Avatar section */}
          <div className="relative -mt-16">
            <Avatar className="h-24 w-24 border-4 border-card shadow-md">
              <AvatarImage src={profile?.imageUrl} alt={profile?.firstName} />
              <AvatarFallback className="text-2xl bg-professional-primary/10 text-professional-primary">{getInitials(profile?.firstName || "", profile?.lastName || "")}</AvatarFallback>
            </Avatar>
          </div>

          {/* Profile info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-professional-secondary dark:text-professional-light">{profile?.firstName} {profile?.lastName}</h1>
                {profile && (
                  <>
                    <p className="text-professional-muted">{profile.headline}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {profile.rate && (
                        <div className="flex items-center text-sm text-primary">
                          <DollarSign className="h-3.5 w-3.5 mr-1" />
                          <span>{profile.rate}/hr</span>
                        </div>
                      )}
                      {profile.availability && (
                        <div className="flex items-center text-sm text-primary">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          <span>{profile.availability.replace('_', ' ')}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {profile && (
              <>
                <p className="text-professional-secondary dark:text-professional-light mb-4">{profile.bio}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20"
                    >
                      {interest.name}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-professional-muted">
                  {profile.location && (
                    <div>
                      <span className="font-medium text-professional-secondary dark:text-professional-light">Location:</span> {profile.location.formattedAddress}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
