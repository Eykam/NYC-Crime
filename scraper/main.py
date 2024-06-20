from dotenv import load_dotenv, find_dotenv

try:
    load_dotenv(find_dotenv())
except Exception as e:
    print("Error loading dotenv")
    print(e)
    
from utils import Worker
from pages import CBS, NBC, NYDaily
import os


PAGE_MAP = {
    0 : CBS,
    1 : NBC,
    2 : NYDaily
}

def main():
    page = get_page_from_service_label()
    print(f"=========================================== Initializing Page ============================================")
    if (page):
        worker = Worker(page)
        worker.scrape_pages()
        headlines = worker.get_headlines()
        print("Headlines:", headlines)
        print("Done!")
    

def get_page_from_service_label():
    label = int(os.getenv('SERVICE_LABEL'))
    
    print(f"This container is replica number {label}")
    return PAGE_MAP[label]()

if __name__ == "__main__":
    main()
    exit(0)