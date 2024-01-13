export enum Opcode{
    dispatch = 0,
    heartbeat = 1,
    identify = 2,
    presence_update = 3,
    voice_state_update = 4,
    resume = 6,
    reconnect = 7,
    req_guild_mem = 8,
    inv_session = 9,
    hello = 10,
    heartbeat_ack = 11
}
