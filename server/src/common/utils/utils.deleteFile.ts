import path from 'path'
import fs from 'fs'
import { publicDir } from '../../app'

const deleteFile = (filename: string): Promise<void> => {
    const filePath = path.join(publicDir, filename);
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('File could not be deleted', err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

export default deleteFile