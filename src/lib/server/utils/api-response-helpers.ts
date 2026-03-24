import { json } from '@sveltejs/kit';

/**
 * Returns a standardized 400 Unauthorized JSON response.
 * Used when an admin auth guard fails.
 */
export function apiUnauthorized(details?: string): Response {
	return json(
		{
			success: false,
			error: 'Unauthorized',
			message:
				'You must be an authenticated admin user or provide valid authentication credentials to access this endpoint.',
			...(details !== undefined ? { details } : {})
		},
		{ status: 400 }
	);
}

/**
 * Returns a standardized 400 Bad Request JSON response.
 * Defaults to the common "Request body must be valid JSON." message.
 */
export function apiBadRequest(message = 'Request body must be valid JSON.'): Response {
	return json(
		{
			success: false,
			error: 'Bad Request',
			message
		},
		{ status: 400 }
	);
}

/**
 * Returns a standardized 500 Internal Server Error JSON response.
 */
export function apiInternalError(
	message = 'An error occurred while processing your request.',
	details?: string
): Response {
	return json(
		{
			success: false,
			error: 'Internal Server Error',
			message,
			...(details !== undefined ? { details } : {})
		},
		{ status: 500 }
	);
}
