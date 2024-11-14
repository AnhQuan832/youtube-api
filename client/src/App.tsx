import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Page } from "./pages/Page";
import CommentPage from "./pages/CommentPage";
import { getProfile } from "./api/apiClient";
import React, { useEffect, useState } from "react";

function App() {
  const AuthRoute = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
      null
    );
    useEffect(() => {
      const checkAuth = async () => {
        const user = await getProfile();
        setIsAuthenticated(!!user);
      };
      checkAuth();
    }, []);

    if (isAuthenticated === null) {
      return <div>Loading...</div>;
    }

    return isAuthenticated ? <>{children}</> : <Navigate to="/home" />;
  };

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/home" element={<Page />} />
          <Route
            path="/comment/:id"
            element={
              <AuthRoute>
                <CommentPage />
              </AuthRoute>
            }
          />
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
