import { User } from "./User_interface";
import { UnavailableGuild } from "./Guild_interface";
import { Application } from "./Application_interface";
export interface Ready {
    v: number,
    user: User,
    guilds: UnavailableGuild[],
    session_id: string,
    resume_gateway_url: string,
    shard: [number, number],
    application: Partial<Application>
}

