import axios, { AxiosInstance, Method } from "axios";
import BucketLimit from "./BucketLimit";

class RESTConnection {
    private static readonly API_URL = "https://discord.com/api/v"
    private static readonly MAX_GLOBAL_LIMIT = 50;
    private static readonly GLOBAL_RESET_TIME = 1000;

    private readonly api : AxiosInstance;
    private last_global_reset : Date;
    private global_remaining : number;

    private readonly buckets : Map<string, BucketLimit> = new Map();

    constructor(version : number, token : string) {
        this.api = axios.create({
            baseURL: `${RESTConnection.API_URL}${version}`,
            headers: {
                "Authorization": `Bot ${token}`,
                "User-Agent": `DiscordBot (${process.env.npm_package_homepage}, ${process.env.npm_package_version}) Node.js/${process.version}}`
            }
        });
        this.last_global_reset = new Date();
        this.global_remaining = RESTConnection.MAX_GLOBAL_LIMIT;
    }
  
    private async request(method : Method, url : string, data? : any) : Promise<any>{
        const now = new Date();
        if(this.global_remaining <= 0){
            const timeDiff = now.getTime() - this.last_global_reset.getTime();
            if(timeDiff < RESTConnection.GLOBAL_RESET_TIME){
                await new Promise(resolve => setTimeout(resolve, RESTConnection.GLOBAL_RESET_TIME - timeDiff));
                return this.request(method, url, data);
            }
            this.global_remaining = RESTConnection.MAX_GLOBAL_LIMIT;
            this.last_global_reset = now;
        }
        if(this.buckets.has(url)){
            const bucket = this.buckets.get(url);
            if(bucket.remaining <= 0){
                const timeDiff = now.getTime() - bucket.reset.getTime();
                if(timeDiff < bucket.resetAfter){
                    await new Promise(resolve => setTimeout(resolve, bucket.resetAfter - timeDiff));
                    return this.request(method, url, data);
                }
                bucket.remaining = bucket.limit;
                bucket.reset = now;
            }
            bucket.remaining--;
        }
        const response = await this.api.request({
            method: method,
            url: url,
            data: data
        });

        const bucket_name = response.headers["x-ratelimit-bucket"];
        const old_bucket = this.buckets.get(bucket_name);

        return response.data;
    }
}
