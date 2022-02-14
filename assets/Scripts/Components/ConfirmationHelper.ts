
import { _decorator, Component, Node } from 'cc';
import { ConfirmationWindow, ConfirmationWindowEventType } from '../AppWindows/ConfirmationWindow';
import WindowDirector from '../Windows/WindowDirector';
const { ccclass, property } = _decorator;

@ccclass('ConfirmationHelper')
export class ConfirmationHelper extends Component {

    private _yesCallback: () => void;
    
    start() {
        const cw = WindowDirector.instance.getWindow('confirm') as ConfirmationWindow;
        cw.node.on(ConfirmationWindowEventType.YES, () => {
            if (this._yesCallback)
                this._yesCallback();
        });
    }

    confirm(confirmCallback: () => void) {
        this._yesCallback = confirmCallback;
        WindowDirector.instance.openWindow('confirm');
    }

}
