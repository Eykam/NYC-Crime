from abc import ABC, abstractmethod 

class Page(ABC):
    def __init__(self, url):
        self.url = url

    @abstractmethod
    def get_headline():
        pass
    
    @abstractmethod
    def get_description():
        pass
    
    @abstractmethod
    def get_date():
        pass
    
    @abstractmethod
    def get_articles():
        pass
    
    @abstractmethod
    def get_headline_link():
        pass
        
    
    def get_url(self, page):
        return self.url + str(page)
    