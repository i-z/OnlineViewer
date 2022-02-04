import { sys } from "cc";
import { FileData } from "../Entities/FileData";
import { FileMeta } from "./FileMeta";

export class MetaFileProvider {

    private readonly _metaFileProviderStorageKey = 'metaFilesKeys';
    private _fileNameKey: Map<string, string> = new Map<string, string>();
    private _filesMetas: Map<string, FileMeta> = new Map<string, FileMeta>();

    constructor() {
        const data = sys.localStorage.getItem(this._metaFileProviderStorageKey);
        const plain = JSON.parse(data);

        for (const fileName in plain) {
            const key = plain[fileName];
            this._fileNameKey.set(fileName, key);
        }

        this._fileNameKey.forEach((key, filename) => {
            const fileMeta = sys.localStorage.getItem(key);
            if (fileMeta) {
                this._filesMetas.set(key, new FileMeta(key, JSON.parse(fileMeta), this.metaChanged.bind(this)))
            }
        });

    }

    private metaChanged(key: string) {
        const m = this._filesMetas.get(key);
        if (m) {
            localStorage.setItem(key, m.toJSON());
        }
    }

    getFileMeta(name: string): FileMeta {
        const key = this._fileNameKey.get(name);
        if (key) {
            const m = this._filesMetas.get(key);
            if (key) {
                return m;
            } else {
                const m = new FileMeta(key, {} as FileData, this.metaChanged.bind(this));
                this._filesMetas.set(key, m);
                return m;
            }
        }
        return null;
    }

}