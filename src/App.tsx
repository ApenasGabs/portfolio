import type { ReactElement } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Dashboard from "./pages/Home/Home";

const App = (): ReactElement => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/overview" element={<Dashboard />} />
        </Routes>
        <footer className="border-t border-border-light dark:border-border-dark mt-8 py-6 text-center text-xs text-gray-400">
          <p>
            © {new Date().getFullYear()} ApenasGabs — feito com{" "}
            <span className="text-primary">♥</span> e a API do GitHub
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
