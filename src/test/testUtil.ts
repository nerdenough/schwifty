import * as fs from 'fs-extra';
import * as tempy from 'tempy';

export function createSwiftFile(data: string): string {
    const fileName = tempy.file({ extension: 'swift' });
    fs.createFileSync(fileName);
    fs.writeFileSync(fileName, data);
    return fileName;
}

export function readSwiftFile(fileName: string): string {
    return fs.readFileSync(fileName, 'utf-8');
}
