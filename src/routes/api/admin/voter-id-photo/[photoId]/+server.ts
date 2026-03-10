import { db } from '$lib/server/db';
import { getGcsStorageClient } from '$lib/server/utils/gcs-storage';
import { requireAdminSession } from '$lib/server/utils/require-admin-session';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

function parseGoogleStorageLocation(photoUrl: string): { bucketName: string; objectName: string } {
	if (photoUrl.startsWith('gs://')) {
		const withoutScheme = photoUrl.slice(5);
		const slashIndex = withoutScheme.indexOf('/');
		if (slashIndex <= 0 || slashIndex === withoutScheme.length - 1) {
			throw error(500, 'Invalid voter ID image URL configuration.');
		}

		return {
			bucketName: withoutScheme.slice(0, slashIndex),
			objectName: decodeURIComponent(withoutScheme.slice(slashIndex + 1))
		};
	}

	let parsedUrl: URL;
	try {
		parsedUrl = new URL(photoUrl);
	} catch {
		throw error(500, 'Invalid voter ID image URL configuration.');
	}

	if (parsedUrl.hostname === 'storage.googleapis.com') {
		const parts = parsedUrl.pathname.split('/').filter(Boolean);
		if (parts.length < 2) {
			throw error(500, 'Invalid voter ID image URL configuration.');
		}

		return {
			bucketName: parts[0],
			objectName: decodeURIComponent(parts.slice(1).join('/'))
		};
	}

	if (parsedUrl.hostname.endsWith('.storage.googleapis.com')) {
		const bucketName = parsedUrl.hostname.replace('.storage.googleapis.com', '');
		const objectName = parsedUrl.pathname.replace(/^\//, '');
		if (!bucketName || !objectName) {
			throw error(500, 'Invalid voter ID image URL configuration.');
		}

		return {
			bucketName,
			objectName: decodeURIComponent(objectName)
		};
	}

	throw error(500, 'Invalid voter ID image URL configuration.');
}

export const GET: RequestHandler = async ({ locals, params }) => {
	await requireAdminSession(locals);

	const photoRecord = await db.query.voterIdPhoto.findFirst({
		where: (vip, { eq }) => eq(vip.id, params.photoId)
	});

	if (!photoRecord) {
		throw error(404, 'Voter ID image not found.');
	}

	const { bucketName, objectName } = parseGoogleStorageLocation(photoRecord.photoUrl);
	const storage = getGcsStorageClient();
	const file = storage.bucket(bucketName).file(objectName);

	try {
		const [metadata] = await file.getMetadata();
		const [fileBuffer] = await file.download();
		const body = new Uint8Array(fileBuffer);

		return new Response(body, {
			headers: {
				'Content-Type': metadata.contentType ?? 'application/octet-stream',
				'Cache-Control': 'private, max-age=60'
			}
		});
	} catch (err) {
		console.error('Failed to load voter ID image from GCS:', err);
		throw error(500, 'Failed to load voter ID image.');
	}
};
