import { ActivityTypes } from "../enums/ActivityTypes_enums";

export interface Activity{
    name : string,
    type : ActivityTypes,
    url? : string,
    created_at : number,
    timestamps? : ActivityTimestamp,
    application_id? : string,
    details? : string,
    state? : string,
    emoji? : ActivityEmoji,
    party? : ActivityParty,
    assets? : ActivityAssets,
    secrets? : ActivitySecrets,
    instance? : boolean,
    flags? : number,
    buttons? : ActivityButtons[]
}

export interface ActivityTimestamp {
    start? : number,
    end? : number
}

export interface ActivityEmoji {
    name : string,
    id? : string,
    animated? : string
}

export interface ActivityParty {
    id? : string,
    size? : [number, number]
}

export interface ActivityAssets {
    large_image? : string,
    large_text? : string,
    small_image? : string,
    small_text? : string
}

export interface ActivitySecrets{
    join? : string,
    spectate? : string,
    match? : string
}

export interface ActivityButtons{
    label : string,
    url : string
}
