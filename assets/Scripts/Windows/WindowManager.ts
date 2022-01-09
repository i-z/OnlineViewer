
import { _decorator, Component, Node, log, EventTouch } from 'cc';
import { SimpleWindow } from './SimpleWindow';
const { ccclass, property } = _decorator;
 
@ccclass('WindowManager')
export class WindowManager extends Component {

    @property([SimpleWindow])
    windows: SimpleWindow[] = [];

    start () {
    }

    openWindowByTouch(et: EventTouch, num: number) {
        if (num < this.windows.length) {
            this.windows[num].open();
        }
    }
    
    closeWindow(num: number) {
        if (num < this.windows.length) {
            this.windows[num].close();
        }
    }
    
    closeWindowByTouch(et: EventTouch, num: number) {
        this.closeWindow(num);
    }
}