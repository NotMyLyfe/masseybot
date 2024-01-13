import axios, { AxiosInstance, Method } from "axios";
import BucketLimit from "@/bot/connection/BucketLimit";
import { RESTConnectionPromise } from "@/ts/interfaces";

class RESTConnection {
  private static readonly API_URL = "https://discord.com/api/v";
  private static readonly MAX_GLOBAL_LIMIT = 50;
  private static readonly GLOBAL_RESET_TIME = 1000;

  private readonly _api: AxiosInstance;
  private _last_global_reset: Date;
  private _global_remaining: number;

  private _is_fetching: boolean;
  private _queue: Array<RESTConnectionPromise>;

  private _buckets: Map<string, BucketLimit>;
  private _top_level_to_bucket: Map<string, string>;

  constructor(version: number, token: string) {
    this._api = axios.create({
      baseURL: `${RESTConnection.API_URL}${version}`,
      headers: {
        Authorization: `Bot ${token}`,
        "User-Agent": `DiscordBot (${process.env.npm_package_homepage}, ${process.env.npm_package_version}) Node.js/${process.version}}`,
      },
    });
    this._last_global_reset = new Date();
    this._global_remaining = RESTConnection.MAX_GLOBAL_LIMIT;

    this._is_fetching = false;
    this._queue = [];

    this._buckets = new Map();
  }

  private async _reset_dequeue(timeout?: number): Promise<void> {
    this._is_fetching = false;
    setTimeout(this._process_queue.bind(this), timeout);
  }

  private async _process_queue(): Promise<void> {
    if (this._queue.length === 0) {
      this._is_fetching = false;
      return;
    }

    if (this._is_fetching) return;

    this._is_fetching = true;

    if (this._global_remaining <= 0) {
      const timeDiff = Date.now() - this._last_global_reset.getTime();
      if (timeDiff < RESTConnection.GLOBAL_RESET_TIME) {
        return this._reset_dequeue(RESTConnection.GLOBAL_RESET_TIME - timeDiff);
      }
      this._global_remaining = RESTConnection.MAX_GLOBAL_LIMIT;
      this._last_global_reset = new Date();
    }

    let earliest_refresh = Number.MAX_SAFE_INTEGER;

    for (let i = 0; i < this._queue.length; i++) {
      const request = this._queue[i];

      let bucket: BucketLimit | undefined = undefined;

      if (!this._top_level_to_bucket.has(request.topLevelPath)) {
        this._top_level_to_bucket.set(request.topLevelPath, "");
      } else {
        const bucketName = this._top_level_to_bucket.get(request.topLevelPath);
        if (bucketName === "" || !bucketName) {
          earliest_refresh = 0;
          continue;
        }

        if (
          !this._buckets.has(bucketName) ||
          !(bucket = this._buckets.get(bucketName))
        ) {
          console.error(`Bucket ${bucketName} not found!`);
          this._top_level_to_bucket.delete(request.topLevelPath);
          earliest_refresh = 0;
          continue;
        }

        if (bucket.isFetching) {
          earliest_refresh = 0;
          continue;
        }

        bucket.isFetching = true;

        if (bucket.remaining <= 0 && bucket.reset.getTime() > Date.now()) {
          earliest_refresh = Math.min(earliest_refresh, bucket.reset.getTime());
          bucket.isFetching = false;
          continue;
        }
      }

      return this._reset_dequeue();
    }

    return this._reset_dequeue(earliest_refresh - Date.now());
  }

  private async _request_enqueue(
    method: Method,
    topLevelPath: string,
    path: string,
    data?: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this._queue.push({ method, topLevelPath, path, resolve, reject, data });
      this._process_queue();
    });
  }
}
