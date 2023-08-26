export interface Role{
    id: string,
    name: string,
    color: number,
    hoist: boolean,
    icon?: string,
    unicode_emoji?: string,
    position: number,
    permissions: string,
    managed: boolean,
    mentionable: boolean,
    tags?: RoleTag,
    flags: number
}

export interface RoleTag {
    bot_id?: string,
    integration_id?: string,
    premium_subscriber?: null,
    subscription_listing_id? : string,
    available_for_purchase?: null,
    guild_connections? : null
}
