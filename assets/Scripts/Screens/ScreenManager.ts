
import { _decorator, Component, Node, director } from 'cc';
import ScreenDirector from './ScreenDirector';
const { ccclass, property } = _decorator;

@ccclass('ScreenNode')
export class ScreenNode {
    @property
    name: string = '';
    @property(Node)
    screen: Node = null;
}

@ccclass('ScreenManager')
export class ScreenManager extends Component {

    @property([ScreenNode])
    screens: ScreenNode[] = [];

    @property
    defaultScreen = '';

    private _currentScreen: Node = null;

    runDefaultScreen() {
        this.runScreen(this.defaultScreen);
    }

    runScreen(name: string) {
        for (const sn of this.screens) {
            if (sn.name == name) {
                sn.screen.active = true;
                this._currentScreen = sn.screen;
            } else {
                sn.screen.active = false;
            }
        }
    }

}
