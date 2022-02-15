import { log, sys } from "cc";
import { FileIdentificationData } from "../Entities/FileIdentificationData";
import { MetaData } from "../Entities/MetaData";
import { MetaDataEntity } from "./MetaDataEntity";

export class FileMetaProvider {

    private readonly _metaFileProviderStorageKey = 'metaFilesKeys';
    private readonly _keyPrefix = 'm';
    private _fileNameKey: Map<string, string[]> = new Map<string, string[]>();
    private _filesMetas: Map<string, MetaDataEntity> = new Map<string, MetaDataEntity>();

    private _newIdx: number = 0;

    constructor() {
        const data = sys.localStorage.getItem(this._metaFileProviderStorageKey);
        const dict = JSON.parse(data);

        for (const fileName in dict) {
            let keys: string[];
            if (typeof dict[fileName] === "string")
            {
                keys = [dict[fileName]];
            } else {
                keys = dict[fileName] as string[];
            }
            
            this._fileNameKey.set(fileName, keys);

            keys.forEach(key => {
                const num = key.substring(this._keyPrefix.length);
                const idx = parseInt(num);
                if (!isNaN(idx) && idx >= this._newIdx) {
                    this._newIdx = idx + 1;
                }
            });
        }

        this._fileNameKey.forEach((keys, filename) => {
            keys.forEach(key => {
                const fileMeta = sys.localStorage.getItem(key);
                if (fileMeta) {
                    this._filesMetas.set(key, new MetaDataEntity(key, JSON.parse(fileMeta), this.metaChanged.bind(this)))
                }
            });
        });

    }

    private metaChanged(m: MetaDataEntity) {
        if (m) {
            localStorage.setItem(m.key, m.toJSON());
        }
    }

    getFileMeta(name: string, id: FileIdentificationData): MetaDataEntity {
        let res: MetaDataEntity = null;
        const keys = this._fileNameKey.get(name);
        if (keys) {
            for (const key of keys) {
                if (key) {
                    const d = this._filesMetas.get(key);
                    if (d.isEqualId(id)) {
                    res = d;
                    break;
                    }
                }
            }
        }

        if (!res){
            const key = `${this._keyPrefix}${this._newIdx}`;
            if (!keys) {
                this._fileNameKey.set(name, [key]);
            } else {
                keys.push(key);
            }
            this._newIdx++;
            res = this.createFileMeta(key, name, id)
        }
        this.save();
        return res;
    }

    private createFileMeta(key: string, name: string, id: FileIdentificationData): MetaDataEntity {
        const m = new MetaDataEntity(key, {name: name, idData: id} as MetaData, this.metaChanged.bind(this));
        this._filesMetas.set(key, m);
        return m;
    }

    private mapToJson(map: Map<string, string[]>): string {
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

    get entities(): MetaDataEntity[] {
        return Array.from(this._filesMetas.values());
    }

    removeFileMeta(m: MetaDataEntity) {
        this._filesMetas.delete(m.key);
        localStorage.removeItem(m.key);
        const fn = this._fileNameKey.get(m.name);
        if (fn) {
            if (fn.splice) {
                fn.splice(fn.indexOf(m.key), 1);
            } else {
                this._fileNameKey.delete(m.name);
            }
        }
        this.save();
    }

}