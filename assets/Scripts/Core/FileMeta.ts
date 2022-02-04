import { Favorite } from "../Entities/Favorite";
import { FileData } from "../Entities/FileData";

type MetaChanged = (name: string) => void;

export class FileMeta {

    private _key: string;
    private _data: FileData;
    private _metaChanged: MetaChanged = null;

    constructor(name:string, data: FileData, callback: MetaChanged) {
        this._data = data;
        this._metaChanged = callback;
    }

    addFavorite(fav: Favorite) {
        this._data.favorites.push(fav);
        this.raiseMetaChanged();
    }

    delete(idx: number) {
        this._data.deleted.push(idx);
    }

    isDeleted(idx: number): boolean {
        return false;
    }

    private raiseMetaChanged() {
        if (this._metaChanged)
        this._metaChanged(this._key);
    }

    toJSON(): string {
        return JSON.stringify(this._data);
    }

}