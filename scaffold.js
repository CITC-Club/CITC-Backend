const fs = require('fs');
const path = require('path');

const DIRS = [
    'db',
    'media',
    'backup',
    // Media years
    'media/2024/members',
    'media/2024/events',
    'media/2025/members',
    'media/2025/events',
    'media/2026/members',
    'media/2026/events',
    'media/2027/members',
    'media/2027/events',
];

const FILES = [
    {
        path: 'db/teams.json',
        content: { teams: [], members: [] }
    },
    {
        path: 'db/events.json',
        content: { events: [] }
    },
    {
        path: 'db/README.md',
        content: '# Database\n\nThis directory contains LowDB JSON files.\n- `teams.json`: Stores team structure and members.\n- `events.json`: Stores all events.'
    },
    {
        path: 'media/README.md',
        content: '# Media Storage\n\nOrganized by Year > Category (members/events).'
    }
];

const BACKUP_SCRIPT = `
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const archiver = require('archiver');
require('dotenv').config();

// Configuration
const BACKUP_DIR = path.join(__dirname, 'archives');
const SOURCE_DIRS = ['db', 'media'];
const TARGET_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID; // Set this in .env

if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

async function authenticate() {
    const auth = new google.auth.GoogleAuth({
        keyFile: path.join(__dirname, '../service-account.json'), // Expects service account key in root
        scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    return auth;
}

async function uploadFile(auth, filePath, fileName) {
    const drive = google.drive({ version: 'v3', auth });
    const fileMetadata = {
        name: fileName,
        parents: TARGET_FOLDER_ID ? [TARGET_FOLDER_ID] : [],
    };
    const media = {
        mimeType: 'application/zip',
        body: fs.createReadStream(filePath),
    };

    try {
        const file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });
        console.log('Backup uploaded successfully. File ID:', file.data.id);
        return file.data.id;
    } catch (err) {
        console.error('Upload failed:', err);
        throw err;
    }
}

function zipDirectories(outputName) {
    return new Promise((resolve, reject) => {
        const outputPath = path.join(BACKUP_DIR, outputName);
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            console.log(archive.pointer() + ' total bytes');
            console.log('Archiver has been finalized and the output file descriptor has closed.');
            resolve(outputPath);
        });

        archive.on('error', (err) => reject(err));

        archive.pipe(output);

        SOURCE_DIRS.forEach(dir => {
            const sourcePath = path.join(__dirname, '../', dir);
            if (fs.existsSync(sourcePath)) {
                archive.directory(sourcePath, dir);
            } else {
                console.warn(\`Warning: Source directory \${sourcePath} does not exist.\`);
            }
        });

        archive.finalize();
    });
}

async function runBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = \`backup-\${timestamp}.zip\`;
    
    console.log('Starting backup...');
    try {
        const zipPath = await zipDirectories(filename);
        const auth = await authenticate();
        await uploadFile(auth, zipPath, filename);
        console.log('Backup process completed.');
    } catch (error) {
        console.error('Backup failed:', error);
    }
}

runBackup();
`;

// Helper to create directory if not exists
const createDir = (dirPath) => {
    const fullPath = path.resolve(process.cwd(), dirPath);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
    } else {
        console.log(`Directory already exists: ${dirPath}`);
    }
};

// Helper to create file if not exists
const createFile = (filePath, content) => {
    const fullPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
        const fileContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
        fs.writeFileSync(fullPath, fileContent);
        console.log(`Created file: ${filePath}`);
    } else {
        console.log(`File already exists: ${filePath}`);
    }
};

const run = () => {
    console.log('Starting Antigravity Scaffold...');

    // Create Directories
    DIRS.forEach(createDir);

    // Create Files
    FILES.forEach(file => createFile(file.path, file.content));

    // Create Backup Script specially
    createFile('backup/backup-to-drive.js', BACKUP_SCRIPT);

    console.log('\nScaffold Complete!');
    console.log('1. Install backup dependencies: npm install googleapis archiver dotenv');
    console.log('2. Place your Google Service Account JSON in the root as "service-account.json"');
    console.log('3. Set GOOGLE_DRIVE_FOLDER_ID in .env');
    console.log('4. Run backup with: node backup/backup-to-drive.js');
};

run();
