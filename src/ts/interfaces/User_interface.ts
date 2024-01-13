import { Locale } from "../enums/Locale_enum";
import { PremiumType } from "../enums/PremiumType_enum";
export interface User{
    id: string,
    username: string,
    discriminator: string,
    global_name: string,
    avatar: string,
    bot?: boolean,
    system?: boolean,
    mfa_enabled?: boolean,
    banner?: string,
    accent_color?: number,
    locale?: Locale,
    verified?: boolean,
    email?: string,
    flags?: number,
    premium_type?: PremiumType,
    public_flags?: number
    avatar_decoration?: string
}
