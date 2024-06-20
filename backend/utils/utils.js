const Redis = require("ioredis");
require("dotenv").config();

const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_HOST = process.env.REDIS_HOST;

const client = new Redis(`redis://${REDIS_HOST}:${REDIS_PORT}`);

async function getHeadlineData(headline) {
  try {
    const result = await client.hget("headlines", headline);

    if (result === null) {
      console.log(`Key '${key}' not found in '${headline}'.`);
      return null;
    }

    return result;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

async function findHeadlineByKeyword(keywords) {
  const headlines = {};
  try {
    await Promise.all(
      keywords.map(async (keyword) => {
        const redisKey = `keywords:${keyword.toLowerCase()}`;

        const keywordHeadlines = new Set(await client.lrange(redisKey, 0, -1));

        await Promise.all(
          [...keywordHeadlines].map(async (headline) => {
            const headlineData = await getHeadlineData(headline);
            headlines[headline.replace(":", "-").replace("'", "")] =
              headlineData;
          })
        );
      })
    );

    return headlines;
  } catch (e) {
    console.log("error finding keyword", e);
    return {};
  }
}

async function getFirst50KeysFromHeadlines() {
  try {
    const headlines = await client.hgetall("headlines");
    const cleaned = {};

    Object.keys(headlines).forEach((headline) => {
      cleaned[headline.replace(":", "-").replace("'", "")] =
        headlines[headline];
    });

    return cleaned;
  } catch (e) {
    console.log("error getting first 50 keys", e);
  }
}

async function getLastUpdated() {
  try {
    const timestamp = await client.get("last_updated");
    return timestamp;
  } catch (e) {
    console.log("error getting last updated timestamp", e);
    return Date.now();
  }
}

module.exports = {
  getFirst50KeysFromHeadlines,
  findHeadlineByKeyword,
  getLastUpdated,
};
