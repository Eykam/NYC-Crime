from page import Page
from .utils import convert_date
import json
import os
import re

BASE_URL = os.getenv("NBC_BASE_URL")

class NBC(Page):
    def __init__(self):
        super().__init__(BASE_URL)
            
    def get_headline(self,article):
        heading = article['title'].replace("\"", "").replace("\'","").replace(":","")
        return heading
    
    def get_description(self,article):
        description = article['summary']
        description = self.strip_text(description).replace("\"", "").replace("\'","").replace(":","")
        return description 
    
    def get_date(self,article):
        date = convert_date(article['date'])
        return date

    def get_articles(self,content):
        content = json.loads(content)
        articles= content['template_items']["items"]
        return articles
    
    def get_headline_link(self, article):
        link = article['link']
        return link
    
    def strip_text(self, text):
        return re.sub('<[^<]+?>', '', text)  