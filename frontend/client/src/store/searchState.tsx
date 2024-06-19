import { create } from "zustand";

const BACKEND_BASE_URL = "/api";
const HEADLINE_ENDPOINT = "/search";
const SIMILARITY_ENDPOINT = "/similar";

const sanitizeInput = (inputString: string) => {
  const input = inputString
    .replace(/'/g, '"')
    .replace(/\\/g, "\\\\")
    .replace(/&.*;/g, "")
    .replace(/\n/g, "");
  return input;
};

const compareDates = (ascending: boolean) => {
  return (a: [string, HeadlineData], b: [string, HeadlineData]) => {
    const dateA = new Date(a[1].date);
    const dateB = new Date(b[1].date);

    if (ascending) {
      return dateA.getTime() - dateB.getTime();
    } else {
      return dateB.getTime() - dateA.getTime();
    }
  };
};

const compareSentiments = (ascending: boolean) => {
  return (a: [string, HeadlineData], b: [string, HeadlineData]) => {
    if (ascending) {
      return a[1].sentiment - b[1].sentiment;
    } else {
      return b[1].sentiment - a[1].sentiment;
    }
  };
};

export interface HeadlineData {
  description: string;
  sentiment: number;
  date: string;
  link: string;
}

export interface Headlines {
  [index: string]: HeadlineData;
}

interface SearchStore {
  keywords: string[];
  setKeywords: (keywords: string[]) => void;
  headlines: Headlines;
  setHeadlines: (headlines: Headlines) => void;
  similaritySearch: boolean;
  setSimilaritySearch: (searchSimilar: boolean) => void;
  fetchHeadlines: (keywords: string[]) => void;
  sortDate: (direction: string) => void;
  sortSentiment: (direction: string) => void;
}

const useSearchStore = create<SearchStore>((set, get) => ({
  keywords: [],
  setKeywords: (keywords: string[]) => set({ keywords: keywords }),

  headlines: {},
  setHeadlines: (headlines: Headlines) => set({ headlines: headlines }),

  similaritySearch: true,
  setSimilaritySearch: (searchSimilar: boolean) =>
    set({ similaritySearch: searchSimilar }),

  sortDate: (direction: string) => {
    const headlines = get().headlines;
    const sortedArray = Object.entries(headlines).sort(
      compareDates(direction === "ascending" ? true : false)
    );
    const sortedHeadlines: Headlines = {};

    sortedArray.forEach(([key, headline]) => {
      sortedHeadlines[key] = headline;
    });

    set({ headlines: sortedHeadlines });
  },

  sortSentiment: (direction: string) => {
    const headlines = get().headlines;
    const sortedArray = Object.entries(headlines).sort(
      compareSentiments(direction === "ascending" ? true : false)
    );
    const sortedHeadlines: Headlines = {};

    sortedArray.forEach(([key, headline]) => {
      sortedHeadlines[key] = headline;
    });

    set({ headlines: sortedHeadlines });
  },

  fetchHeadlines: async (keywords: string[]) => {
    const url = BACKEND_BASE_URL;

    if (keywords.length > 0) {
      console.log("keywords to fetch", JSON.stringify({ keywords: keywords }));

      const response = await fetch(url + HEADLINE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: keywords }),
      });

      const headlinesText = await response.json();

      const headlinesCleaned: Headlines = {};

      Object.keys(headlinesText).forEach((headline) => {
        const value = headlinesText[headline];
        const sanitizedValue = sanitizeInput(value);
        const jsonValue = JSON.parse(sanitizedValue) as HeadlineData;

        headlinesCleaned[headline] = jsonValue;
      });

      const similaritySearch = get().similaritySearch;

      if (similaritySearch) {
        const similarRes = await fetch(url + SIMILARITY_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keywords: keywords }),
        });

        if (similarRes.status !== 400) {
          const similarText = await similarRes.json();

          Object.keys(similarText).forEach((headline) => {
            const value = similarText[headline];
            const sanitizedValue = sanitizeInput(value);
            const jsonValue = JSON.parse(sanitizedValue) as HeadlineData;

            headlinesCleaned[headline] = jsonValue;
          });
        }
      }

      set({ headlines: headlinesCleaned });
    } else {
      const response = await fetch(url + "/all", { method: "GET" });
      const headlinesText = await response.json();

      const headlinesCleaned: Headlines = {};

      Object.keys(headlinesText).forEach((headline) => {
        const value = headlinesText[headline];
        const sanitizedValue = sanitizeInput(value);
        const jsonValue = JSON.parse(sanitizedValue) as HeadlineData;

        headlinesCleaned[headline] = jsonValue;
      });

      set({ headlines: headlinesCleaned });
    }
  },
}));

export default useSearchStore;
