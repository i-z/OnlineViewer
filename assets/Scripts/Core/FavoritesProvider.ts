import { sys } from "cc";
import { MetaData } from "../Entities/MetaData";
import { MetaDataEntity } from "./MetaDataEntity";

export class FavoritesProvider {

    private readonly _favoritesStorageKey = 'favoritesKeys';
    private readonly _keyPrefix = 'f';
    private _nameKey: Map<string, string> = new Map<string, string>();
    private _keyData: Map<string, MetaDataEntity> = new Map<string, MetaDataEntity>();

    private _newIdx: number = 0;

    constructor() {
        const data = sys.localStorage.getItem(this._favoritesStorageKey);
        const dict = JSON.parse(data);

        for (const fileName in dict) {
            const key = dict[fileName];
            this._nameKey.set(fileName, key);

            const idx = parseInt(key);
            if (!isNaN(idx) && idx >= this._newIdx) {
                this._newIdx = idx + 1;
            }
        }

        this._nameKey.forEach((k, filename) => {
            const key = `${this._keyPrefix}${k}`;
            const data = sys.localStorage.getItem(key);
            if (data) {
                this._keyData.set(key, new MetaDataEntity(key, JSON.parse(data), this.metaChanged.bind(this)))
            }
        });

    }

    private metaChanged(m: MetaDataEntity) {
        if (m) {
            localStorage.setItem(m.key, m.toJSON());
        }
    }

    getMetaDataEntity(name: string): MetaDataEntity {
        let res: MetaDataEntity = null;
        const key = this._nameKey.get(name);
        if (key) {
            res = this._keyData.get(key);
            if (!res) {
                res = this.createMetaDataEntity(key);
            }
        } else {
            const key = String(this._newIdx);
            this._nameKey.set(name, key)
            this._newIdx++;
            res = this.createMetaDataEntity(key)
        }
        this.save();
        return res;
    }

    private createMetaDataEntity(key: string): MetaDataEntity {
        const m = new MetaDataEntity(key, {} as MetaData, this.metaChanged.bind(this));
        this._keyData.set(key, m);
        return m;
    }

    private mapToJson(map: Map<string, string>): string {
        const res = {};
        map.forEach((v, k) => res[k] = v);
        return JSON.stringify(res);
    }

    private save() {
        localStorage.setItem(this._favoritesStorageKey, this.mapToJson(this._nameKey));
        this._keyData.forEach((m, k) => {
            this.metaChanged(m);
        })
    }

    get files(): string[] {
        return Array.from(this._nameKey.keys());
    }
}