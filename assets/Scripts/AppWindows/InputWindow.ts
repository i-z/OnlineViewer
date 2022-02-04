
import { _decorator, Component, Node, EditBox, log } from 'cc';
import Window from '../Windows/Window';
const { ccclass, property } = _decorator;

export enum InputWindowEvents {
    INPUT = 'INPUT'
}

@ccclass('InputWindow')
export class InputWindow extends Window {

    @property(EditBox)
    text:EditBox = null;

    start () {
    }

    textChanged(arg:EditBox) {
    }

    okTouch() {
        this.node.emit(InputWindowEvents.INPUT, this.text.string);
    }
}

