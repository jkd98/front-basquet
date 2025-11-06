import { writeFileSync, mkdirSync } from 'fs';
import { config } from 'dotenv';

config();

const targetPath = './src/environments/environment.ts';
const targetPathDev = './src/environments/environment.development.ts';

if (!process.env['API_URL']) {
    throw new Error('API_URL is not set')
}

const evnFileContent = `
export const environment = {
    baseUrl: '${process.env['API_URL']}',
};
`;

mkdirSync('./src/environments', { recursive: true });
writeFileSync(targetPath, evnFileContent);
writeFileSync(targetPathDev, evnFileContent);
