import { getActivity, getListComments } from "@/api/apiClient";
import { YouTubeActivity } from "@/components/activity";
import CommentList, { YouTubeComment } from "@/components/comment";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-separator";
import {
  Bookmark,
  Eye,
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
  Youtube,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const CommentPage = () => {
  const [comments, setComment] = useState<
    YouTubeComment[] | null | undefined
  >();
  const [activity, setActivity] = useState<
    YouTubeActivity | null | undefined
  >();
  const { id } = useParams();
  useEffect(() => {
    const fetchData = async () => {
      if (id && !comments && !activity) {
        const [activitiesData, commentsData] = await Promise.all([
          getActivity(id),
          getListComments(id),
        ]);
        setComment(commentsData);
        setActivity(activitiesData);
      }
    };

    fetchData();
  }, [comments, id, activity]);

  const formatCount = (count: string) => {
    const num = parseInt(count, 10);
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };
  function StatisticField({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
  }) {
    return (
      <div className="flex items-center space-x-2">
        {icon}
        <div className="flex flex-col">
          <span className="text-sm font-medium">{value}</span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      </div>
    );
  }
  if (comments === undefined || comments === null) return <div>Loading...</div>;

  return (
    <div className="flex flex-wrap gap-4 items-center justify-center p-4 h-[100vh] bg-slate-100">
      {activity ? (
        <Card className="w-full max-w-lg h-full">
          <CardContent className="space-y-4 ">
            <div className="container mx-auto py-8">
              <h1 className="text-3xl font-bold mb-6">
                {activity?.snippet.title}
              </h1>
              <div className="text-muted-foreground text-center flex justify-center">
                <img
                  className="w-full aspect-auto"
                  src={activity?.snippet.thumbnails.default.url}
                  alt=""
                />
              </div>
              <div className="py-4">
                <Card className="w-full">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <StatisticField
                        icon={<Eye className="w-4 h-4" />}
                        label="Views"
                        value={formatCount(activity.statistics.viewCount)}
                      />
                      <Separator
                        orientation="vertical"
                        className="h-8 hidden sm:block"
                      />
                      <StatisticField
                        icon={<ThumbsUp className="w-4 h-4" />}
                        label="Likes"
                        value={formatCount(activity.statistics.likeCount)}
                      />
                      <Separator
                        orientation="vertical"
                        className="h-8 hidden sm:block"
                      />
                      <StatisticField
                        icon={<ThumbsDown className="w-4 h-4" />}
                        label="Dislikes"
                        value={formatCount(activity.statistics.dislikeCount)}
                      />
                      <Separator
                        orientation="vertical"
                        className="h-8 hidden sm:block"
                      />
                      <StatisticField
                        icon={<Bookmark className="w-4 h-4" />}
                        label="Favorites"
                        value={formatCount(activity.statistics.favoriteCount)}
                      />
                      <Separator
                        orientation="vertical"
                        className="h-8 hidden sm:block"
                      />
                      <StatisticField
                        icon={<MessageSquare className="w-4 h-4" />}
                        label="Comments"
                        value={formatCount(activity.statistics.commentCount)}
                      />
                    </div>
                  </CardContent>
                </Card>
                <div className="flex justify-start items-center mt-2">
                  <Button
                    onClick={() =>
                      window.open(`https://youtu.be/${id}`, "_blank")
                    }
                  >
                    <Youtube size={24} />
                    Watch Video
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>Loading...</div>
      )}
      <Card className="w-full max-w-lg h-full">
        <CardContent className="space-y-4 ">
          <CommentList comments={comments} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CommentPage;
