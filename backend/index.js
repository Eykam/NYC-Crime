const express = require("express");
const app = express(); // create express app
const cors = require("cors");
const bodyParser = require("body-parser");
const { getTopMatchesForKeywords } = require("./utils/similarity");
const {
  findHeadlineByKeyword,
  getFirst50KeysFromHeadlines,
} = require("./utils/utils");

require("dotenv").config();

const port = process.env.PORT || 9000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  cors({
    origin: "*", // Allow requests from all for now
    methods: "GET,POST", // Allow GET and POST requests
    optionsSuccessStatus: 200, // Set a 200 status code for successful preflight requests
  })
);

app.get("/all", async (req, res) => {
  console.log("Sending all articles to frontend...")
  const headlines = await getFirst50KeysFromHeadlines();
  res.send(headlines);
});

app.post("/search", async (req, res) => {
  const keywords = req.body.keywords;
  const headlines = await findHeadlineByKeyword(keywords);

  res.json(headlines);
});

app.post("/similar", async (req, res) => {
  const keywords = req.body.keywords;
  try {
    const cleaned = {};
    if (keywords.length > 0) {
      const mostSimilar = await getTopMatchesForKeywords(keywords);

      console.log("most similar keywords", mostSimilar);

      const headlines = await findHeadlineByKeyword(mostSimilar);

      Object.keys(headlines).forEach((headline) => {
        cleaned[headline.replace(":", "-").replace("'", "")] =
          headlines[headline];
      });
    }

    res.json(cleaned);
  } catch (e) {
    console.log("didnt find similar posts");
    res.status(400).send();
  }
});

app.listen(port, process.env.RAILWAY_ENVIRONMENT_NAME === "production" ?  "::" : "0.0.0.0", () => {
  console.log(`server started on port ${port}`);
});
