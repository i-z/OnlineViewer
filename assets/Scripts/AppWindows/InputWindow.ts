
import { _decorator, Component, Node, EditBox, log, Toggle, ToggleContainer } from 'cc';
import { ListItem } from '../Components/ListItem';
import { ListScrollView } from '../Components/ListScrollView';
import Window from '../Windows/Window';
const { ccclass, property } = _decorator;

export enum InputWindowEvents {
    INPUT = 'input',
    DOWNLOAD_META = 'download_meta'
}

@ccclass('InputWindow')
export class InputWindow extends Window {

    @property(EditBox)
    text:EditBox = null;

    @property(ListScrollView)
    metasList: ListScrollView = null;

    private _data: string[] = [];
    private _idx:number = -1;

    start () {
    }

    textChanged(arg:EditBox) {
    }

    okTouch() {
        this.node.emit(InputWindowEvents.INPUT, this.text.string);
    }

    setFilesWithMetaDate(data: string[]) {
        this._data = data;
        this.metasList.setData(data);
        if (this._data?.length > 0) {
            this._idx = 0;
        }
    }

    selectFileToDownload(t: Toggle) {
        const item = t.getComponent(ListItem);
        if (item) {
            this._idx = item.index;
        }
    }

    downloadTouch() {
        if (this._idx >= 0) {
            this.node.emit(InputWindowEvents.DOWNLOAD_META, this._data[this._idx]);
        }
    }
}
