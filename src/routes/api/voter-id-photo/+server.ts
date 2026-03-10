import { db } from '$lib/server/db';
import { voterCard, voterIdPhoto } from '$lib/server/db/schema';
import { getGcsStorageClient } from '$lib/server/utils/gcs-storage';
import { verifyJWT } from '$lib/server/utils/jwt/jwt';
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { and, eq, or } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

const VOTER_ID_BUCKET = 'gv-voter-data';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function getFileExtension(file: File): string {
	const extensionFromName = file.name.split('.').pop()?.toLowerCase();
	if (extensionFromName && extensionFromName.length <= 8) {
		return extensionFromName;
	}

	if (file.type === 'image/jpeg') return 'jpg';
	if (file.type === 'image/png') return 'png';
	if (file.type === 'image/webp') return 'webp';
	if (file.type === 'image/heic') return 'heic';

	return 'bin';
}

export const POST: RequestHandler = async (event) => {
	const voterToken = event.cookies.get('voter_token');
	if (!voterToken) {
		return json(
			{ success: false, message: 'Unauthorized request: missing token.' },
			{ status: 401 }
		);
	}

	let voterCardCode: string;
	try {
		const decodedToken = await verifyJWT<{ sub: string }>(voterToken);
		voterCardCode = decodedToken.sub;
	} catch {
		return json(
			{ success: false, message: 'Unauthorized request: invalid token.' },
			{ status: 401 }
		);
	}

	const formData = await event.request.formData();
	const idPhoto = formData.get('idPhoto');

	if (!(idPhoto instanceof File)) {
		return json({ success: false, message: 'ID photo is required.' }, { status: 400 });
	}

	if (!idPhoto.type.startsWith('image/')) {
		return json({ success: false, message: 'ID photo must be an image file.' }, { status: 400 });
	}

	if (idPhoto.size <= 0 || idPhoto.size > MAX_FILE_SIZE_BYTES) {
		return json(
			{ success: false, message: 'ID photo must be greater than 0 bytes and less than 10MB.' },
			{ status: 400 }
		);
	}

	const extension = getFileExtension(idPhoto);
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	const objectName = `voter-id-photos/${voterCardCode}/${timestamp}-${randomUUID()}.${extension}`;

	const activeOrGeneratedCard = await db.query.voterCard.findFirst({
		where: and(
			eq(voterCard.cardCode, voterCardCode),
			or(eq(voterCard.cardStatus, 'active'), eq(voterCard.cardStatus, 'generated'))
		)
	});

	if (!activeOrGeneratedCard) {
		return json(
			{ success: false, message: 'Unauthorized request: invalid voter card.' },
			{ status: 401 }
		);
	}

	try {
		const storage = getGcsStorageClient();
		const bucket = storage.bucket(VOTER_ID_BUCKET);
		const fileBuffer = Buffer.from(await idPhoto.arrayBuffer());

		await bucket.file(objectName).save(fileBuffer, {
			contentType: idPhoto.type,
			resumable: false,
			metadata: {
				cacheControl: 'private, max-age=0, no-transform',
				metadata: {
					voterCardCode,
					uploadedAt: new Date().toISOString()
				}
			}
		});

		const photoUrl = `https://storage.googleapis.com/${VOTER_ID_BUCKET}/${objectName}`;
		const now = new Date();

		const existingPhoto = await db.query.voterIdPhoto.findFirst({
			where: and(
				eq(voterIdPhoto.userId, activeOrGeneratedCard.userId),
				eq(voterIdPhoto.contestGroupId, activeOrGeneratedCard.contestGroupId)
			)
		});

		if (existingPhoto) {
			await db
				.update(voterIdPhoto)
				.set({
					photoUrl,
					updatedAt: now
				})
				.where(eq(voterIdPhoto.id, existingPhoto.id));
		} else {
			await db.insert(voterIdPhoto).values({
				id: randomUUID(),
				userId: activeOrGeneratedCard.userId,
				contestGroupId: activeOrGeneratedCard.contestGroupId,
				photoUrl,
				createdAt: now,
				updatedAt: now
			});
		}

		return json({
			success: true,
			bucket: VOTER_ID_BUCKET,
			objectName,
			photoUrl
		});
	} catch (error) {
		console.error('Failed to upload voter ID image to GCS:', error);
		return json(
			{ success: false, message: 'Failed to upload ID photo. Please try again.' },
			{ status: 500 }
		);
	}
};
