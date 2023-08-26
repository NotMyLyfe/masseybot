import { VerificationLevel } from "../enums/VerificationLevel_enum";
import { DefaultMessageNotificationLevel } from "../enums/DefaultMessageNotificationLevel_enum";
import { ExplicitContentFilterLevel } from "../enums/ExplicitContentFilterLevel_enum";
import { Role } from "./Role_interface";
import { Emoji } from "./Emoji_interface";
import { GuildFeature } from "../enums/GuildFeature_enum";
import { MFALevel } from "../enums/MFALevel_enum";
import { PremiumTier } from "../enums/PremiumTier_enum";
import { Locale } from "../enums/Locale_enum";
import { WelcomeScreen } from "./WelcomeScreen_interface";
import { NSFWLevel } from "../enums/NSFWLevel_enum";
import { Sticker } from "./Sticker_interface";
export interface Guild {
    id: string,
    name: string,
    icon: string,
    icon_hash?: string,
    splash: string,
    discovery_splash: string,
    owner? : boolean,
    owner_id: string,
    permissions?: string,
    region?: string,
    afk_channel_id: string,
    afk_timeout: number,
    widget_enabled?: boolean,
    widget_channel_id?: string,
    verification_level: VerificationLevel,
    default_message_notifications: DefaultMessageNotificationLevel,
    explicit_content_filter: ExplicitContentFilterLevel,
    roles: Role[],
    emojis: Emoji[],
    features: GuildFeature[],
    mfa_level: MFALevel,
    application_id: string,
    system_channel_id: string,
    system_channel_flags: number,
    rules_channel_id: string,
    max_presences?: number,
    max_members?: number,
    vanity_url_code: string,
    description: string,
    banner: string,
    premium_tier: PremiumTier,
    premium_subscription_count?: number,
    preferred_locale: Locale,
    public_updates_channel_id: string,
    max_video_channel_users?: number,
    max_stage_video_channel_users?: number,
    approximate_member_count?: number,
    approximate_presence_count?: number,
    welcome_screen?: WelcomeScreen,
    nsfw_level: NSFWLevel,
    stickers?: Sticker[],
    premium_progress_bar_enabled: boolean,
    safety_alerts_channel_id: boolean
}

export interface GuildPreview {
    id: string,
    name: string,
    icon: string,
    splash: string,
    discovery_splash: string,
    emojis: Emoji[],
    features: GuildFeature[],
    approximate_member_count: number,
    approximate_presence_count: number,
    description: string,
    stickers: Sticker[],
}

export interface UnavailableGuild extends Partial<Guild> {
    unavailable: boolean;
}
