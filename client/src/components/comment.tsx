import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2, Trash2 } from "lucide-react";
import {
  addComment,
  addReply,
  deleteComment,
  getChannel,
  getCommentReplies,
  getListComments,
} from "@/api/apiClient";
import { useParams } from "react-router-dom";

export interface YouTubeComment {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    channelId: string;
    videoId: string;
    topLevelComment: {
      kind: string;
      etag: string;
      id: string;
      snippet: {
        channelId: string;
        videoId: string;
        textDisplay: string;
        textOriginal: string;
        authorDisplayName: string;
        authorProfileImageUrl: string;
        authorChannelUrl: string;
        authorChannelId: {
          value: string;
        };
        canRate: boolean;
        viewerRating: string;
        likeCount: number;
        publishedAt: string;
        updatedAt: string;
      };
    };
    canReply: boolean;
    totalReplyCount: number;
    isPublic: boolean;
    replies?: any;
  };
}

export default function CommentList({ comments }: any) {
  const { id } = useParams();
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [isLoading, setLoading] = useState<boolean>(false);
  const [replying, setReplying] = useState<any>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [localComments, setLocalComments] = useState([...comments.items]);
  const [pageToken, setPageToken] = useState<string | null>(
    comments.nextPageToken
  );
  const [channel, setChannel] = useState<any>();

  useEffect(() => {
    const fetchData = async () => {
      if (!channel) {
        const data = await getChannel();
        if (data) setChannel(data);
      }
    };
    fetchData();
  }, [channel]);

  const loadMore = async () => {
    const res = await getListComments(id || "", { pageToken });
    setLocalComments([...localComments, ...res.items]);
    if (res.nextPageToken) {
      setPageToken(res.nextPageToken);
    } else setPageToken("");
    console.log(pageToken);
  };
  const toggleComment = async (commentId: string) => {
    const cmt = localComments?.find((c) => c.id === commentId);

    if (cmt && !cmt.snippet.replies) {
      const res = await getCommentReplies(commentId, { pageToken });
      cmt.snippet.replies = res.items;
    }
    setExpandedComments((prev) =>
      prev.includes(commentId)
        ? prev.filter((id) => id !== commentId)
        : [...prev, commentId]
    );
  };

  const addNewComment = async () => {
    setLoading(true);
    if (replying) {
      setNewComment(`${replying.snippet.authorDisplayName} `);
      const res = (await addReply(replying.id, newComment)) as YouTubeComment;
      const comment = localComments?.find((c) => c.id === replying.id);
      if (comment) {
        comment.snippet.totalReplyCount++;
        comment.snippet.replies?.unshift(res);
      }
    } else {
      const res = (await addComment(id || "", newComment)) as YouTubeComment;
      localComments?.unshift(res);
    }
    setLoading(false);
    setNewComment("");
    setReplying(null);
  };

  const addNewReply = (reply: any) => {
    setReplying(reply);
    setNewComment(`${reply.snippet.authorDisplayName} `);
    textRef.current?.focus();
  };

  const removeComment = async (id: string, isReply?: string) => {
    await deleteComment(id);
    if (isReply) {
      const find = localComments.find((c) => c.id === isReply);
      if (find) {
        find.snippet.totalReplyCount--;
        const newReplies = find.snippet.replies?.filter(
          (c: any) => c.id !== id
        );
        find.snippet.replies = [...newReplies];
      }
    }
    const ownListComment = localComments?.filter((c) => c.id !== id);
    setLocalComments([...ownListComment]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!localComments || localComments.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4">
        No comment available for this video.
      </p>
    );
  }

  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold mb-6">
        Comments ({localComments.length})
      </h2>
      <div className="overflow-auto max-h-[80vh] p-2">
        <div className="mb-6">
          <textarea
            className="w-full p-2 border rounded resize-none"
            placeholder="Add a comment..."
            value={newComment}
            ref={textRef}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button
            disabled={isLoading}
            className="mt-2"
            onClick={() => addNewComment()}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Submit"}
          </Button>
        </div>
        {localComments.map((comment) => (
          <Card key={comment.id} className="my-4">
            <CardHeader className="space-x-1">
              <div className="flex flex-wrap items-start space-x-2">
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={
                      comment.snippet.topLevelComment.snippet
                        .authorProfileImageUrl
                    }
                    alt={
                      comment.snippet.topLevelComment.snippet.authorDisplayName
                    }
                  />
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {
                        comment.snippet.topLevelComment.snippet
                          .authorDisplayName
                      }
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(
                        comment.snippet.topLevelComment.snippet.publishedAt
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {comment.snippet.topLevelComment.snippet.textDisplay}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 text-sm">
                {comment.snippet.totalReplyCount ? (
                  <div className="flex flex-grow">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1"
                      onClick={() => toggleComment(comment.id)}
                      disabled={!comment.snippet.totalReplyCount}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{comment.snippet.totalReplyCount} replies</span>
                    </Button>
                  </div>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => addNewReply(comment.snippet.topLevelComment)}
                >
                  Reply
                </Button>
                {channel?.id ===
                comment.snippet.topLevelComment.snippet.authorChannelId
                  .value ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="ml-auto"
                    onClick={() => removeComment(comment.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                ) : null}
              </div>
              {expandedComments.includes(comment.id) && (
                <div className="mt-4">
                  <p className="text-sm">{}</p>
                  {comment.snippet.replies.map((reply: any) => (
                    <div key={reply.id} className="mt-4 ms-4">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={reply.snippet.authorProfileImageUrl}
                            alt={reply.snippet.authorDisplayName}
                          />
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">
                              {reply.snippet.authorDisplayName}
                            </CardTitle>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(reply.snippet.publishedAt)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {reply.snippet.textDisplay}
                            </p>
                            {channel?.id ===
                            reply.snippet.authorChannelId.value ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="ml-auto"
                                onClick={() =>
                                  removeComment(reply.id, comment.id)
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            ) : (
                              <div> </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {pageToken ? (
          <Button
            variant="outline"
            onClick={() => {
              loadMore();
            }}
          >
            Load More
          </Button>
        ) : null}
      </div>
    </div>
  );
}
