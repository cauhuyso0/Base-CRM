export interface LoginRequest {
    username: string;
    password: string;
}
export interface RegisterRequest {
    companyId: number;
    branchId?: number;
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
}
