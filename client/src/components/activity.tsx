"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

export interface YouTubeActivity {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: {
      default: {
        url: string;
      };
    };
  };
  contentDetails: {
    upload: {
      videoId: string;
    };
  };
  statistics: any;
}

interface YouTubeActivityListProps {
  activities: YouTubeActivity[] | null | undefined;
}

export function YouTubeActivityList({ activities }: YouTubeActivityListProps) {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const viewComments = async (videoId: string) => {
    navigate(`/comment/${videoId}`);
  };

  if (activities === undefined || activities === null) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Activities</CardTitle>
          <CardDescription>
            There are no activities to display at this time.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id}>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={activity.snippet.thumbnails.default.url}
                  alt={activity.snippet.title}
                />
                <AvatarFallback>
                  {activity.snippet.title.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-lg">
                  {activity.snippet.title}
                </CardTitle>
                <CardDescription>
                  {formatDate(activity.snippet.publishedAt)}
                </CardDescription>
              </div>
              <div className="flex items-center">
                {activity.contentDetails.upload && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      viewComments(activity.contentDetails.upload.videoId);
                    }}
                  >
                    View Detail
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
