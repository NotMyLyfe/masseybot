import { Activity } from "./Activity_interface";
import { Status } from "../enums/Status_enums";

export interface PresenceUpdate {
    since : number,
    activities : Activity[];
    status : Status,
    afk : boolean
}
