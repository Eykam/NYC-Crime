FROM redis/redis-stack-server:latest

WORKDIR /

COPY ./data/ /data
COPY ./redis.conf /opt/redis-stack/etc/


EXPOSE 6379

CMD ["redis-stack-server", "--dir", "/data"]
