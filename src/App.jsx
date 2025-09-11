import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import AutoToTop from "./components/AutoToTop";
import Tes from "./pages/Tes";

function App() {
  return (
    <Router>
      <AutoToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tes" element={<Home />} />
        
        {/* Catch-all untuk halaman yang tidak ada */}
        <Route path="/comingsoon" element={<ComingSoon />} />
        <Route path="*" element={<Navigate to="/comingsoon" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
