
import { _decorator, Component, Node, EditBox, log, Toggle, ToggleContainer } from 'cc';
import { ListItem } from '../Components/ListItem';
import { ListScrollView } from '../Components/ListScrollView';
import { MetaDataEntity } from '../Core/MetaDataEntity';
import Window from '../Windows/Window';
const { ccclass, property } = _decorator;

export enum InputWindowEvents {
    INPUT = 'input',
    DOWNLOAD_META = 'download_meta',
    REMOVE_META = 'remove_meta',
    UPDATE_DESCRIPTION = 'update_description',
    REMOVE_ALL_META = 'remove_all_meta',
}

@ccclass('InputWindow')
export class InputWindow extends Window {

    @property(EditBox)
    text: EditBox = null;

    @property(ListScrollView)
    metasList: ListScrollView = null;
    @property(EditBox)
    description: EditBox = null;

    private _idx: number = -1;
    private _data: MetaDataEntity[] = [];

    start() {
        this.description.node.on(EditBox.EventType.EDITING_DID_ENDED, (sender: EditBox) => this.node.emit(InputWindowEvents.UPDATE_DESCRIPTION, sender.string, this._idx));
    }

    okTouch() {
        this.node.emit(InputWindowEvents.INPUT, this.text.string);
    }

    setFilesWithMetaDate(data: MetaDataEntity[]) {
        this._data = data;
        this.metasList.setData(data.map(e => e.name));
        this._idx = 0;
        if (this._data.length > 0) {
            const d = this._data[this._idx]?.description;
            this.description.string = d ? d : '';
        }
    }

    selectFileToDownload(t: Toggle) {
        const item = t.getComponent(ListItem);
        if (item) {
            this._idx = item.index;
        }
        const d = this._data[this._idx]?.description;
        this.description.string = d ? d : '';
    }

    downloadTouch() {
        if (this._idx >= 0) {
            this.node.emit(InputWindowEvents.DOWNLOAD_META, this._idx);
        }
    }

    removeTouch() {
        if (this._idx >= 0) {
            this.node.emit(InputWindowEvents.REMOVE_META, this._idx);
        }
    }

    removeAllTouch() {
        this.node.emit(InputWindowEvents.REMOVE_ALL_META, this._idx);
    }
}

