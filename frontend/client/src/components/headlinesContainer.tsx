import useSearchStore, { Headlines } from "../store/searchState";
import { FixedSizeList as List } from "react-window";
import HeadlineBox from "./headlineBox";
import { useEffect, useMemo, useState } from "react";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { IconButton } from "@mui/material";

const HeadlinesContainer = () => {
  const { headlines, sortDate, sortSentiment } = useSearchStore();

  const height = window.innerWidth < 1400 ? 575 : 700;

  const [dateSort, setDateSort] = useState("ascending");
  const [sentimentSort, setSentimentSort] = useState("ascending");

  const headlineKeys = useMemo(() => {
    return Object.keys(headlines);
  }, [headlines]);

  useEffect(() => {
    if (headlines) sortDate("descending");
  }, []);

  const Row = ({
    data,
    index,
    style,
  }: {
    data: { headlines: Headlines };
    index: number;
    style: React.CSSProperties;
  }) => {
    return (
      <div style={style}>
        <HeadlineBox
          data={{
            headline: headlineKeys[index],
            headlineData: headlines[headlineKeys[index]],
          }}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col w-[90%]">
      <div className="flex justify-between">
        <div className="flex w-[20%] justify-between text-center">
          <div className="flex justify-center align-middle">
            <IconButton
              className="m-0"
              style={{ fontSize: "16px", fontWeight: "bold", color: "#acc2ef" }}
              onClick={() => {
                sortDate(dateSort);
                setDateSort((state) =>
                  state === "ascending" ? "descending" : "ascending"
                );
              }}
            >
              Date:{" "}
              {dateSort === "ascending" ? (
                <ArrowUpwardIcon
                  style={{ height: "18px", margin: "0", fontWeight: "bolder" }}
                />
              ) : (
                <ArrowDownwardIcon
                  style={{ height: "18px", margin: "0", fontWeight: "bolder" }}
                />
              )}
            </IconButton>
          </div>
          <div>
            <IconButton
              className="m-0"
              style={{ fontSize: "16px", fontWeight: "bold", color: "#acc2ef" }}
              onClick={() => {
                sortSentiment(sentimentSort);
                setSentimentSort((state) =>
                  state === "ascending" ? "descending" : "ascending"
                );
              }}
            >
              Sentiment:{" "}
              {sentimentSort === "ascending" ? (
                <ArrowUpwardIcon
                  style={{ height: "18px", margin: "0", fontWeight: "bolder" }}
                />
              ) : (
                <ArrowDownwardIcon
                  style={{ height: "18px", margin: "0", fontWeight: "bolder" }}
                />
              )}
            </IconButton>
          </div>
        </div>

        <h3 className="text-gray-300 ml-2 mr-5 h-auto self-center">
          Showing{" "}
          <span className="font-bold text-white">{headlineKeys.length}</span>{" "}
          Headlines
        </h3>
      </div>

      <List
        height={height}
        width={"100%"}
        itemCount={headlineKeys.length}
        itemSize={160}
        itemData={{ headlines: headlines }}
      >
        {Row}
      </List>

      {/* {Object.keys(headlines).map((headline) => (
        <HeadlineBox headline={headline} headlineData={headlines[headline]} />
      ))} */}
    </div>
  );
};

export default HeadlinesContainer;
