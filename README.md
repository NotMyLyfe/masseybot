# MasseyBot

MasseyBot is a Discord verification system for use by schools or organizations who want to verify that the people who are joining their Discord servers are permitted to be there.

Notable features:
- Single verification unlocks all servers
    - Verification only needs to be completed once to be effective across all servers using the same MasseyBot instance
- Automatic error detection
    - Permissions/set up errors are automatically detected and checked in the background to ensure the bot functions as expected
- Background workers
    - Ensures that the main thread is not busy while verifying server configuration and roles
- hCaptcha verification
    - Prevents spam and automatic verifications from email providers who click all the links in an email
- And more...
    - Contributions are always welcome!
  
License: MIT