import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

class RedisService {
  constructor() {
    this.client = null;
    this.isLive = false;
    this.virtualStore = new Map();
    this.virtualTimers = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      commandsProcessed: 0,
      startedAt: Date.now(),
    };

    this.init();
  }

  init() {
    const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

    try {
      this.client = new Redis(redisUrl, {
        lazyConnect: true,
        connectTimeout: 2000,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        retryStrategy(times) {
          // Stop retrying quickly if local Redis is not running to avoid terminal noise
          if (times > 2) return null;
          return Math.min(times * 1000, 2000);
        },
      });

      this.client.on('connect', () => {
        this.isLive = true;
        console.log(`[Redis Connected]: Live Redis server active at ${redisUrl}`);
      });

      this.client.on('error', (err) => {
        if (this.isLive) {
          console.warn(`[Redis Notice]: Connection dropped (${err.message}). Transitioning to Virtual In-Memory Redis.`);
        }
        this.isLive = false;
      });

      // Attempt single connect attempt
      this.client.connect().catch(() => {
        this.isLive = false;
        console.info('[Redis Engine]: Live daemon not detected. Operating in High-Speed Virtual Redis Mode (In-Memory Key-Value Cache with TTL & Pattern Invalidation).');
      });
    } catch (err) {
      this.isLive = false;
      console.info('[Redis Engine]: Operating in High-Speed Virtual Redis Mode.');
    }
  }

  // GET Key
  async get(key) {
    this.stats.commandsProcessed += 1;
    if (this.isLive && this.client) {
      try {
        const val = await this.client.get(key);
        if (val !== null && val !== undefined) {
          this.stats.hits += 1;
          try {
            return JSON.parse(val);
          } catch {
            return val;
          }
        }
        this.stats.misses += 1;
        return null;
      } catch (err) {
        // Fallback to virtual memory on live error
      }
    }

    // Virtual In-Memory Redis
    if (this.virtualStore.has(key)) {
      this.stats.hits += 1;
      const stored = this.virtualStore.get(key);
      try {
        return JSON.parse(stored);
      } catch {
        return stored;
      }
    }
    this.stats.misses += 1;
    return null;
  }

  // SET Key with TTL (EX in seconds)
  async set(key, value, ...args) {
    this.stats.commandsProcessed += 1;
    const stringVal = typeof value === 'object' ? JSON.stringify(value) : String(value);

    // Extract EX ttl if passed
    let ttlSeconds = 3600; // default 1 hour
    for (let i = 0; i < args.length; i++) {
      if (String(args[i]).toUpperCase() === 'EX' && args[i + 1]) {
        ttlSeconds = Number(args[i + 1]) || 3600;
        break;
      }
    }

    if (this.isLive && this.client) {
      try {
        await this.client.set(key, stringVal, 'EX', ttlSeconds);
      } catch (err) {
        // Fallback to virtual memory
      }
    }

    // Always mirror to virtual store for seamless fallback resilience
    this.virtualStore.set(key, stringVal);
    if (this.virtualTimers.has(key)) {
      clearTimeout(this.virtualTimers.get(key));
    }
    if (ttlSeconds > 0) {
      const timer = setTimeout(() => {
        this.virtualStore.delete(key);
        this.virtualTimers.delete(key);
      }, ttlSeconds * 1000);
      this.virtualTimers.set(key, timer);
    }

    return 'OK';
  }

  // DEL single or multiple keys
  async del(...keys) {
    this.stats.commandsProcessed += 1;
    if (this.isLive && this.client) {
      try {
        await this.client.del(...keys);
      } catch {
        // Continue to virtual memory
      }
    }

    for (const key of keys) {
      this.virtualStore.delete(key);
      if (this.virtualTimers.has(key)) {
        clearTimeout(this.virtualTimers.get(key));
        this.virtualTimers.delete(key);
      }
    }
    return keys.length;
  }

  // Delete all keys matching a wild-card pattern (e.g. crm:bills:*)
  async delByPattern(pattern) {
    this.stats.commandsProcessed += 1;
    const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const matchedKeys = [];

    // Find in virtual store
    for (const key of this.virtualStore.keys()) {
      if (regexPattern.test(key)) {
        matchedKeys.push(key);
      }
    }

    // Find in live Redis if active
    if (this.isLive && this.client) {
      try {
        const liveKeys = await this.client.keys(pattern);
        if (Array.isArray(liveKeys) && liveKeys.length > 0) {
          await this.client.del(...liveKeys);
          for (const k of liveKeys) {
            if (!matchedKeys.includes(k)) matchedKeys.push(k);
          }
        }
      } catch {
        // Ignore live error
      }
    }

    // Delete in virtual store
    for (const key of matchedKeys) {
      this.virtualStore.delete(key);
      if (this.virtualTimers.has(key)) {
        clearTimeout(this.virtualTimers.get(key));
        this.virtualTimers.delete(key);
      }
    }

    return matchedKeys.length;
  }

  // KEYS matching pattern
  async keys(pattern = '*') {
    this.stats.commandsProcessed += 1;
    const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const allKeys = new Set();

    for (const key of this.virtualStore.keys()) {
      if (regexPattern.test(key)) {
        allKeys.add(key);
      }
    }

    if (this.isLive && this.client) {
      try {
        const liveKeys = await this.client.keys(pattern);
        if (Array.isArray(liveKeys)) {
          liveKeys.forEach((k) => allKeys.add(k));
        }
      } catch {
        // Ignore
      }
    }

    return Array.from(allKeys);
  }

  // FLUSHALL
  async flushAll() {
    this.stats.commandsProcessed += 1;
    if (this.isLive && this.client) {
      try {
        await this.client.flushall();
      } catch {
        // Ignore
      }
    }

    for (const timer of this.virtualTimers.values()) {
      clearTimeout(timer);
    }
    this.virtualTimers.clear();
    const count = this.virtualStore.size;
    this.virtualStore.clear();
    return count;
  }

  // Detailed telemetry for Super Admin control and UI display
  getStatus() {
    const totalHits = this.stats.hits;
    const totalMisses = this.stats.misses;
    const totalRequests = totalHits + totalMisses;
    const hitRate = totalRequests > 0 ? ((totalHits / totalRequests) * 100).toFixed(1) : '100.0';

    // Approximate memory footprint
    let approxBytes = 0;
    for (const [k, v] of this.virtualStore.entries()) {
      approxBytes += (k.length + String(v).length) * 2;
    }
    const memoryKb = (approxBytes / 1024).toFixed(2);

    return {
      connected: true,
      isLive: this.isLive,
      mode: this.isLive ? 'Live Redis Server' : 'Virtual High-Speed Redis Engine',
      engine: this.isLive ? 'ioredis (Cluster/Standalone)' : 'In-Memory Key-Value Store (Redis Semantics)',
      host: this.isLive ? (process.env.REDIS_URL || '127.0.0.1:6379') : 'internal://virtual-memory',
      keysCount: this.virtualStore.size,
      hits: totalHits,
      misses: totalMisses,
      hitRate: `${hitRate}%`,
      commandsProcessed: this.stats.commandsProcessed,
      memoryUsage: `${memoryKb} KB`,
      uptimeSeconds: Math.floor((Date.now() - this.stats.startedAt) / 1000),
      timestamp: new Date().toISOString(),
    };
  }

  // Detailed key inspection for the Super Admin Cache Inspector
  async getKeyDetails() {
    const result = [];
    for (const [key, val] of this.virtualStore.entries()) {
      let preview = '';
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          preview = `Array [${parsed.length} items]`;
        } else if (typeof parsed === 'object') {
          preview = `Object {${Object.keys(parsed).slice(0, 3).join(', ')}...}`;
        } else {
          preview = String(parsed).slice(0, 60);
        }
      } catch {
        preview = String(val).slice(0, 60);
      }

      result.push({
        key,
        sizeBytes: (key.length + String(val).length) * 2,
        preview,
        ttlSeconds: 3600,
        type: key.split(':')[1] || 'generic',
      });
    }
    return result;
  }
}

export const redisService = new RedisService();
export default redisService;
