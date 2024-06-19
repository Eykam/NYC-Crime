import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useState } from "react";

const GPT = () => {
  const [markdownContent, setMarkdownContent] = useState<string>("");

  useEffect(() => {
    // Assuming you have the README.md file in the same directory as this component
    fetch("GPT_UI.md")
      .then((response) => response.text())
      .then((data) => {
        setMarkdownContent(data);
      })
      .catch((error) => {
        console.error("Error loading GPT_UI.md:", error);
      });
  }, []);

  return (
    <div
      className="w-[60%] m-auto p-4 rounded-md mt-[5%] justify-center align-middle bg-gray-400"
      style={{ overflow: "scroll" }}
    >
      <Markdown className="markdown " remarkPlugins={[remarkGfm]}>
        {markdownContent}
      </Markdown>
    </div>
  );
};
export default GPT;
