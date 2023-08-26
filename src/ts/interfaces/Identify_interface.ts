import { PresenceUpdate } from "./PresenceUpdate_interface"
export interface Identify {
    token : string,
    properties : {
        os : string,
        browser : string,
        device : string
    },
    compress? : boolean,
    large_threadshold? : number,
    shard? : [number, number],
    presence? : PresenceUpdate,
    intents : number
}
