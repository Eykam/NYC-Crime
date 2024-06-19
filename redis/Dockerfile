FROM redis:latest

WORKDIR /app

COPY ./data ./data
COPY ./redis.conf ./redis.conf


EXPOSE 6379

CMD ["redis-server", "./redis.conf"]
