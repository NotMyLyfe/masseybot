import { TeamMembershipState } from "../enums/TeamMembershipState_enum";
import { User } from "./User_interface";

export interface Team {
    icon: string,
    id: string,
    members: TeamMember[],
    name: string,
    owner_user_id: string
}

export interface TeamMember {
    membership_state: TeamMembershipState,
    team_id: string,
    user: Partial<User>,
    role: string
}
