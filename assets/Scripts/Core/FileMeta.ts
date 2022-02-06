import { Favorite } from "../Entities/Favorite";
import { FileData } from "../Entities/FileData";

type MetaChanged = (meta: FileMeta) => void;

export class FileMeta {
    private _key: string;
    private _data: FileData;
    private _metaChanged: MetaChanged = null;

    constructor(name: string, data: FileData, callback: MetaChanged) {
        this._key = name;
        this._data = data;
        this._metaChanged = callback;

        if (!this._data.favorites)
            this._data.favorites = [];
        if (!this._data.deleted)
            this._data.deleted = [];
    }

    addFavorite(fav: Favorite) {
        this._data.favorites.push(fav);
        this.raiseMetaChanged();
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

    get data(): FileData {
        return this._data;
    }

}