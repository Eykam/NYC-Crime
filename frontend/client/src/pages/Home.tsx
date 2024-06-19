import SearchBar from "../components/searchBar";
import HeadlinesContainer from "../components/headlinesContainer";
import ChartWrapper from "../components/chartWrapper";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

const Home = () => {
  return (
    <div className="flex items-center h-auto w-auto">
      <div className="flex flex-col items-center h-auto w-[48%]">
        <div className="flex-wrap w-[90%]">
          <SearchBar />
        </div>

        <HeadlinesContainer />
      </div>
      <ChartWrapper />
    </div>
  );
};
export default Home;
