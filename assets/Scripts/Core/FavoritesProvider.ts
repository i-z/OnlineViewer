import { sys } from "cc";
import { MetaData } from "../Entities/MetaData";
import { MetaDataEntity } from "./MetaDataEntity";

type FavoritesChanged = () => void;

export class FavoritesProvider {

    private readonly _favoritesStorageKey = 'favoritesKeys';
    private readonly _keyPrefix = 'f';
    private _nameKey: Map<string, string> = new Map<string, string>();
    private _keyData: Map<string, MetaDataEntity> = new Map<string, MetaDataEntity>();
    private _newIdx: number = 0;

    constructor() {
        const data = sys.localStorage.getItem(this._favoritesStorageKey);
        const dict = JSON.parse(data);

        for (const name in dict) {
            const key = dict[name] as string;
            this._nameKey.set(name, key);

            const num = key.substr(this._keyPrefix.length, key.length - this._keyPrefix.length);
            const idx = parseInt(num);
            if (!isNaN(idx) && idx >= this._newIdx) {
                this._newIdx = idx + 1;
            }
        }

        this._nameKey.forEach((key, filename) => {
            const data = sys.localStorage.getItem(key);
            if (data) {
                this._keyData.set(key, new MetaDataEntity(key, JSON.parse(data), this.metaChanged.bind(this)))
            }
        });
    }

    private _onDataChanged : FavoritesChanged;
    public get onDataChanged() : FavoritesChanged {
        return this._onDataChanged;
    }
    public set onDataChanged(v : FavoritesChanged) {
        this._onDataChanged = v;
    }

    private metaChanged(m: MetaDataEntity) {
        if (m) {
            localStorage.setItem(m.key, m.toJSON());
        }
        this.raiseDataChanged();
    }

    private raiseDataChanged() {
        if (this._onDataChanged) {
            this._onDataChanged();
        }
    }

    getMetaDataEntity(name: string): MetaDataEntity {
        let res: MetaDataEntity = null;
        const key = this._nameKey.get(name);
        if (key) {
            res = this._keyData.get(key);
            if (!res) {
                res = this.createMetaDataEntity(key, name);
                this.raiseDataChanged();
            }
        } else {
            const key = `${this._keyPrefix}${this._newIdx}`;
            this._nameKey.set(name, key);
            this._newIdx++;
            res = this.createMetaDataEntity(key, name);
            this.raiseDataChanged();
        }
        this.save();
        return res;
    }

    removeMetaDataEntityWithName(name: string) {
        let res: MetaDataEntity = null;
        const key = this._nameKey.get(name);
        this._nameKey.delete(name);
        if (key) {
            this._keyData.delete(key);
            sys.localStorage.removeItem(key);
        }
        this.raiseDataChanged();
        this.save();
    }

    renameMetaDataEntityWithName(name: string, newName: string) {
        let res: MetaDataEntity = null;
        const key = this._nameKey.get(name);
        if (key) {
            this._nameKey.delete(name);
            this._nameKey.set(newName, key);

            const data = this._keyData.get(key);
            if (data) {
                data.name = newName;
            }
        }
        this.raiseDataChanged();
        this.save();
    }

    private createMetaDataEntity(key: string, name: string): MetaDataEntity {
        const m = new MetaDataEntity(key, {name: name} as MetaData, this.metaChanged.bind(this));
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

    get names(): string[] {
        return Array.from(this._nameKey.keys());
    }

    get entities(): MetaDataEntity[] {
        return Array.from(this._keyData.values());
    }
}