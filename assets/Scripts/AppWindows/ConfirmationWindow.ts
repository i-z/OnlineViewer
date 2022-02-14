
import { _decorator, Component, Node, EditBox, log, ToggleContainer, Toggle } from 'cc';
import { InitialZoomType, Settings } from '../Config/LocalSettings';
import Window from '../Windows/Window';
const { ccclass, property } = _decorator;

export enum ConfirmationWindowEventType {
    YES = 'yes',
    NO = 'no'
}

@ccclass('ConfirmationWindow')
export class ConfirmationWindow extends Window {

    yesTouch() {
        this.node.emit(ConfirmationWindowEventType.YES);
        this.close();
    }

    noTouch() {
        this.node.emit(ConfirmationWindowEventType.NO);
        this.close();
    }

}

