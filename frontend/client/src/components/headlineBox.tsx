import Box from "@mui/material/Box";
import { HeadlineData } from "../store/searchState";
import "../styles/box.css";
import { motion } from "framer-motion";

const HeadlineBox = ({
  data,
}: {
  data: {
    headline: string;
    headlineData: HeadlineData;
  };
}) => {
  const { headline, headlineData } = data;

  const sentimentColor = (number: number) => {
    const clampedNumber = Math.min(1, Math.max(-1, number));

    const red = Math.floor(255 * (1 - clampedNumber));
    const green = Math.floor(255 * (1 + clampedNumber));
    const blue = 128; // Gray

    const color = `rgb(${red}, ${green}, ${blue})`;

    return color;
  };

  return (
    <motion.div
      className="box rounded-lg p-5 h-[155px] flex flex-col justify-between"
      whileHover={{ scale: 1.01 }}
      onHoverStart={(e) => {}}
      onHoverEnd={(e) => {}}
    >
      <h3
        className="text-white text-sm font-bold"
        style={{ cursor: "pointer" }}
        onClick={() => {
          window.location.href = headlineData.link;
        }}
      >
        {headline}
      </h3>
      <h5 className="text-gray-400 text-xs">
        {headlineData.description.length > 200
          ? headlineData.description.slice(0, 200) + "..."
          : headlineData.description}
      </h5>

      <br />

      <div className="flex justify-between">
        <h3 className="text-white">{headlineData.date}</h3>
        <h3 className="text-white">
          Sentiment:{" "}
          <span style={{ color: sentimentColor(headlineData.sentiment) }}>
            {headlineData.sentiment.toFixed(3)}
          </span>
        </h3>
      </div>
    </motion.div>
  );
};

export default HeadlineBox;
