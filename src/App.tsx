import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
const App = () => {
  return (
    <>
      <Navbar />
      <Home />
      <footer className="footer footer-center p-4 bg-base-300 text-base-content">
        <aside>
          <p>Copyright © 2024 - All right reserved by ApenasGabs</p>
        </aside>
      </footer>
    </>
  );
};

export default App;
