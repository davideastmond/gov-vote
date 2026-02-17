export type UserRole = 'voter' | 'admin' | 'super_admin';
export type User = {
	id: string;
	username: string;
	email: string;
	firstName: string;
	lastName: string;
	role: UserRole;
};

export type Admin = User & {
	role: Extract<UserRole, 'admin' | 'super_admin'>;
};
