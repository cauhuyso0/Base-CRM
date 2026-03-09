export interface LoginDto {
    username: string;
    password: string;
}
export interface RegisterDto {
    companyId: number;
    branchId?: number;
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
}
export interface AuthResponse {
    access_token: string;
    user: {
        id: number;
        uuid: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        company: {
            id: number;
            name: string;
        };
        branch: {
            id: number;
            name: string;
        } | null;
        roles: {
            id: number;
            name: string;
        }[];
    };
}
export interface UserProfile {
    id: number;
    uuid: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    companyId: number;
    branchId?: number;
    company: {
        id: number;
        name: string;
    };
    branch: {
        id: number;
        name: string;
    } | null;
    roles: {
        id: number;
        name: string;
    }[];
}
