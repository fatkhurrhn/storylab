import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AutoToTop from "./components/AutoToTop";
import HomePage from "./pages/HomePage";
import Tes from "./pages/Tes";

function App() {
  return (
    <Router>
      <AutoToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tes" element={<Tes />} />
        
        {/* Catch-all untuk halaman yang tidak ada */}
        <Route path="/comingsoon" element={<ComingSoon />} />
        <Route path="*" element={<Navigate to="/comingsoon" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
