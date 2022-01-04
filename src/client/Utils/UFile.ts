import fs from 'fs';

export class UFile {
    static DirExists(sDirPath: string): Boolean {
        return fs.existsSync(sDirPath);
    }

    static CreateDir(sDirPath: string): void {
        fs.mkdirSync(sDirPath);
    }

    static AppendAllLines(sFilePath: string, lines: Array<string>): void {
        lines.forEach(line => {
            fs.appendFileSync(sFilePath, line + "\r\n");
        });
    }

    static AppendLine(sFilePath: string, sLine: string): void {
        fs.appendFileSync(sFilePath, sLine + "\r\n");
    }
}
