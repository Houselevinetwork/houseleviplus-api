import { Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@core/config/config.service';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const cacheProvider = configService.get('CACHE_PROVIDER') || 'memory';
        const redisTtl = parseInt(configService.get('REDIS_TTL') as string) || 3600;

        if (cacheProvider === 'redis') {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const redisStore = require('cache-manager-redis-store');
          const redisPassword = configService.get('REDIS_PASSWORD') || '';
          const options: any = {
            isGlobal: true,
            store: redisStore,
            host: configService.get('REDIS_HOST') || 'localhost',
            port: parseInt(configService.get('REDIS_PORT') as string) || 6379,
            ttl: redisTtl,
            max: 10000,
          };
          if (redisPassword && redisPassword.trim() !== '') {
            options.password = redisPassword;
          }
          return options;
        }

        return {
          isGlobal: true,
          ttl: redisTtl,
          max: 10000,
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {}