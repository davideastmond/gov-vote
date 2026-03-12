import z from 'zod';
type ValidationResponse = {
	success: boolean;
	error: string;
	message: string;
	details?: string[] | string;
};
export const extractValidationErrors = (err: unknown): ValidationResponse => {
	if (err instanceof z.ZodError) {
		const errors = err.issues.map((issue) => {
			const path = issue.path.join('.');
			return `${path || 'Root'}: ${issue.message}`;
		});
		return {
			success: false,
			error: 'Bad Request',
			message: 'Invalid request data',
			details: errors
		};
	}
	return {
		success: false,
		error: 'Bad Request',
		message: 'Invalid request data'
	};
};

export const extractValidationErrorsObject = (
	err: unknown
): Omit<ValidationResponse, 'error' | 'message' | 'details'> & {
	errors: Record<string, string>;
} => {
	if (err instanceof z.ZodError) {
		const errors: Record<string, string> = {};
		err.issues.forEach((issue) => {
			const path = issue.path.join('.');
			errors[path || 'root'] = issue.message;
		});
		return {
			success: false,
			errors
		};
	}
	return { success: false, errors: {} };
};
