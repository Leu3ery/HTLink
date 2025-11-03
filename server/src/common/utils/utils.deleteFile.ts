import path from 'path'
import fs from 'fs'
import { publicDir } from '../../app'

const deleteFile = (filename: string): Promise<void> => {
    const filePath = path.join(publicDir, filename);
    if (!filePath.includes("public")) {
        throw new Error('File path is outside of public directory');
    }

    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('File could not be deleted', err);
                resolve()
            } else {
                resolve();
            }
        });
    });
};

export default deleteFile