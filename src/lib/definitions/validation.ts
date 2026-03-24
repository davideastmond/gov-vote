export type ValidationResponse = {
	success: boolean;
	error: string;
	message: string;
	details?: string[] | string;
};

export type ValidationErrorsObject = {
	success: boolean;
	errors: Record<string, string>;
};
