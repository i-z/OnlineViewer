
import { _decorator, Component, Node, log } from 'cc';
import { SettingsWindow, SettingsWindowEventType } from '../AppWindows/SettingsWindow';
import LocalSettings, { Settings } from '../Config/LocalSettings';
import WindowDirector from '../Windows/WindowDirector';
const { ccclass, property } = _decorator;

export enum MainSceneEventType {
    FILE_INPUT_REQUESTED = 'file_input_requested'
}

@ccclass('MainScene')
export class MainScene extends Component {

    start () {
        LocalSettings.instance.init();
        WindowDirector.instance.init();
    }

    openFileInputWindow() {
        this.node.emit(MainSceneEventType.FILE_INPUT_REQUESTED);
    }

    openSettings() {
        const wnd: SettingsWindow = WindowDirector.instance.openWindow('settings') as SettingsWindow;
        wnd.updateSettings(LocalSettings.instance.settings);
        wnd.node.on(SettingsWindowEventType.SAVE_SETTINGS, (setttings: Settings) => {
            LocalSettings.instance.settings = setttings;
        });
    }

}

