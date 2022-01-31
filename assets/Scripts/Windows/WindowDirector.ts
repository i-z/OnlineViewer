
import { _decorator, Component, Node, director, assert, log } from 'cc';
import { WindowManager } from './WindowManager';
import Window from './Window';
const { ccclass, property } = _decorator;


@ccclass('WindowDirector')
export default class WindowDirector {
    private static _instance: WindowDirector = null;

    private constructor() {
    }

    public static get instance(): WindowDirector {
        return this._instance || (this._instance = new this());
    }

    private _initialized: boolean = false;
    private _windowManager: WindowManager = null;

    public init() {
        if (!this._initialized) {
            const wms = director.getScene().getComponentsInChildren(WindowManager);
            assert(wms, "Can't find WindowManager");
            assert(wms.length == 1, 'WindowManager has to be single');
            this._windowManager = wms[0];
            this._initialized = true;
        }
    }

    openWindow(name: string): Window {
        assert(this._initialized, "WindowManager not initilized");
        assert(this._windowManager, "WindowManager doesn't exist");
        return this._windowManager.openWindow(name);
    }

    closeWindow(name: string) {
        assert(this._initialized, "WindowManager not initilized");
        assert(this._windowManager, "WindowManager doesn't exist");
        this._windowManager.closeWindow(name);
    }

}

