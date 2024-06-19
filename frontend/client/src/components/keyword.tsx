import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "../styles/keyword.css";
import useSearchStore from "../store/searchState";

const Keyword = ({
  name,
  input,
}: {
  name: string;
  input: HTMLInputElement;
}) => {
  const { keywords, setKeywords } = useSearchStore();

  return (
    <div
      className="keyword w-auto m-1 p-2 rounded-3xl text-white"
      style={{ fontSize: "12px" }}
    >
      {name}
      <IconButton
        style={{ margin: 0, padding: "0", color: "white" }}
        onClick={() => {
          input.value = input.value.replace(name, "");
          setKeywords(keywords.filter((keywords) => keywords !== name));
        }}
      >
        <CloseIcon style={{ fontSize: "15px" }} />
      </IconButton>
    </div>
  );
};

export default Keyword;
