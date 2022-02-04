import { _decorator, sys, JsonAsset, log } from 'cc';
const { ccclass, property } = _decorator;

export enum InitialZoomType   {
    CENTERED,
    COMICS,
    FIT
}

export interface Settings {
    initialZoom: InitialZoomType
}

@ccclass('LocalSettings')
export default class LocalSettings {
    private static _instance: LocalSettings;
    private constructor() {
    }
    public static get instance(): LocalSettings {
        return this._instance || (this._instance = new this());
    }
    private _initialized: boolean = false;

    private readonly _storageKey = 'settings';
    private _settings: Settings = { initialZoom: InitialZoomType.CENTERED };

    public get initialZoom(): InitialZoomType {
        return this._settings.initialZoom;
    }
    public set initialZoom(v: InitialZoomType) {
        this._settings.initialZoom = v;
        this.save();
    }

    public init() {
        if (!this._initialized) {
            const settings = sys.localStorage.getItem(this._storageKey);
            if (settings?.length > 0) {
                this._settings = JSON.parse(settings);
            }
            this._initialized = true;
        }
    }

    private save() {
        sys.localStorage.setItem(this._storageKey, JSON.stringify(this._settings));
    }

    
    public get settings() : Settings {
        return Object.assign({}, this._settings);
    }
    public set settings(v : Settings) {
        this._settings = v;
        this.save();
    }
}

