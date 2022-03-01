import { Favorite } from "../Entities/Favorite";
import { FileIdentificationData } from "../Entities/FileIdentificationData";
import { MetaData } from "../Entities/MetaData";
import { hashCode } from "../Utils/StringUtils";

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

    addFavorite(fav: Favorite) {
        if (!this.has(fav.url)) {
            this._data.favorites.push(fav);
            this.raiseMetaChanged();
        }
    }

    addFavoriteWithIdx(idx: number, url: string) {
        this.addFavorite({ index: idx, url: url, hash: hashCode(url) });
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
        const code = hashCode(url);
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
        const code = hashCode(url);
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

    public get description() : string {
        return this.data.description;
    }
    public set description(v : string) {
        this.data.description = v;
        this.raiseMetaChanged();
    }

    public get shelf() : string {
        return this.data.shelf;
    }
    public set shelf(v : string) {
        this.data.shelf = v;
        this.raiseMetaChanged();
    }

    get idData(): FileIdentificationData {
        return this._data.idData;
    }

    private static idEqual(a:FileIdentificationData, b: FileIdentificationData): boolean {
        if (a.firstUrls.length != b.firstUrls.length)
            return false;
        for (let i = 0; i < a.firstUrls.length; i++) {
            if (a.firstUrls[i] != b.firstUrls[i])
                return false;
        }
        return true;
    }

    isEqualId(id: FileIdentificationData) {
        return MetaDataEntity.idEqual(this._data.idData, id);
    }

    isNameFull(): boolean {
        if (this._data.shelf?.length > 0) {
            return this._data.name.startsWith(this._data.shelf) && this._data.name[this._data.shelf.length] == '_';
        }
        return true;
    }
    makeNameFull() {
        if (!this.isNameFull()) {
            this.name = `${this.shelf}_${this.name}`;
            this.raiseMetaChanged();
        }
    }

    deletePermanently(idx: number, raiseEvent: boolean) {
        let m = false;
        if (this._data.currentIndex == idx) {
            this._data.currentIndex = 0;
            m = true;
        }
        if (this._data.currentIndex > idx ) {
            --this._data.currentIndex;
            m = true;
        }
        this._data.deleted.forEach((d, k)=> {
            if (d == idx) {
                this._data.deleted.splice(idx, 1);
                m = true;
            }
            if (d > idx) {
                this._data.deleted[k] = --d;
                m = true;
            }
        });

        this._data.favorites.forEach((f, k)=> {
            if (f.index == idx) {
                f.index = -1;
                m = true;
            }
            if (f.index > idx) {
                --f.index;
                m = true;
            }
        });
        if (m && raiseEvent) {
            this.raiseMetaChanged();
        }
    }

    get favorites():  number[] {
        return this._data.favorites.map(f => f.index);
    }

    get deleted(): number[] {
        return this._data.deleted;
    }
}