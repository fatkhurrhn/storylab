import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AutoToTop from "./components/AutoToTop";
import HomePage from "./pages/HomePage";
import Tes from "./pages/Tes";
import ComingSoon from "./pages/maintenance/ComingSoon";
import ManageImages from "./pages/admin/ManageImages";
import Images from "./pages/Images";
import DetailImages from "./pages/DetailImages";
import Quotes from "./pages/Quotes";
import ManageVideos from "./pages/admin/ManageVideos";
import Video from "./pages/Videos";
import Login from "./pages/settings/Login";
import ListMenu from "./pages/settings/ListMenu";
import DetailVideos from "./pages/DetailVideos";
import Dashboard from "./pages/Dashboard";
import Checkin from "./pages/Checkin";

function App() {
  return (
    <BrowserRouter>
      <AutoToTop />
      <Routes>
        {/* Redirect root "/" ke "/home" */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/checkin" element={<Checkin />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ListMenu />} />
        <Route path="/tes" element={<Tes />} />
        <Route path="/quotes" element={<Quotes />} />
        <Route path="/videos" element={<Video />} />
        <Route path="/videos/:id" element={<DetailVideos />} />
        <Route path="/videos/kategori/:id" element={<Video />} />
        <Route path="/images" element={<Images />} />
        <Route path="/images/:id" element={<DetailImages />} />
        <Route path="/dashboard/images" element={<ManageImages />} />
        <Route path="/dashboard/videos" element={<ManageVideos />} />

        {/* Catch-all untuk halaman yang tidak ada */}
        <Route path="/comingsoon" element={<ComingSoon />} />
        <Route path="*" element={<Navigate to="/comingsoon" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
