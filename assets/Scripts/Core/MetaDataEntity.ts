import { Favorite } from "../Entities/Favorite";
import { MetaData } from "../Entities/MetaData";

type MetaChanged = (meta: MetaDataEntity) => void;

export class MetaDataEntity {
    private _key: string;
    private _data: MetaData;
    private _metaChanged: MetaChanged = null;

    constructor(key: string, data: MetaData, callback: MetaChanged) {
        this._key = key;
        this._data = data;
        this._metaChanged = callback;

        if (!this._data.favorites)
            this._data.favorites = [];
        if (!this._data.deleted)
            this._data.deleted = [];
    }

    hashCode(s: string): number {
        let h = 0;
        for (let i = 0; i < s.length; i++)
            h = Math.imul(31, h) + s.charCodeAt(i) | 0;
        return h;
    }

    addFavorite(fav: Favorite) {
        this._data.favorites.push(fav);
        this.raiseMetaChanged();
    }

    addFavoriteWithIdx(idx: number, url: string) {
        this.addFavorite({ index: idx, url: url, hash: this.hashCode(url) });
    }

    removeFromFavorites(idx: number) {
        const f = this._data.favorites.find(f => f.index == idx);
        if (f) {
            const t = this._data.favorites.indexOf(f);
            if (t >= 0) {
                this._data.favorites.splice(t, 1);
            }
        }
        this.raiseMetaChanged();
    }

    removeFromFavoritesUrl(url: string) {
        const code = this.hashCode(url);
        const f = this._data.favorites.find(f => f.hash == code);
        if (f) {
            const t = this._data.favorites.indexOf(f);
            if (t >= 0) {
                this._data.favorites.splice(t, 1);
            }
        }
        this.raiseMetaChanged();
    }

    delete(idx: number) {
        this._data.deleted.push(idx);
        this.raiseMetaChanged();
    }

    restore(idx: number) {
        const t = this._data.deleted.indexOf(idx);
        if (t >= 0) {
            this._data.deleted.splice(t, 1);
        }
        this.raiseMetaChanged();
    }

    isLiked(idx: number): boolean {
        return this._data.favorites.find(f => f.index == idx) != null;
    }

    has(url: string): boolean {
        const code = this.hashCode(url);
        return this._data.favorites.find(f => f.hash == code) != null;
    }

    isDeleted(idx: number): boolean {
        return this._data.deleted.indexOf(idx) >= 0;
    }

    private raiseMetaChanged() {
        if (this._metaChanged)
            this._metaChanged(this);
    }

    toJSON(): string {
        return JSON.stringify(this._data);
    }

    get key(): string {
        return this._key;
    }

    get data(): MetaData {
        return this._data;
    }

    get name(): string {
        return this._data?.name;
    }

    set name(val: string) {
        this._data.name = val;
    }

    public get currentIndex() : number {
        return this._data.currentIndex;
    }
    public set currentIndex(v : number) {
        this._data.currentIndex = v;
        this.raiseMetaChanged();
    }
    

}