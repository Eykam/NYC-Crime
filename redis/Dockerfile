FROM redis/redis-stack-server:latest

WORKDIR /

COPY ./data/ /data
COPY ./redis.conf /redis-stack.conf


EXPOSE 6379

CMD ["redis-stack-server"]
