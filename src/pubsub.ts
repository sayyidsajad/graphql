import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

const redisOptions = {
  host: 'localhost',
  port: 6379,
  retryStrategy: (times: number) => Math.min(times * 50, 2000),
};

export const pubSub = new RedisPubSub({
  publisher: new Redis(redisOptions),
  subscriber: new Redis(redisOptions),
});