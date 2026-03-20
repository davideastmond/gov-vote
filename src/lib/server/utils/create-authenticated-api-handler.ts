import { json, type RequestEvent } from '@sveltejs/kit';
import type { ZodSchema } from 'zod';
import { adminAuthorizationGuard } from './admin-authorization-guard';
import { extractValidationErrors } from './extract-validation-errors';

export type ApiHandlerOptions<T> = {
	/** Whether to require admin authorization. Defaults to true. */
	requireAuth?: boolean;
	/** Zod schema for validating the request body */
	validator?: ZodSchema;
	/** The handler function that contains business logic */
	handler: (data: T, event: RequestEvent) => Promise<Response>;
};

/**
 * Creates a standardized API handler with built-in:
 * - Authorization guard (optional)
 * - JSON parsing with error handling
 * - Zod validation with error extraction
 * - Business logic error wrapping
 *
 * @param options Configuration for the handler
 * @returns Async function to use as a RequestHandler
 */
export function createAuthenticatedApiHandler<T = unknown>(options: ApiHandlerOptions<T>) {
	const { requireAuth = true, validator, handler } = options;

	return async (event: RequestEvent): Promise<Response> => {
		// Step 1: Authorization check
		if (requireAuth) {
			try {
				await adminAuthorizationGuard(event);
			} catch (error) {
				return json(
					{
						success: false,
						error: 'Unauthorized',
						message:
							'You must be an authenticated admin user or provide valid authentication credentials to access this endpoint.',
						details: error instanceof Error ? error.message : 'Unknown error'
					},
					{ status: 400 }
				);
			}
		}

		// Step 2: Parse JSON body
		let parsedBody: unknown;
		try {
			parsedBody = await event.request.json();
		} catch (error) {
			return json(
				{
					success: false,
					error: 'Bad Request',
					message: 'Request body must be valid JSON.'
				},
				{ status: 400 }
			);
		}

		// Step 3: Validate against schema if provided
		if (validator) {
			try {
				validator.parse(parsedBody);
			} catch (err) {
				return json(extractValidationErrors(err), { status: 400 });
			}
		}

		// Step 4: Execute handler with business logic
		try {
			return await handler(parsedBody as T, event);
		} catch (err) {
			console.error('Error in API handler:', err);
			return json(
				{
					success: false,
					error: 'Internal Server Error',
					message: 'An error occurred while processing your request.',
					details: err instanceof Error ? err.message : 'Unknown error'
				},
				{ status: 500 }
			);
		}
	};
}
