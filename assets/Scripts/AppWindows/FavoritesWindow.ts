
import { _decorator, Component, Node, EditBox, log, ToggleContainer, Toggle } from 'cc';
import { ConfirmationHelper } from '../Components/ConfirmationHelper';
import { ListItem } from '../Components/ListItem';
import { ListScrollView, ListScrollViewEvent } from '../Components/ListScrollView';
import { InitialZoomType, Settings } from '../Config/LocalSettings';
import Window from '../Windows/Window';
const { ccclass, property } = _decorator;

export enum FavoritesWindowEventType {
    SAVE_SETTINGS = 'save_settings',
    ADD_NEW_LIST = 'add_new_list',
    REMOVE_LIST = 'remove_list',
    RENAME_LIST = 'rename_list',
    DOWNLOAD_ALL_FAVORITES = 'download_all_favorites',
    UPLOAD_SEVERAL_FAVORITES = 'upload_several_favorites'
}

@ccclass('FavoritesWindow')
export class FavoritesWindow extends Window {

    @property(EditBox)
    newListName: EditBox = null;

    @property(ListScrollView)
    lists: ListScrollView = null;

    private _data: string[] = null;
    private _confirm: ConfirmationHelper = null;

    onLoad() {
        super.onLoad();
        this._confirm = this.getComponent(ConfirmationHelper);

        this.lists.node.on(ListScrollViewEvent.SELECT_SINGLE_ITEM, (idx: number) => {
            if (this._data && this._data[idx]) {
                this.newListName.string = this._data[idx];
            }
        })
    }

    addNewList() {
        if (this.newListName.string?.length > 0) {
            this.node.emit(FavoritesWindowEventType.ADD_NEW_LIST, this.newListName.string);
            this.newListName.string = '';
        }
    }

    removeList() {
        if (this.lists.selectedIndex >= 0) {
            this._confirm.confirm(() => {
                this.node.emit(FavoritesWindowEventType.REMOVE_LIST, this._data[this.lists.selectedIndex]);
            });
        }
    }

    renameList() {
        if (this.lists.selectedIndex >= 0 && this.newListName.string?.length > 0 && this._data[this.lists.selectedIndex] != this.newListName.string) {
            this.node.emit(FavoritesWindowEventType.RENAME_LIST, this._data[this.lists.selectedIndex], this.newListName.string);
        }
    }

    downloadAllFavorites() {
        this.node.emit(FavoritesWindowEventType.DOWNLOAD_ALL_FAVORITES);
    }

    uploadServeralFavorites() {
        this.node.emit(FavoritesWindowEventType.UPLOAD_SEVERAL_FAVORITES);
    }

    okTouch() {
        this.node.emit(FavoritesWindowEventType.SAVE_SETTINGS, this._settings);
        this.close();
    }

    setLists(ls: string[]) {
        this._data = ls;
        this.lists.setData(ls);
    }

    private _settings: Settings;
    public get settings(): Settings {
        return this._settings;
    }
    public set settings(v: Settings) {
        this._settings = v;
    }
}

