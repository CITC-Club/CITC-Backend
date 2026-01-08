import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.warn('Google Client ID or Secret not found in environment variables. Google auth will not work.');
}

export const googleClient = new OAuth2Client(CLIENT_ID, CLIENT_SECRET);
