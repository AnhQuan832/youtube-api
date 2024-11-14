import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Youtube } from "lucide-react";
import { getListActivities, getProfile, login, logout } from "@/api/apiClient";
import { useEffect, useState } from "react";
import { YouTubeActivity, YouTubeActivityList } from "@/components/activity";
import Cookies from "js-cookie";

interface User {
  name: string;
  email: string;
  picture: string;
}

export const Page = () => {
  const [activities, setActivities] = useState<YouTubeActivity[] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<number>(1);
  const [maxPage, setMaxPage] = useState<number>(1);
  const [pageToken, setPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get("accessToken");
      if (token && !user) {
        const data = await getProfile(token);
        if (data) setUser(data);
      }

      if (user && !loading && (!activities || page > 1)) {
        setLoading(true);
        const res = await getListActivities({ pageToken });
        setMaxPage(res.pageInfo.totalResults / res.pageInfo.resultsPerPage);
        setPageToken(res.nextPageToken);
        const newItem = res.items as YouTubeActivity[];
        setActivities([...(activities || []), ...newItem]);
        setLoading(false);
      }
    };
    fetchData();
  }, [user, page]);

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  const handleLogin = async (): Promise<void> => {
    const response = await login();
    window.open(response, "_self");
  };

  return (
    <div className="flex items-center justify-center h-[100vh]">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            YouTube Channel Activities Report
          </CardTitle>
          {/* <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription> */}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6"></h1>
            {user ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-lg">Welcome, {user.name}!</p>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
                <YouTubeActivityList activities={activities} />
                {maxPage > page ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPage(page + 1);
                    }}
                  >
                    Load More
                  </Button>
                ) : null}
              </div>
            ) : (
              <div className="text-center">
                <p className="mb-4">
                  Please log in to view your YouTube channel activities.
                </p>
                <div className="flex justify-center">
                  <Button
                    onClick={handleLogin}
                    className=" flex items-center gap-2"
                  >
                    <Youtube className="w-5 h-5" />
                    Login with YouTube
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
