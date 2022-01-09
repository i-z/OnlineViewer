
import { _decorator, Component, Node, EditBox, log } from 'cc';
const { ccclass, property } = _decorator;

export enum InputWindowEvents {
    INPUT = 'INPUT'
}


@ccclass('InputWindow')
export class InputWindow extends Component {

    @property(EditBox)
    text:EditBox = null;

    start () {
    }

    textChanged(arg:EditBox) {
        this.node.emit(InputWindowEvents.INPUT, arg.string);
    }
}

