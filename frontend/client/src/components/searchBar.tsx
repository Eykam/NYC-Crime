import Box from "@mui/material/Box";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton, Switch } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import useSearchStore from "../store/searchState";
import Keyword from "./keyword";
import Download from "./download";
import { motion } from "framer-motion";
import Timestamp from "./timestamp";

const SearchBar = () => {
  const [isActive, setActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null!);

  const {
    keywords,
    similaritySearch,
    setSimilaritySearch,
    fetchHeadlines,
    setKeywords,
  } = useSearchStore();

  const submitQueryEnter = (keywords: string) => {
    const individualKeywords = keywords.split(" ");
    setKeywords(individualKeywords);
  };

  const submitQuery = (keywords: string) => {
    if (keywords.length === 0) {
      setKeywords([]);
    } else if (keywords[keywords.length - 1] === " ") {
      const individualKeywords = keywords.split(" ");
      const extractedKeywords = individualKeywords.slice(
        0,
        individualKeywords.length - 1
      );

      console.log("extracted keywords", extractedKeywords);
      // setKeyWords(extractedKeywords);
      setKeywords(extractedKeywords);
    }
  };

  useEffect(() => {
    fetchHeadlines(keywords);
  }, [keywords, similaritySearch, fetchHeadlines]);

  return (
    <>
      <Timestamp />
      <Box className="flex justify-between h-[5%]">
        <motion.div
          className="flex flex-row bg-gray-600 w-[100%] md:w-[40%] rounded-lg overflow-hidden self-start items-center"
          whileHover={{ scale: 1.02 }}
          onHoverStart={(e) => {}}
          onHoverEnd={(e) => {}}
        >
          <IconButton>
            <SearchIcon className="m-0 text-white" />
          </IconButton>

          <input
            ref={inputRef}
            className="h-[100%] w-[90%] bg-transparent text-white"
            style={{ outline: isActive ? "none" : "blue" }}
            onFocus={() => setActive(true)}
            onBlur={() => setActive(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                submitQueryEnter(inputRef.current.value);
              }
            }}
            onChange={(e) => {
              submitQuery(e.target.value);
            }}
          />
        </motion.div>

        <div className="text-white font-bold text-sm">
          <Switch
            defaultChecked
            onChange={() => setSimilaritySearch(!similaritySearch)}
          />
          Similarity Search
        </div>

        <Download />
      </Box>

      <div className="flex self-start items-center">
        {keywords.map((keyword) => (
          <Keyword name={keyword} input={inputRef.current} />
        ))}
      </div>
    </>
  );
};

export default SearchBar;
