import re
import os
import redis
import time

REDIS_HOST  = os.getenv("REDIS_HOST")
REDIS_PORT = os.getenv("REDIS_PORT")
REDIS_DB = os.getenv("REDIS_DB")

def connect_to_redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB):
    return redis.Redis(host=host, port=port, db=db)

def check_headline_exists(redis_conn, keyword):
    return redis_conn.hexists("headlines", keyword)

def store_headline(redis_conn, headline, serialized_headline):
    repeat = check_headline_exists(redis_conn, headline)
    if not repeat:
        redis_conn.hset("headlines", headline, str(serialized_headline))

def store_keywords_reverse_index(redis_conn, headline, keywords):
    for keyword in keywords:
        keyword = keyword.lower()
        subwords = re.split(r'[^a-zA-Z0-9]+(?=[:])|[^a-zA-Z0-9]+', keyword)
        for word in subwords:
            redis_conn.rpush("keywords:" + word.replace(":","-"), headline)
            
        #TODO: ADD LOGIC TO UPDATE LAST UPDATED TIMESTAMP
        
def update_timestamp(redis_conn):
    curr_time = int(time.time())
    redis_conn.set("last_updated", curr_time)