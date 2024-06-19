import React from "react";
import { Route, Routes } from "react-router-dom";
import routes from "./routes";

const RenderRoutes = () => {
  return (
    <Routes>
      {routes.map((route) => (
        <Route key={route.name} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
};

export default RenderRoutes;
