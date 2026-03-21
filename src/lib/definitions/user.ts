export type UserRole = 'voter' | 'admin' | 'super_admin';
export const EDITABLE_USER_ROLE_VALUES = ['admin', 'voter'] as const;
export type EditableUserRole = (typeof EDITABLE_USER_ROLE_VALUES)[number];

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
