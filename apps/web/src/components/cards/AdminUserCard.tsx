import { Link } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardTitle, CardHeader } from "../ui/card";
import { PublicUserProfileExtended } from "@template/core-types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "../../server/utils";

// Enhanced user card for admin view
const AdminUserCard = ({ user }: { user: PublicUserProfileExtended }) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted p-4 flex flex-row items-center space-x-4">
        <Avatar className="h-16 w-16 border-2 border-background">
          <AvatarImage src={user.imageUrl} alt={`${user.firstName} ${user.lastName}`} />
          <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Link href={`/profile/${user.clerkUserId}`} className="hover:underline">
            <CardTitle className="text-lg">{user.firstName} {user.lastName}</CardTitle>
          </Link>
          <p className="text-sm text-muted-foreground">{user.headline || 'No headline'}</p>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold mb-1">Location</h4>
            <p className="text-sm text-foreground">
              {user.location ? (
                `${user.location.city || ''} ${user.location.state || ''} ${user.location.country || ''}`
              ) : (
                'Not specified'
              )}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-1">Connections</h4>
            <p className="text-sm text-foreground">
              {user.connections ? `${user.connections.length} connections` : '0 connections'}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted p-3 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          Registered User
        </span>
        <Button size="sm" variant="outline" asChild>
          <Link href={`/profile/${user.clerkUserId}`}>
            View Profile
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdminUserCard;