import { env } from '$env/dynamic/private';
import { Storage } from '@google-cloud/storage';

type ServiceAccountCredentials = {
	client_email: string;
	private_key: string;
};

function parseServiceAccountJson(jsonString: string): ServiceAccountCredentials {
	let parsed: unknown;

	try {
		parsed = JSON.parse(jsonString);
	} catch {
		throw new Error('Invalid GCP service account JSON in environment variable.');
	}

	if (
		typeof parsed !== 'object' ||
		parsed === null ||
		!('client_email' in parsed) ||
		!('private_key' in parsed)
	) {
		throw new Error('GCP service account JSON is missing client_email or private_key.');
	}

	const clientEmail = (parsed as Record<string, unknown>).client_email;
	const privateKey = (parsed as Record<string, unknown>).private_key;

	if (typeof clientEmail !== 'string' || typeof privateKey !== 'string') {
		throw new Error('GCP service account client_email/private_key must be strings.');
	}

	return {
		client_email: clientEmail,
		private_key: privateKey
	};
}

function getServiceAccountCredentialsFromEnv(): ServiceAccountCredentials | null {
	if (env.GCP_SERVICE_ACCOUNT_KEY_JSON) {
		return parseServiceAccountJson(env.GCP_SERVICE_ACCOUNT_KEY_JSON);
	}

	if (env.GCP_SERVICE_ACCOUNT_KEY_BASE64) {
		const decoded = Buffer.from(env.GCP_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf8');
		return parseServiceAccountJson(decoded);
	}

	return null;
}

export function getGcsStorageClient(): Storage {
	const projectId = env.GCP_PROJECT_ID;
	const credentials = getServiceAccountCredentialsFromEnv();

	if (credentials) {
		return new Storage({
			projectId,
			credentials
		});
	}

	if (projectId) {
		return new Storage({ projectId });
	}

	return new Storage();
}
