import request from 'supertest';
import app from '../app';
import path from 'path';
import fs from 'fs';

describe('Media Static Serving', () => {
    const mediaDir = path.join(__dirname, '../../media');
    const testFilePath = path.join(mediaDir, 'test-image.txt');
    const testContent = 'This is a test image content';

    beforeAll(() => {
        // Ensure media directory exists
        if (!fs.existsSync(mediaDir)) {
            fs.mkdirSync(mediaDir, { recursive: true });
        }
        // Create a dummy file 
        fs.writeFileSync(testFilePath, testContent);
    });

    afterAll(() => {
        // Clean up
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }
    });

    it('should serve files from the media directory', async () => {
        const res = await request(app).get('/media/test-image.txt');

        expect(res.status).toBe(200);
        expect(res.text).toBe(testContent);
    });

    it('should return 404 for non-existent files', async () => {
        const res = await request(app).get('/media/non-existent-file.txt');

        expect(res.status).toBe(404);
    });
});
