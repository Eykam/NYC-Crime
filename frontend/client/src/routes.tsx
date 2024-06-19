import Documentation from "./pages/Documentation";
import Home from "./pages/Home";
import GPT from "./pages/GPT";

const routes = [
  { path: "/", name: "Search", element: <Home /> },
  {
    path: "/documentation",
    name: "Documentation",
    element: <Documentation />,
  },
  {
    path: "/GPTResponses",
    name: "GPT UI",
    element: <GPT />,
  },
];

export default routes;
