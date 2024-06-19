FROM redis/redis-stack:latest

WORKDIR /app

COPY ./data /app/data
COPY ./redis.conf ./redis.conf


EXPOSE 6379

CMD ["redis-stack-server", "./redis.conf"]
