import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Loading from "./pages/Loading";
import useFetch from "./hooks/useFetch";
import NotFound from "./pages/NotFound";
import User from "./pages/User";
import Post from "./pages/Post";
import Role from "./pages/Role";
import Statistic from "./pages/Statistic";
import Setting from "./pages/Setting";
import Document from "./pages/Document";
import { useGlobalContext } from "./types/context";
import ChatbotSuggestion from "./pages/ChatbotSuggestion";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { setProfile } = useGlobalContext();
  const { get, post, loading } = useFetch();

  useEffect(() => {
    const checkToken = async () => {
      const token = await localStorage.getItem("accessToken");
      const res = await post("/v1/user/verify-token", { accessToken: token });
      if (res.result) {
        setIsAuthenticated(true);
      } else {
        await localStorage.removeItem("accessToken");
        setIsAuthenticated(false);
      }
    };
    const getProfile = async () => {
      const res = await get("/v1/user/profile");
      setProfile(res.data);
    };
    getProfile();
    checkToken();
  }, []);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <BrowserRouter>
            <Routes>
              {isAuthenticated ? (
                <>
                  <Route path="/" element={<User />} />
                  <Route path="/post" element={<Post />} />
                  <Route path="/statistic" element={<Statistic />} />
                  <Route path="/setting" element={<Setting />} />
                  <Route path="/role" element={<Role />} />
                  <Route path="/document" element={<Document />} />
                  <Route path="/suggestion" element={<ChatbotSuggestion />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<Login />} />
                </>
              )}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </>
      )}
    </>
  );
};

export default App;
