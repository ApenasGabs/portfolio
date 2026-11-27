import type { ReactElement } from "react";
import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Dashboard from "./pages/Home/Home";

const App = (): ReactElement => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <BrowserRouter>
      <div className="min-h-screen relative bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
        <div
          aria-hidden="true"
          className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(56,189,248,0.09),transparent_65%),radial-gradient(ellipse_55%_45%_at_85%_90%,rgba(168,85,247,0.07),transparent_60%)]"
        />
        <div className="relative z-10 min-h-screen flex flex-col">
          <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard searchQuery={searchQuery} />} />
              <Route path="/overview" element={<Dashboard searchQuery={searchQuery} />} />
            </Routes>
          </div>
          <footer className="border-t border-border-light dark:border-border-dark mt-8 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
            <p>© {new Date().getFullYear()} ApenasGabs — Gabriel Rodrigues · Knowledge Graph</p>
          </footer>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
