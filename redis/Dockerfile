FROM redis/redis-stack-server:latest

WORKDIR /app

COPY ./data /data
COPY ./redis.conf /redis-stack.conf


EXPOSE 6379

CMD ["redis-stack-server", "/redis-stack.conf"]
