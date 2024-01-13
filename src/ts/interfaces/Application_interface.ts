import { User } from "./User_interface";
import { Team } from "./Team_interface";
import { Guild } from "./Guild_interface";
import { InstallParams } from "./InstallParams_interface";
export interface Application {
    id: string,
    name: string,
    icon: string,
    description: string,
    rpc_origins?: string[],
    bot_public: boolean,
    bot_require_code_grant: boolean,
    terms_of_service_url?: string,
    privacy_policy_url?: string,
    owner: Partial<User>,
    summary? : "", // Remove in v11, deprecated, included just in case
    verify_key: string,
    team: Team,
    guild_id?: string,
    guild: Partial<Guild>,
    primary_sku_id?: string,
    slug?: string,
    cover_image?: string,
    flags?: number
    approximate_guild_count?: number,
    tags?: string[],
    install_params?: InstallParams,
    custom_install_url?: string,
    role_connections_verification_url?: string    
}
