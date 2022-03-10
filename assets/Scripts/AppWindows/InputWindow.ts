
import { _decorator, Component, Node, EditBox, log, Toggle, ToggleContainer, Label, Button } from 'cc';
import { ConfirmationHelper } from '../Components/ConfirmationHelper';
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
    UPDATE_SHELF = 'update_shelf',
    REMOVE_DUPLICATES = 'remove_duplicates',
    CLEANUP = 'cleanup',
    ONLY_FAVORITES = 'only_favorites',
    ONLY_DELETED = 'only_deleted',
    CLEAR_FILTER = 'clear_filter',
    UPLOAD_META_FILE = 'upload_meta_file'
}

@ccclass('InputWindow')
export class InputWindow extends Window {

    @property(EditBox)
    text: EditBox = null;

    @property(ListScrollView)
    metasList: ListScrollView = null;
    @property(EditBox)
    description: EditBox = null;
    @property(EditBox)
    shelf: EditBox = null;
    @property(Label)
    output: Label = null;
    @property(EditBox)
    listName: EditBox = null;
    @property(Button)
    filterFavorites: Button = null;
    @property(Button)
    filterDeleted: Button = null;
    @property(Button)
    clearFilter: Button = null;
    @property(Button)
    uploadMeta: Button = null;

    private _idx: number = -1;
    private _data: MetaDataEntity[] = [];
    private _confirm: ConfirmationHelper = null;

    start() {
        this.description.node.on(EditBox.EventType.EDITING_DID_ENDED, (sender: EditBox) => this.node.emit(InputWindowEvents.UPDATE_DESCRIPTION, sender.string, this._idx));
        this.shelf.node.on(EditBox.EventType.EDITING_DID_ENDED, (sender: EditBox) => this.node.emit(InputWindowEvents.UPDATE_SHELF, sender.string, this._idx));
        this._confirm = this.getComponent(ConfirmationHelper);
        this.filterFavorites.node.on(Button.EventType.CLICK, () => {this.node.emit(InputWindowEvents.ONLY_FAVORITES);});
        this.filterDeleted.node.on(Button.EventType.CLICK, () => {this.node.emit(InputWindowEvents.ONLY_DELETED);});
        this.clearFilter.node.on(Button.EventType.CLICK, () => {this.node.emit(InputWindowEvents.CLEAR_FILTER);});
        this.uploadMeta.node.on(Button.EventType.CLICK, () => {this.node.emit(InputWindowEvents.UPLOAD_META_FILE);});
    }

    okTouch() {
        this.node.emit(InputWindowEvents.INPUT, this.text.string, this.listName.string);
    }

    setFilesWithMetaDate(data: MetaDataEntity[], current?: MetaDataEntity) {
        this._data = data;
        if (current) {
            this.metasList.setData(data.map(e => e === current ? '> ' + e.name : e.name));
        } else {
            this.metasList.setData(data.map(e => e.name));
        }

        this._idx = 0;
        this.bind();
    }

    private bind() {
        if (this._data.length > 0) {
            const d = this._data[this._idx]?.description;
            this.description.string = d ? d : '';
            const s = this._data[this._idx]?.shelf;
            this.shelf.string = s ? s : '';
        }
    }

    selectFileToDownload(t: Toggle) {
        const item = t.getComponent(ListItem);
        if (item) {
            this._idx = item.index;
        }
        this.bind();
    }

    downloadTouch() {
        if (this._idx >= 0) {
            this.node.emit(InputWindowEvents.DOWNLOAD_META, this._idx);
        }
    }

    removeTouch() {
        if (this._idx >= 0) {
            this._confirm.confirm(() => {
                this.node.emit(InputWindowEvents.REMOVE_META, this._idx);
            });
        }
    }

    removeAllTouch() {
        this._confirm.confirm(() => {
            this.node.emit(InputWindowEvents.REMOVE_ALL_META, this._idx);
        });
    }

    removeDuplicates() {
        this.node.emit(InputWindowEvents.REMOVE_DUPLICATES);
    }

    cleanup() {
        this.node.emit(InputWindowEvents.CLEANUP);
    }

    writeOutput(str: string) {
        this.output.string = str;
    }
}

