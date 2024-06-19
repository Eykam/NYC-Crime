const express = require("express");
const app = express(); // create express app
const path = require("path");

require("dotenv").config();
// add middleware

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "./client", "build")));
app.use(express.static("public"));

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "./client", "build", "index.html"));
});

app.listen(PORT, process.env.RAILWAY_ENVIRONMENT_NAME === "production" ?  "::" : "0.0.0.0", () => {
    console.log(`server started on port ${PORT}`);
  });
  