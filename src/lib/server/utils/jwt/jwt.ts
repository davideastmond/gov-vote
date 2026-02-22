import { env } from '$env/dynamic/private';
import { SignJWT, jwtVerify } from 'jose';

export const signJWT = async (payload: { sub: string }, options: { exp: string }) => {
	if (!env.JWT_SECRET_KEY) {
		throw new Error('JWT secret key is not defined in environment variables.');
	}
	try {
		const secret = new TextEncoder().encode(env.JWT_SECRET_KEY);
		const alg = 'HS256';
		return new SignJWT(payload)
			.setProtectedHeader({ alg })
			.setExpirationTime(options.exp)
			.setIssuedAt()
			.setSubject(payload.sub)
			.sign(secret);
	} catch (error) {
		throw error;
	}
};

export const verifyJWT = async <T>(token: string): Promise<T> => {
	if (!env.JWT_SECRET_KEY) {
		throw new Error('JWT secret key is not defined in environment variables.');
	}
	try {
		return (await jwtVerify(token, new TextEncoder().encode(env.JWT_SECRET_KEY))).payload as T;
	} catch (error) {
		console.log(error);
		throw new Error('Your token has expired.');
	}
};
