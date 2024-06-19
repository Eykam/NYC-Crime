import Box from "@mui/material/Box";
import useSearchStore, { Headlines } from "../store/searchState";
import { motion } from "framer-motion";

const Download = () => {
  const { headlines } = useSearchStore();

  const createCSVFromHeadlines = (headlines: Headlines): string => {
    const header = "Headline,Description,Sentiment,Date,Link\n";
    const rows = Object.keys(headlines).map((key) => {
      const headline = headlines[key];
      return `${key.replace(/[,;.\n\r]/g, "")},${headline.description.replace(
        /[,;.\n\r]/g,
        ""
      )},${headline.sentiment},${headline.date},${headline.link}\n`;
    });
    return header + rows.join("");
  };

  const downloadCSV = () => {
    const csvData = createCSVFromHeadlines(headlines);

    const blob = new Blob([csvData], { type: "text/csv" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "headlines.csv";

    a.click();

    // Clean up by revoking the URL
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      onHoverStart={(e) => {}}
      onHoverEnd={(e) => {}}
      className="flex justify-center items-center w-auto text-white mr-5 p-2 rounded-lg text-xs font-bold"
      style={{ background: "#1F3A5F", cursor: "pointer" }}
      onClick={() => downloadCSV()}
    >
      <span className="h-auto">Download CSV</span>
    </motion.div>
  );
};
export default Download;
