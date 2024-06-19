import React from "react";
import "./styles/App.css";
import Header from "./components/header";
import { BrowserRouter } from "react-router-dom";
import RenderRoutes from "./renderRoutes";

function App() {
  return (
    <div
      className="min-h-[100dvh] min-w-[100dvw]"
      style={{ background: "#0F1C2E" }}
    >
      <BrowserRouter>
        <Header />
        <RenderRoutes />
      </BrowserRouter>
    </div>
  );
}

export default App;
