import { useEffect, useState } from "react";
import { AreaChart, DataPoint } from "./areaChart";
import useSearchStore from "../store/searchState";

function parseDateString(dateString: string) {
  const dateParts = dateString.split("-"); // Split the string into an array ["YYYY", "MM", "DD"]
  const year = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1; // Months in JavaScript are 0-indexed, so subtract 1
  const day = parseInt(dateParts[2]);

  return new Date(year, month, day);
}

const ChartWrapper = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const { headlines, keywords } = useSearchStore();

  const height = 500;
  const width = window.innerWidth < 1400 ? 700 : 900;

  useEffect(() => {
    if (headlines) {
      const groupedSentiments: Record<string, { sum: number; count: number }> =
        {};

      // Group sentiments by date and calculate their averages
      Object.keys(headlines).forEach((headline) => {
        const date = headlines[headline]["date"];
        const sentiment = headlines[headline]["sentiment"];

        if (!groupedSentiments[date]) {
          groupedSentiments[date] = { sum: 0, count: 0 };
        }

        groupedSentiments[date].sum += sentiment;
        groupedSentiments[date].count += 1;
      });

      // Calculate the average sentiment for each date
      const parsedData: { x: Date; y: number }[] = Object.keys(
        groupedSentiments
      ).map((date) => {
        const averageSentiment =
          groupedSentiments[date].sum / groupedSentiments[date].count;
        return { x: parseDateString(date), y: averageSentiment };
      });

      const today = new Date();
      const tenDaysAgo = new Date(today);
      tenDaysAgo.setDate(today.getDate() - 45);

      const filteredData = parsedData.filter((entry) => entry.x > tenDaysAgo);

      // Sort the data by date
      filteredData.sort((a, b) => a.x.getTime() - b.x.getTime());
      console.log("filtered and sorted data", filteredData);

      setData(filteredData);
    }
  }, [headlines]);

  return (
    <div
      className="flex flex-col text-white text-2xl self-start mt-[7%] mr-[2%] items-center p-4 "
      style={{
        background: "#1f2b3e",
        borderRadius: "10px",
        minWidth: "50%",
      }}
    >
      <div className="ml-[50px]">
        {" "}
        Average Daily Sentiment by Keywords:
        <br />
        {keywords.length === 0 ? (
          "[All]"
        ) : (
          <>[{keywords.map((keyword) => keyword + ", ")}]</>
        )}
      </div>
      <AreaChart data={data} width={width} height={height} />
    </div>
  );
};

export default ChartWrapper;
