import path from 'path'
import fs from 'fs'
import { publicDir } from '../../app'

const isPhotoExist = (filename: string) => {
    const filePath = path.join(publicDir, filename)
    return fs.existsSync(filePath)
}

export default isPhotoExist