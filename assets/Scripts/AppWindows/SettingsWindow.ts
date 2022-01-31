
import { _decorator, Component, Node, EditBox, log, ToggleContainer, Toggle } from 'cc';
import { InitialZoomType, Settings } from '../Config/LocalSettings';
import Window from '../Windows/Window';
const { ccclass, property } = _decorator;

export enum SettingsWindowEventType {
    SAVE_SETTINGS = 'save_settings'
}

@ccclass('SettingsWindow')
export class SettingsWindow extends Window {

    @property(ToggleContainer)
    initalZoom:ToggleContainer = null;

    changeInitialZoom(t: Toggle) {
        this._settings.initialZoom = InitialZoomType[t.node.name];
        log(this._settings);
    }

    okTouch() {
        this.node.emit(SettingsWindowEventType.SAVE_SETTINGS, this._settings);
        this.close();
    }

    private _settings : Settings;
    public get settings() : Settings {
        return this._settings;
    }
    public set settings(v : Settings) {
        this._settings = v;
    }

    updateSettings(settings: Settings) {
        this._settings = settings;
        this.initalZoom.toggleItems.forEach((t, i) => {
            if (InitialZoomType[this._settings.initialZoom] === t.node.name) {
                t.isChecked = true;
            }
        });
    }

}

