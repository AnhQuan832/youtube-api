import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Page } from "./pages/Page";
import CommentPage from "./pages/CommentPage";
import Cookies from "js-cookie";
function App() {
  const AuthRoute = ({ children }: { children: React.ReactNode }) => {
    const token = Cookies.get("accessToken");
    const isAuthenticated = !!token;
    return isAuthenticated ? children : <Navigate to="/home" />;
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
          <Route path="/" element={<Navigate to="/home" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
