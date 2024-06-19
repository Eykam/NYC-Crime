import Box from "@mui/material/Box";
import routes from "../routes";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Header = () => {
  return (
    <Box
      className="h-auto w-[100%] flex justify-center p-2"
      style={{ background: "#1f2b3e" }}
    >
      <div className="flex w-[95%] justify-between text-white font-bold text-xl">
        <div>Peloria</div>

        <div className="flex">
          {routes.map((route) => (
            <motion.div
              className="ml-5 mr-5 text-center text-lg font-normal"
              key={route.name + "-navbar"}
              whileHover={{ scale: 1.05 }}
              onHoverStart={(e) => {}}
              onHoverEnd={(e) => {}}
            >
              <Link to={route.path} key={route.name + "-navbar-link"}>
                {route.name}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </Box>
  );
};

export default Header;
