import { log, sys } from "cc";
import { MetaData } from "../Entities/MetaData";
import { MetaDataEntity } from "./MetaDataEntity";

export class FileMetaProvider {

    private readonly _metaFileProviderStorageKey = 'metaFilesKeys';
    private readonly _keyPrefix = 'm';
    private _fileNameKey: Map<string, string> = new Map<string, string>();
    private _filesMetas: Map<string, MetaDataEntity> = new Map<string, MetaDataEntity>();

    private _newIdx: number = 0;

    constructor() {
        const data = sys.localStorage.getItem(this._metaFileProviderStorageKey);
        const dict = JSON.parse(data);

        for (const fileName in dict) {
            const key = dict[fileName] as string;
            this._fileNameKey.set(fileName, key);

            const num = key.substr(this._keyPrefix.length, key.length - this._keyPrefix.length);
            const idx = parseInt(num);
            if (!isNaN(idx) && idx >= this._newIdx) {
                this._newIdx = idx + 1;
            }
        }

        this._fileNameKey.forEach((key, filename) => {
            const fileMeta = sys.localStorage.getItem(key);
            if (fileMeta) {
                this._filesMetas.set(key, new MetaDataEntity(key, JSON.parse(fileMeta), this.metaChanged.bind(this)))
            }
        });

    }

    private metaChanged(m: MetaDataEntity) {
        if (m) {
            localStorage.setItem(m.key, m.toJSON());
        }
    }

    getFileMeta(name: string): MetaDataEntity {
        let res: MetaDataEntity = null;
        const key = this._fileNameKey.get(name);
        if (key) {
            res = this._filesMetas.get(key);
            if (!res) {
                res = this.createFileMeta(key, name);
            }
        } else {
            const key = `${this._keyPrefix}${this._newIdx}`;
            this._fileNameKey.set(name, key)
            this._newIdx++;
            res = this.createFileMeta(key, name)
        }
        this.save();
        return res;
    }

    private createFileMeta(key: string, name: string): MetaDataEntity {
        const m = new MetaDataEntity(key, {name: name} as MetaData, this.metaChanged.bind(this));
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