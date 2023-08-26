export interface WelcomeScreen {
    description: string,
    welcome_channels: WelcomeScreenChannel[]
}

export interface WelcomeScreenChannel {
    channel_id: string,
    description: string,
    emoji_id: string,
    emoji_name: string
}
