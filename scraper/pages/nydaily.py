from page import Page
from .utils import convert_date
from bs4 import BeautifulSoup
import os

BASE_URL = os.getenv("NYDAILY_BASE_URL")

class NYDaily(Page):
    
    def __init__(self):
        super().__init__(BASE_URL)
            
    def get_headline(self,article):
        heading = article.find("a", class_="article-title")
       
        if (heading):
            heading = heading['title'].replace("\"", "").replace("\'","").replace(":","")
             
        return heading
    
    def get_description(self,article):
        description = article.find("div", class_="excerpt")
       
        if (description):
            description = description.get_text(strip=True).replace("\"", "").replace("\'","").replace(":","")
            
        return description 
    
    def get_date(self,article):
        date = article.find("time")
      
        if (date):
            date = convert_date(date['datetime'])
        
        return date

    def get_headline_link(self, article):
        link = article.find("a", class_="article-title")
        
        if (link):
            link = link['href']
            
        return link

    def get_articles(self,content):
        soup = BeautifulSoup(content, features="html.parser")
        articles = soup.find_all("article")
        return articles