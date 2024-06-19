const Redis = require("ioredis");
require("dotenv").config();

const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_HOST = process.env.REDIS_HOST;

const client = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
});

function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vector dimensions must match for cosine similarity.");
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Cosine similarity is undefined when one of the vectors is a zero vector.
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

async function getTopMatchesForKeywords(targetKeywords, topN = 25) {
  const mergedTopVectors = [];

  // Iterate over target keywords
  for (const targetKeyword of targetKeywords) {
    const topSimilarVectors = await getTopSimilarVectors(
      targetKeyword.toLowerCase()
    );
    if (Object.keys(topSimilarVectors).length > 0) {
      mergedTopVectors.push(...topSimilarVectors);
    }
  }

  if (mergedTopVectors.length > 0) {
    // Sort the mergedTopVectors in descending order of similarity scores
    mergedTopVectors.sort((a, b) => b.similarity - a.similarity);

    // Get the top 25 results
    const top25Results = mergedTopVectors
      .slice(0, topN)
      .map((embedding) => embedding.key);

    return top25Results;
  }
}

async function getTopSimilarVectors(targetWord) {
  const embeddings = await getAllEmbeddings();
  const targetVector = await getEmbedding(targetWord);

  if (embeddings && targetVector) {
    const vectorList = embeddings["values"];
    const vectorKeys = embeddings["keys"];

    if (vectorList.length !== vectorKeys.length) {
      throw new Error("Vector list and vector keys must have the same length.");
    }

    // Calculate cosine similarity between the target vector and all vectors in the list.
    const similarities = vectorList.map((vector, index) => ({
      key: vectorKeys[index],
      similarity: cosineSimilarity(targetVector, vector),
    }));

    return similarities.sort((a, b) => b.similarity - a.similarity);
  }
}

async function getAllEmbeddings() {
  try {
    const keyValuePairs = await client.hgetall("embeddings");

    return {
      keys: Object.keys(keyValuePairs),
      values: Object.keys(keyValuePairs).map((key) =>
        parseEmbedding(keyValuePairs[key])
      ),
    };
  } catch (error) {
    console.error("Error retrieving keys and values from Redis HSET:", error);
  }
}

function parseEmbedding(embeddingBuffer) {
  if (embeddingBuffer) {
    const embeddingArray = embeddingBuffer
      .replace(/\[|\]/g, "")
      .split(/\s+/)
      .filter(Boolean);

    const float32Array = new Float32Array(embeddingArray.map(parseFloat));
    return float32Array;
  } else {
    console.log("Keyword not found.");
  }
}

async function getEmbedding(keyword) {
  try {
    const embeddingBuffer = await client.hget("embeddings", keyword);

    return parseEmbedding(embeddingBuffer);
  } catch (error) {
    console.error("Error retrieving embedding:", error);
  }
}

module.exports = { getTopMatchesForKeywords };
