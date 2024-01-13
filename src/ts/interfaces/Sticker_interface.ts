import { StickerType } from "../enums/StickerType_enum";
import { StickerFormatType } from "../enums/StickerFormatType_enum";
import { User } from "./User_interface";
export interface Sticker {
    id: string,
    pack_id?: string,
    name: string,
    description: string,
    tags: string,
    asset?: string,
    type: StickerType,
    format_type: StickerFormatType,
    available?: boolean,
    guild_id?: string,
    user?: User,
    sort_value?: number
}
