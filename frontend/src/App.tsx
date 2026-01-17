import { HeroUIProvider } from "@heroui/react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Editor from "./pages/Editor";

import { useEffect } from "react";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <HeroUIProvider navigate={navigate}>
      <div className="dark text-foreground bg-background min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor/:id" element={<Editor />} />
        </Routes>
      </div>
    </HeroUIProvider>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}
