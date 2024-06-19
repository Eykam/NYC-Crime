# Peloria

## Crime News Aggregator

## Introduction

The goal of this project is to demonstrate how I can create a robust solution for aggregating crime-related news articles in New York City.

## Project Overview

In this project, I've designed and implemented a web application that fetches and presents recent news articles related to crime in NYC. The focus is on creating a scalable fault tolerant web scraper, along with user friendly frontend that allows you to query and track sentiment on Crime News in NYC easily.

Here's a breakdown of what this project achieves:

- **Web Scraping**: Using Python, I've developed a web scraper that collects news articles from well-known sources like NBC, CBS, and NY Daily News. The scraper targets crime-related news from the past few days.

- **Sentiment Analysis**: To provide deeper insights into the news articles, I've incorporated sentiment analysis. It evaluates the emotional tone of the articles, providing a score for positive, negative and neutral tones within the inputted string. I then normalize these scores over a range of [-1,1] for plotting later on. The model is "Twitter-roberta-base-sentiment" (trained on 58M tweets) (https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment)

- **Article Categorization**: Leveraging GPT-3.5, I've implemented a feature to determine if an article is related to crime in NYC. The instruction prompt can also extract key keywords from article headlines and descriptions, enhancing search capabilities.

- **Keyword Search**: For users looking to explore specific topics, I've integrated both an exact keyword search that returns all articles containing inputted keywords. I've also implemented an optional cosine-similarity Top-K search on embeddings created by BERT-base-uncased model (https://huggingface.co/bert-base-uncased) on keywords. This feature facilitates finding more articles of interest by finding similar keywords.

- **Efficient Data Handling**: To optimize data retrieval speed, I've introduced Redis as a caching layer. It accelerates data access, ensuring a smooth user experience.

- **Backend Server**: For managing data and serving it to the frontend, I've developed a backend server using Node.js and Express.

- **User-Friendly Design**: The frontend is built with React.js, incorporating Zustand for state management. For maintaining consistency in the UI, I'm using to the Material-UI (MUI) Component Library and TailwindCSS for quick and effective CSS styling.

- **Deployment Ease**: I've included Docker and Docker Compose configurations for straightforward container setup and scalability.

This project represents a comprehensive demonstration of my technical skills and ability to create a practical and user-centric solution. It's a showcase of my expertise in working on all parts of the stack, along with my love for Data Science!

## Getting Started

- Assuming you have Docker installed, you can run the run.sh script in ./ with `bash run.sh`
- After building the images, and installing the dependencies, the frontend should be available at http://localhost:3000

- To run the webscraper, uncomment the scraper-\* services in the docker-compose files
- You'll have to first go to ./backend/utils/keywordGenerator.py and replace api_key = "" with your own OpenAI api_key

## In-Depth Web Scraping Workflow

### Scraper Architecture

The web scraper at the core of this project is built using Python's `requests` library for making HTTP requests and `Beautiful Soup` (`bs4`) for parsing HTML content. It is designed to efficiently collect news articles related to crime in NYC from various sources.

### Parsing CBS and NY Daily News

- **Server-Side Rendering**: [CBS](https://www.cbsnews.com/newyork/latest/local-news/new-york/) and [NY Daily News](https://www.nydailynews.com/tag/nyc-crime/page/0) websites utilize server-side rendering, allowing `Beautiful Soup` to directly parse structured data from the source HTML. Specifically, the scraper extracts the following information for each headline:
- **API:** Through some digging into the Dev Tools of [NBC](https://www.nbcnewyork.com/news/local/), I happened to find an [exposed API](https://www.nbcnewyork.com/wp-json/nbc/v1/template/term/1:2:65?page=0) and was able to request article data directly, avoiding having to parse HTML and sanitize the data.
- **Data Structure:** After obtaining the raw data from each source, I parsed, cleaned and formatted the data into the following data
  ```TypeScript
    {
      [headline : string] : {
        description : string,
        date : string,
        link : string
      }
    }
  ```

The `Worker` class is designed to scrape and process data from web pages using the `Page` class as a template. It follows a structured workflow to collect articles, perform sentiment analysis, and store relevant information. It maintains all connections and models necessary for serialization of headlines as instance variables, to reduce overhead of instantiating new connections on every request.

#### Constructor

- `__init__(self, page)`: Initializes a `Worker` instance with necessary attributes and configurations. It accepts an instance of a `Page` class (e.g., CBSPage, NBCPage) to specify the source.

#### Methods in the `Worker` Class

- `serialize_headline(article, headline)`: Serializes and stores information about a headline article, including its description, date, link, sentiment score, and keywords. This method also checks if the headline already exists in the cache to prevent duplication.

- `score_sentiment(data)`: Utilizes a sentiment analysis pipeline to score the sentiment of an article's content. It returns a sentiment score, considering positive, negative, and neutral sentiments.

- `scrape_page(page_num)`: Scrapes a specific page (identified by `page_num`) of the source website (e.g., CBS, NBC). It extracts headlines and processes them using the `serialize_headline` method.

- `scrape_pages()`: Initiates the multi-threaded scraping process for multiple pages, allowing for parallel data collection.

- `get_headlines()`: Returns the collected headlines as a dictionary, where each headline serves as a key and the associated data is the corresponding value.

### Implementation of `Page` in Each Source

#### Purpose

Each source (e.g., CBS, NBC, NYDaily) implements the `Page` class by providing concrete implementations for the abstract methods. This allows for source-specific data extraction while maintaining a consistent interface across all sources.

The `Worker` class can then be instantiated with a specific source's `Page` instance, making it easy to adapt the scraping process to different websites without extensive code modification

##### Methods:

- `__init__(self, url)`: Initializes the Page object with a given URL, which represents the web page to be scraped.
- `get_headline()`: Abstract method for extracting the headline from a web page.
- `get_description()`: Abstract method for extracting the article description.
- `get_date()`: Abstract method for extracting the publication date of the article.
- `get_articles()`: Abstract method for obtaining a list of articles from the web page. This method returns a structured representation of articles, often in the form of a dictionary containing headline, description, date, and link.
- `get_headline_link()`: Abstract method for extracting the link associated with the headline.

#### How It Works

- **Abstraction**: The Page class provides an abstract representation of a web page. Its methods are abstract, meaning that they are declared without implementation details.
- Concrete page classes must inherit from Page and provide specific implementations for these methods.

Customized Implementation: Each news source (CBS, NBC, NYDaily) has its own way of structuring web pages and presenting articles. To scrape articles from these sources, we create concrete page classes (e.g., CBSPage) that inherit from Page and implement the abstract methods. This allows us to customize the scraping logic for each source while adhering to a common interface.

URL Initialization: When a Page object is created, it is initialized with the URL of the web page to be scraped. This URL is used as a reference point for the scraping process.

### Determining Relevance and Extracting Keywords from Articles using GPT-3.5

This section explains the process of determining whether the content of an article is relevant to crime in New York City (NYC) and extracting keywords from the article. This is achieved using GPT-3.5 Turbo. The goal is to automate the analysis of article content and obtain valuable keywords that help identify the article's main topics and relevance. I was unable to find a pretrained model to classify text as Crime-related, but found GPT-3.5 worked pretty well with some prompt tuning.

##### Function: `get_keywords`

##### Function Signature

```python
def get_keywords(client, sentence):
```

##### Parameters

- client: An instance of the OpenAI GPT-3.5 Turbo client, configured with your API key.
- sentence: The input sentence or text from the article that needs to be analyzed for relevance and keyword extraction.

##### Return Value

- The get_keywords function returns a dictionary with the following structure:
  ```TypeScript
  {
  "related": boolean,
  "keywords": string[]
  }
  ```
- If related is false, the article is discarded from further processing

### Redis Integration for Caching, Reverse-Indexing, and Semantic Search

#### Overview

This section provides insights into the integration of Redis, a high-performance in-memory data store, within the project. Redis plays a pivotal role in optimizing data retrieval, enabling semantic searches, and efficiently managing keyword associations within the context of news articles.

#### Redis Caching: Efficient Headline Data Storage

##### Purpose

Redis serves as a caching layer for storing and retrieving headline data acquired during the scraping process. Caching enhances performance by reducing the load on the backend server when quering headlines, by frontloading the work, and ensuring quick access to frequently requested data.

##### Implementation

- **Caching Logic**: Upon scraping articles, the project first checks if a headline already exists in the Redis cache. If not, it serializes the article's data, including its description, date, link, sentiment score, and keywords, and stores it in Redis as a hash set. Each headline's title acts as the key, while the serialized data serves as the value.
- **Benefits**: Redis caching minimizes the need for repetitive web scraping, shortcutting the rest of the serialization pipeline, and overall resulting in improved response times and system efficiency.

#### Keyword Reverse-Indexing: Efficient Keyword-Based Searches

##### Purpose

Using sets, I've created a keyword reverse index, allowing for efficient retrieval of headlines based on specific keywords. This feature increased UX dramatically by making key-word search and headline retrieval extremely fast.

##### Implementation

- **Reverse Index Structure**: For each keyword extracted from articles, a corresponding reverse index is established in Redis. This index associates keywords with the headlines that contain them, following this structure:
  `{ keyword: [headline1, headline2, ...] }`
- **Updates**: Whenever a new article is scraped, and keywords are identified, they are added to their respective reverse indexes or appended to existing sets if the keyword is already indexed.
- **Advantages**: The keyword reverse index accelerates keyword-based searches, enabling users to quickly find articles containing specific keywords or topics of interest.

#### Keyword Embeddings for Semantic Search: Semantic Insights

##### Purpose

To enable semantic search capabilities, the project leverages keyword embeddings. Embeddings represent keywords as vectors, facilitating similarity calculations and empowering semantic searches to discover related articles.

##### Implementation

- **Embedder Component**: A dedicated "Embedder" component is responsible for generating embeddings for keywords. It utilizes BERT-based models to tokenize and embed keywords, representing them as Float32Arrays.
- **Storage**: The resulting embeddings are stored in Redis as another hash set, with the keyword serving as the key and the embedding vector as the value.
- **Semantic Search**: Users can perform semantic searches by comparing keyword embeddings. Similarity scores are calculated to identify related keywords and, subsequently, articles.
- **Benefits**: Keyword embeddings enable advanced semantic search functionalities, simplifying the process of discovering articles related to specific topics or keywords.

#### Example Usage

Here's an example of how Redis caching and semantic search can be effectively used within the project:

1. **Keyword-Based Search**:

- Users enter keywords or topics of interest.
- The project queries Redis's keyword reverse index, swiftly obtaining a list of headlines that contain the specified keywords.

2. **Semantic Search**:

- Users input a keyword, and the project retrieves the keyword's embedding vector from Redis.
- By calculating similarity scores between the user's keyword and all other keywords in the Redis store, the project identifies articles associated with keywords that share the highest similarity.

## Backend Overview

The backend server is a crucial component of the system, responsible for handling requests from the frontend, performing keyword searches, and providing similar headlines based on user queries. It is implemented using Node.js and Express.js, offering a RESTful API for communication with the frontend and other system components.

### Routes and Functionality

#### Retrieve Headlines

- **Route**: `/`
- **Description**: This route allows users to retrieve all the headlines from the system. It provides a list of recent news articles related to crime in NYC.
- **Functionality**:
  - The backend fetches and returns all headlines from the available articles.

#### Keyword Search

- **Route**: `/search`
- **Description**: This route enables users to search for headlines based on specific keywords related to crime in NYC.

- **Functionality**:
  - Users can submit a list of keywords in the request body.
  - The backend searches its database for headlines containing any of the provided keywords and returns matching headlines.

#### Similar Headlines

- **Route**: `/similar`
- **Description**: This route offers users the ability to find headlines similar to a set of keywords. It uses similarity calculations to identify related articles.

- **Functionality**:

  - Users submit a list of keywords in the request body.
  - The backend performs similarity calculations to find headlines that are most similar to the provided keywords.
  - The most similar headlines are returned to the user.

- **Cosine Similarity Calculation**: The backend utilizes a cosine similarity function to calculate the similarity between keyword embeddings. The cosineSimilarity function takes two vectors and computes their cosine similarity score, which is used to rank headlines based on similarity.
- ```JavaScript
    function cosineSimilarity(vectorA, vectorB) {
      // ... Cosine similarity calculation logic ...
    }
  ```
- **Retrieving Top Matches for Keywords**: The backend provides a function named getTopMatchesForKeywords. This function takes a list of target keywords and returns the top matching headlines based on the similarity between the keywords and headline embeddings. It retrieves embeddings from Redis, calculates similarities using the function above, and ranks the headlines.

### Backend Functionality

- **Data Retrieval**: The backend interacts with a database of news articles and headlines, allowing users to retrieve relevant information.

- **Keyword Matching**: Through the keyword search route, users can find headlines that contain specific keywords of interest.

- **Similarity Calculation**: The backend employs similarity calculations to find headlines related to a set of keywords, providing users with a way to discover articles with similar content.

In summary, the backend plays a crucial role in the system by providing access to news headlines, enabling keyword searches, and offering functionality to find similar articles. It serves as the bridge between the frontend and the database, delivering relevant information to users based on their queries.

## Frontend

The frontend of the system is built using React.js.

### React.js Framework

- **React.js**: The frontend is developed using React.js, a powerful and efficient library for building interactive and dynamic user interfaces. React components are used to create a structured and modular UI.

### State Management

- **Zustand**: Zustand is utilized for state management within the frontend. It offers a simple and scalable solution for managing application state, making it easy to handle complex data and user interactions. State management allows for instant UI updates in response to user actions or data changes. I considered using React-Redux toolkit, but decided it was overkill for my usecase

### User Interface Design

- **Material-UI (MUI) Component Library**: Material-UI is employed to create a visually appealing and responsive user interface. It provides a comprehensive set of pre-designed React components that adhere to the Material Design guidelines, ensuring a consistent and modern look and feel.

### Data Visualization

- **D3.js**: D3.js is used for creating interactive and data-driven visualizations within the frontend. It enables the generation of graphs, charts, and other visual elements to present data in a clear and engaging manner. D3.js offers powerful tools for data manipulation and visualization, enhancing the overall user experience.

### Styling

- **Tailwind CSS**: Tailwind CSS is used for quick and efficient styling of components. It allows for the creation of custom styles using utility classes, making it easy to maintain and adapt the UI as needed.

### Components and Reusability

The frontend is organized into components and modules to ensure a modular and maintainable codebase. Reusable components play a significant role in achieving this goal:

- **HeadlineBox Component**: This reusable component displays a Card with the details of the headline. It is generate for every headline found and displayed on the frontend.
- **HeadlinesContainer Component**: This component displays a list of headlines. It can be utilized in multiple parts of the application to present headlines fetched from the backend. This component handles initial data fetching of headlines on first render and displaying all headline boxes. Tracks changes in headlines state to render new headlines or remove old ones. Makes use of react-window to lazy load headlines to prevent blocking the main thread. Also reduces Content layout shift due to differing number of headlines.
- **keyword Component**: Similar to the Headlines component, this reusable component displays a list of keywords or tags. It enhances the user experience when exploring related content. It allows users to easily see what keywords are being queried and remove them.
- **AreaChart Component**: The D3.js-powered graph component allows users to visualize average Sentiment of matched headlines over time. When the headlines found are updated, the chart is automatically updated to reflect the changes
- **Similarity Search Toggle**: Allows users the ability to turn off semantic search for their client. This results in the client retreiving headlines with exact keyword matches

### Folder Structure

The frontend codebase follows a structured organization to enhance maintainability and development efficiency:

- **/src/pages**: This directory contains all page routes, such as the Home page and Documentation page. Each page is a React component responsible for rendering specific views.
- **/src/components**: Reusable components that can be used in various parts of the application are stored here. Components like Headlines, Keywords, and Graphs can be easily incorporated into different pages or sections.
- **/src/styles**: All CSS and styling-related files are located in this directory. It ensures consistent and well-maintained styles throughout the application.
- **/src/store**: The store directory houses global state management using Zustand. It handles data fetching from the backend and allows state to be passed to any component without prop drilling. This centralized state management simplifies data sharing and ensures that UI updates are instantly reflected.

## Possible Improvements for Semantic Search and Analysis

In my continuous efforts to enhance the effectiveness and capabilities of my search and analysis system, I propose several improvements as follows:

### 1. Enhanced Semantic Search

#### Tokenization of Keywords

I suggest implementing a tokenization mechanism for keywords not already in my cache. This would involve breaking down non-cached keywords into their constituent tokens to identify more granular search matches. Tokenization will allow me to retrieve relevant articles that might have been previously missed due to differences in token structure.

#### Lemmatization

I recommend implementing lemmatization to prevent small variations in words from leading to mismatches. Lemmatization reduces words to their base or dictionary form, ensuring that my searches include different word forms of the same concept. This will improve the recall and precision of my search results.

### 2. Developing a Custom Classifier

#### Crime in NYC Classifier

To reduce my reliance on external dependencies like GPT-3.5 and gain more control over article classification, I could possibly train a custom model. Specifically, I can create a classifier that determines whether articles are related to "Crime in New York City." Training a custom model on labeled data will enable me to classify articles accurately and tailor the model to my specific needs.

### 3. Expanding My Data Sources

#### Web Scraping

I could considering web scraping from additional sources to increase the volume of articles available for search and analysis. By expanding my data sources, I can access a more comprehensive set of articles, providing users with a wider range of information to search from.

### 4. Improving Sentiment Analysis

#### Evaluating Alternative Models

I could explore alternative sentiment analysis models to identify the one that best suits my requirements. Evaluating different models and their performance will help me select a more accurate and reliable sentiment analysis tool for articles, enabling me to provide users with more meaningful insights.
