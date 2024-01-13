import { User } from "./User_interface";
export interface Emoji {
    id: string,
    name: string,
    roles?: string[],
    user?: User,
    require_colons?: boolean,
    managed?: boolean,
    animated?: boolean,
    available?: boolean
}
