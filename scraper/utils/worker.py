import os
import requests
import threading
from redisDriver import connect_to_redis, store_headline, store_keywords_reverse_index, check_headline_exists, update_timestamp
from keywordGenerator import get_GPT_client, get_keywords
from embedder import create_embedder, embed_keywords
from transformers import pipeline


PAGE_LIMIT = int(os.getenv("PAGE_LIMIT"))
SENTIMENT_MODEL = os.getenv("SENTIMENT_MODEL")


class Worker:
    def __init__(self, page):
        self.PAGE_LIMIT = PAGE_LIMIT
        self.page = page
        self.headlines = {}
        self.sentiment_pipeline = pipeline(model=SENTIMENT_MODEL, top_k=None)
        self.redis = connect_to_redis()
        self.GPT_client = get_GPT_client()
        self.embedder = create_embedder()
    
    def serialize_headline(self, article, headline):
        description = self.page.get_description(article)
        date = self.page.get_date(article)
        link = self.page.get_headline_link(article)
        
        if (headline and description):
            
            data = headline + " " + description
            
            exists = check_headline_exists(self.redis, headline)
            
            if not exists:
                keywords = get_keywords(self.GPT_client, data)
                
                if (keywords and keywords['related']):
                    
                        
                    keywords = keywords['keywords']
                    keywords = [keyword.replace("\"","").replace("\'","") for keyword in keywords]
                    
                    sentiment = self.score_sentiment(data)
                    
                    serialized = {
                                "description": description,
                                "date": date,
                                "link": link,
                                "sentiment" : sentiment,
                                "keywords" : keywords
                    }
                        
                    store_headline(self.redis, headline, serialized)
                    store_keywords_reverse_index(self.redis, headline, keywords)
                    embed_keywords(self.embedder, self.redis, keywords)
                    update_timestamp(self.redis)
                        
                    return serialized
        
        return None
        
    
    
    def score_sentiment(self, data):
        sentiments = {}
        
        scores = self.sentiment_pipeline(data)[0]
         
        for score in scores:
            label = score['label']
            sentiments[label] = score['score']
        
        
        most_likely = max(sentiments, key=sentiments.get)

        sentiment = sentiments[most_likely]
        
        match most_likely:
            case "neutral":
                sign = -1 + sentiment if sentiments['negative'] > sentiments['positive'] else 1 - sentiment
                sentiment *= sign
            case "negative":
                sentiment *= -1
            case "positive":
                pass
            

        return sentiment
    
    
    def scrape_page(self, page_num):
        print("=================================================", flush=True)
        print("Scraping Page", page_num,  flush=True)
        
        headlines = {}
         
        try:
            url = self.page.get_url(page_num)
            response = requests.get(url)
            content = response.content
            articles = self.page.get_articles(content)
            
            for article in articles:
                headline = self.page.get_headline(article)
                
                serialized_headline = self.serialize_headline(article, headline)
                
                if (serialized_headline):
                    headlines[headline] = serialized_headline

        except Exception as e:
            print("Failed to scrape page:", e, flush=True)
        
        finally:
            self.headlines.update(headlines)

    def scrape_pages(self):
      
        threads = []
        for page_num in range(self.PAGE_LIMIT):
            thread = threading.Thread(target=self.scrape_page, args=(str(page_num)))
            threads.append(thread)
            thread.start()

        # Wait for all threads to finish
        for thread in threads:
            thread.join()
    
    
    def get_headlines(self):
        return self.headlines
                  
