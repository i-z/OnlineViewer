
import { _decorator, Component, Node, director, assert } from 'cc';
import { ScreenManager } from './ScreenManager';
import { TransitionBase } from './TransitionBase';
const { ccclass, property } = _decorator;


@ccclass('ScreenDirector')
export default class ScreenDirector {
    private static _instance: ScreenDirector = null;

    private constructor() {
    }

    public static get instance(): ScreenDirector {
        return this._instance || (this._instance = new this());
    }

    private _initialized: boolean = false;
    private _screenManager: ScreenManager = null;
    private _defaultTransition: TransitionBase = null;

    public init() {
        if (!this._initialized) {
            const sms = director.getScene().getComponentsInChildren(ScreenManager);
            assert(sms, "Can't find ScreenManager");
            assert(sms.length == 1, 'ScreenManager has to be single');
            this._screenManager = sms[0];
            this._screenManager.runDefaultScreen();
            this._defaultTransition = this._screenManager.getComponent(TransitionBase);
            this._initialized = true;
        }
    }

    runScreeenWithDefaultTransition(name: string) {
        assert(this._defaultTransition, "Default transition doesn't exist");
        this._defaultTransition
        .begin()
        .then(() => this.runScreen(name))
        .then(() => this._defaultTransition.end());
    }

    runScreen(name: string) {
        assert(this._screenManager, "ScreenManager doesn't exists");
        this._screenManager.runScreen(name);
    }
}

