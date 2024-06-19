from page import Page
from bs4 import BeautifulSoup
from .utils import convert_date
import os

BASE_URL = os.getenv("CBS_BASE_URL")


class CBS(Page):
    
    def __init__(self):
        super().__init__(BASE_URL)
            
    def get_headline(self,article):
        heading = article.find("h4", class_="item__hed")
       
        if (heading):
            heading = heading.get_text(strip=True).replace("\"", "").replace("\'","").replace(":","")
            
        return heading
    
    def get_description(self,article):
        description = article.find("p", class_="item__dek")
        
        if (description):
            description = description.get_text(strip=True).replace("\"", "").replace("\'","").replace(":","")
            
        return description 
    
    def get_date(self,article):
        date = article.find("li", class_="item__date")
        
        if (date):
            date = convert_date(date.get_text(strip=True))

        return date

    def get_headline_link(self, article):
        link = article.find("a", class_="item__anchor")

        if (link):
            link = link['href']
       
        return link


    def get_articles(self,content):
        soup = BeautifulSoup(content, features="html.parser")
        articles = soup.find_all("article")
        return articles