
import { _decorator, Component, Node } from 'cc';
import ScreenDirector from './Screens/ScreenDirector';
import WindowDirector from './Windows/WindowDirector';
const { ccclass, property } = _decorator;
 
@ccclass('MainScene')
export class MainScene extends Component {

    start () {
        WindowDirector.instance.init();
    }

    openInputWindow() {
        WindowDirector.instance.openWindow('input');
    }

}

