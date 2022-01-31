
import { _decorator, Component, Node, log } from 'cc';
import LocalSettings from './Config/LocalSettings';
import ScreenDirector from './Screens/ScreenDirector';
import WindowDirector from './Windows/WindowDirector';
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

    openInputWindow() {
        WindowDirector.instance.openWindow('input');
    }

    openFileInputWindow() {
        this.node.emit(MainSceneEventType.FILE_INPUT_REQUESTED);
    }

}

