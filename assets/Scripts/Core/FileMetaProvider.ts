import { log, sys } from "cc";
import { FileData } from "../Entities/FileData";
import { FileMeta } from "./FileMeta";

export class FileMetaProvider {

    private readonly _metaFileProviderStorageKey = 'metaFilesKeys';
    private _fileNameKey: Map<string, string> = new Map<string, string>();
    private _filesMetas: Map<string, FileMeta> = new Map<string, FileMeta>();

    private _newIdx: number = 0;

    constructor() {
        const data = sys.localStorage.getItem(this._metaFileProviderStorageKey);
        const dict = JSON.parse(data);

        for (const fileName in dict) {
            const key = dict[fileName];
            this._fileNameKey.set(fileName, key);

            const idx = parseInt(key);
            if (!isNaN(idx) && idx >= this._newIdx) {
                this._newIdx = idx + 1;
            }
        }

        this._fileNameKey.forEach((key, filename) => {
            const fileMeta = sys.localStorage.getItem(key);
            if (fileMeta) {
                this._filesMetas.set(key, new FileMeta(key, JSON.parse(fileMeta), this.metaChanged.bind(this)))
            }
        });

    }

    private metaChanged(m: FileMeta) {
        //const m = this._filesMetas.get(key);
        if (m) {
            localStorage.setItem(m.key, m.toJSON());
        }
    }

    getFileMeta(name: string): FileMeta {
        let res: FileMeta = null;
        const key = this._fileNameKey.get(name);
        if (key) {
            res = this._filesMetas.get(key);
            if (!res) {
                res = this.createFileMeta(key);
            }
        } else {
            const key = String(this._newIdx);
            this._fileNameKey.set(name, key)
            this._newIdx++;
            res = this.createFileMeta(key)
        }
        this.save();
        return res;
    }

    private createFileMeta(key: string): FileMeta {
        const m = new FileMeta(key, {} as FileData, this.metaChanged.bind(this));
        this._filesMetas.set(key, m);
        return m;
    }

    private mapToJson(map: Map<string, string>): string {
        const res = {};
        map.forEach((v, k) => res[k] = v);
        return JSON.stringify(res);
    }

    private save() {
        localStorage.setItem(this._metaFileProviderStorageKey, this.mapToJson(this._fileNameKey));
        this._filesMetas.forEach((m, k) => {
            this.metaChanged(m);
        })
    }

    get files(): string[] {
        return Array.from(this._fileNameKey.keys());
    }

}