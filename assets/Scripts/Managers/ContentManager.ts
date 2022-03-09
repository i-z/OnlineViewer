
import { _decorator, Component, Node, log, EditBox, Input, HtmlTextParser, EventMouse, EventKeyboard, systemEvent, input, Sprite, SpriteFrame, UITransform, Canvas, Vec3, SpringJoint2D, EventTouch, view, Vec2, Label } from 'cc';
import { ListScrollView, ListScrollViewEvent } from '../Components/ListScrollView';
import { PaginatedListScrollView } from '../Components/PaginatedListScrollView';
import { DownloadedSpriteFrame, PhotoDownloader } from './PhotoDownloader';
import { InputWindow, InputWindowEvents } from '../AppWindows/InputWindow';
import WindowDirector from '../Windows/WindowDirector';
import { MainScene, MainSceneEventType } from '../Scenes/MainScene';
import { FileInput, FileInputEventType } from '../Components/FileInput';
import { PlayerCameraManager } from './PlayerCameraManager';
import { Bounds } from '../Components/Bounds';
import LocalSettings, { InitialZoomType, Settings } from '../Config/LocalSettings';
import { ScrollInput, ScrollInputEventType } from '../Components/ScrollInput';
import { FileMetaProvider } from '../Core/FileMetaProvider';
import { MetaDataEntity } from '../Core/MetaDataEntity';
import { downloadTextFromBrowser } from '../Utils/DOMHelper';
import { CustomToggleButton } from '../Components/CustomToggleButton';
import { FavoritesWindow, FavoritesWindowEventType } from '../AppWindows/FavoritesWindow';
import { FavoritesProvider } from '../Core/FavoritesProvider';
import { WindowEventType } from '../Windows/Window';
import { DropListButton, DropListButtonEventType } from '../Components/DropListButton';
import { DropListItem } from '../Components/DropListItemButton';
import { FileIdentificationData } from '../Entities/FileIdentificationData';
import { hashCode } from '../Utils/StringUtils';
const { ccclass, property } = _decorator;

@ccclass('ContentManager')
export class ContentManager extends Component {

    @property(PaginatedListScrollView)
    listScroll: PaginatedListScrollView;

    @property(PhotoDownloader)
    photoDownloader: PhotoDownloader;

    @property(FileInput)
    textFileInput: FileInput;

    @property(Sprite)
    targetSprite: Sprite = null;

    @property(PlayerCameraManager)
    camera: PlayerCameraManager = null;

    @property(ScrollInput)
    scrollInput: ScrollInput = null;

    @property(Label)
    currentIndex: Label = null;

    @property(Label)
    fileName: Label = null;

    @property(CustomToggleButton)
    likeButon: CustomToggleButton = null;
    @property(CustomToggleButton)
    deleteButon: CustomToggleButton = null;

    @property(DropListButton)
    favoritesButton: DropListButton = null;

    _inputWindow: InputWindow;

    private _data: string[] = []
    private _fileData: string[] = []
    private _selectedIdx: number = 0;
    private _mapIndex: number[] = null;

    private _metaProvider: FileMetaProvider = null;
    private _meta: MetaDataEntity = null;
    private _favoritesProvider: FavoritesProvider = null;
    private _favoritesUploadRequested: boolean = false;
    private readonly _useInPlaceDelete = true;

    start() {
        this._metaProvider = new FileMetaProvider();
        this._favoritesProvider = new FavoritesProvider();

        this._inputWindow = WindowDirector.instance.getWindow('input') as InputWindow;

        this._metaProvider.onDataChanged = () => {
            this._inputWindow.setFilesWithMetaDate(this._metaProvider.entities, this._meta);
        }

        this._inputWindow.node.on(InputWindowEvents.INPUT, (text: string, name?: string) => {
            if (text.length > 0) {
                WindowDirector.instance.closeWindow('input');
            }
            this.processData(text, name);
        });

        this._inputWindow.node.on(InputWindowEvents.DOWNLOAD_META, (idx: number) => {
            const entities = this._metaProvider.entities;
            if (idx < entities.length) {
                const m = entities[idx];
                if (m) {
                    downloadTextFromBrowser(m.name + '.json', m.toJSON());
                }
            }
        });

        this._inputWindow.node.on(InputWindowEvents.REMOVE_META, (idx: number) => {
            const entities = this._metaProvider.entities;
            if (idx < entities.length) {
                const m = entities[idx];
                this._metaProvider.removeFileMeta(m);
            }
        });

        this._inputWindow.node.on(InputWindowEvents.UPDATE_DESCRIPTION, (str: string, idx: number) => {
            const entities = this._metaProvider.entities;
            if (idx < entities.length) {
                const m = entities[idx];
                m.description = str;
            }
        });

        this._inputWindow.node.on(InputWindowEvents.UPDATE_SHELF, (str: string, idx: number) => {
            const entities = this._metaProvider.entities;
            if (idx < entities.length) {
                const m = entities[idx];
                m.shelf = str;
            }
        });

        this._inputWindow.node.on(InputWindowEvents.REMOVE_ALL_META, (str: string, idx: number) => {
            this._metaProvider.removeAllData();
        });

        this._inputWindow.node.on(InputWindowEvents.REMOVE_DUPLICATES, () => {
            this.removeDuplicates();
        });

        this._inputWindow.node.on(InputWindowEvents.CLEANUP, () => {
        });

        this._inputWindow.node.on(InputWindowEvents.ONLY_FAVORITES, () => {
            this.filter(true);
        });

        this._inputWindow.node.on(InputWindowEvents.ONLY_DELETED, () => {
            this.filter(false);
        });

        this._inputWindow.node.on(InputWindowEvents.CLEAR_FILTER, () => {
            this.clearFilter();
        });

        this.listScroll.node.on(ListScrollViewEvent.SELECT_ITEM, (idx: number) => {
            this.loadPhotoWithIdx(idx);
        });

        this.textFileInput.node.on(FileInputEventType.DATA_RECEIVED, (str: string) => {
            if (this._favoritesUploadRequested) {
                this._favoritesProvider.addFromJSON(str);
                this._favoritesUploadRequested = false;
            } else {
                this.processData(str, this.textFileInput.currentFileName);
                this.fileName.string = this.textFileInput.currentFileName;
            }
        });

        const scene = this.getComponent(MainScene);
        scene.node.on(MainSceneEventType.FILE_INPUT_REQUESTED, () => {
            this._favoritesUploadRequested = false;
            this.textFileInput.request();
        });

        this.scrollInput.node.on(ScrollInputEventType.UPDATE_X, (val: number) => {
            log(`JOYSTICK X ${val}`);
            if (val > 0) {
                this.next();
            } else if (val < 1) {
                this.previous();
            }
        });

        this.favoritesButton.node.on(DropListButtonEventType.ITEM_SELECTED, this.toggleFavoritesList.bind(this));

        const fw = WindowDirector.instance.getWindow('favorites') as FavoritesWindow;
        if (fw) {
            fw.node.on(FavoritesWindowEventType.ADD_NEW_LIST, (name: string) => {
                const ent = this._favoritesProvider.getMetaDataEntity(name);
            });

            fw.node.on(FavoritesWindowEventType.REMOVE_LIST, (name: string) => {
                this._favoritesProvider.removeMetaDataEntityWithName(name);
            });

            fw.node.on(FavoritesWindowEventType.RENAME_LIST, (name: string, newName: string) => {
                this._favoritesProvider.renameMetaDataEntityWithName(name, newName);
            });

            fw.node.on(FavoritesWindowEventType.DOWNLOAD_ALL_FAVORITES, () => {
                downloadTextFromBrowser('favorites.json', this._favoritesProvider.toJSON());
            });

            fw.node.on(FavoritesWindowEventType.UPLOAD_SEVERAL_FAVORITES, () => {
                this._favoritesUploadRequested = true;
                this.textFileInput.request();
            });

            fw.node.on(WindowEventType.OPENING, () => {
                fw.setLists(this._favoritesProvider.names);
            });

            this._favoritesProvider.onDataChanged = () => {
                fw.setLists(this._favoritesProvider.names);
                this.updateFavorites();
            };
        }
        this.updateFavorites();
    }

    private populateScrollView() {
        if (this._meta) {
            this.listScroll.setData(this._data, this._meta.deleted);
        } else {
            this.listScroll.setData(this._data);
        }
    }

    private clearFilter() {
        this._data = this._fileData;
        this._mapIndex = null;
        this.populateScrollView();
        if (this._meta.currentIndex >= 0 && this._meta.currentIndex < this._data.length) {
            this.loadPhotoWithIdx(this._meta.currentIndex);
        }
    }

    private filter(favorites: boolean) {
        if (this._mapIndex) {
            this._data = this._fileData;
        } else {
            this._fileData = this._data;
        }
        this._mapIndex = [];
        const filter = favorites ? this._meta.favorites : this._meta.deleted;
        this._data = this._data.filter((v, k) => {
            if (filter.indexOf(k) < 0)
                return false;
            this._mapIndex.push(k);
            return true;
        });
        this.listScroll.setData(this._data);
        if (this._data.length > 0)
            this.loadPhotoWithIdx(0);
    }

    private removeDuplicates() {
        if (this._data?.length <= 0) {
            return;
        }
        const hashes: number[] = [];
        const duplicates: Map<number, number[]> = new Map<number, number[]>();
        const todelete: number[] = [];


        for (let i = 0; i < this._data.length - 1; i++) {
            for (let j = i + 1; j < this._data.length; j++) {
                let a;
                if (hashes[i]) {
                    a = hashes[i];
                } else {
                    a = hashCode(this._data[i])
                    hashes[i] = a;
                }
                let b;
                if (hashes[j]) {
                    b = hashes[j];
                } else {
                    b = hashCode(this._data[j])
                    hashes[j] = b;
                }
                if (a == b) {
                    if (duplicates.has(a)) {
                        duplicates.get(a).push(j)
                    } else {
                        duplicates.set(a, [i, j]);
                    }
                    todelete.push(j);
                }
            }
        }

        if (this._useInPlaceDelete) {
            todelete.sort((a, b) => b - a);
            for (let i = 0; i < todelete.length; i++) {
                const idx = todelete[i];
                this._data.splice(idx, 1);
                this._meta.deletePermanently(idx, false);
            }
        } else {
            const newData = this._data.filter((v, i) => todelete.indexOf(i) < 0);
            this._data = newData;
            for (const idx of todelete) {
                this._meta.deletePermanently(idx, false);
            }
        }

        this._meta.makeNameFull();

        this._metaProvider.save();
        this.populateScrollView();
        log(todelete);
        this._inputWindow.writeOutput(`Deleted ${todelete.length} urls`);
        const newFile = this._data.join("\r\n");
        downloadTextFromBrowser(this._meta.name, newFile);
    }

    private updateFavorites() {
        if (this._data.length > 0) {
            this.favoritesButton.setData(this._favoritesProvider.entities.map((e, i) => ({
                name: e.name,
                id: i,
                markered: e.has(this._data[this._selectedIdx])
            })));
        } else {
            this.favoritesButton.setData(this._favoritesProvider.names.map((x, i) => ({ id: i, name: x })));
        }
    }

    loadPhotoWithIdx(idx: number) {
        if (idx < this._data.length) {
            this._selectedIdx = idx;
            this.currentIndex.string = String(this._selectedIdx + 1);

            this.photoDownloader.downloadPhoto(this._data[idx]).then((spriteFrame: DownloadedSpriteFrame) => {
                this.targetSprite.spriteFrame = spriteFrame.spriteFrame;
                const transform = this.targetSprite.node.getComponent(UITransform);
                transform.setContentSize(spriteFrame.width, spriteFrame.height);

                const margin = 70;
                this.camera.setLimits(new Bounds(-spriteFrame.width / 2 - margin, -spriteFrame.height / 2 - margin, spriteFrame.width + 2 * margin, spriteFrame.height + 2 * margin));
                switch (LocalSettings.instance.initialZoom) {
                    case InitialZoomType.CENTERED:
                        this.camera.node.position = new Vec3(0, 0, this.camera.node.position.z);
                        this.camera.setZoom(1);
                        break;
                    case InitialZoomType.FIT:
                        this.camera.node.position = new Vec3(0, 0, this.camera.node.position.z);
                        this.camera.setFitZoom();
                        break;
                    case InitialZoomType.COMICS:
                        this.camera.setZoom(1);
                        this.camera.setPercentPosition(new Vec2(0, 1));
                        break;

                    default:
                        break;
                }
                this.imageLoaded();
            });
        }
    }

    imageLoaded() {
        const idx = this._mapIndex && this._selectedIdx < this._mapIndex.length ? this._mapIndex[this._selectedIdx] : this._selectedIdx;
        this.likeButon.isChecked = this._meta.isLiked(idx);
        this.deleteButon.isChecked = this._meta.isDeleted(idx);
        this.updateFavorites();
        if (this._mapIndex == null)
            this._meta.currentIndex = this._selectedIdx;
    }

    processData(str: string, fileName?: string) {
        this._data = str.split(/\r?\n/);
        this.trimEmptyEnd();
        if (fileName) {
            this._meta = this._metaProvider.getFileMeta(fileName, ContentManager.getFileIdData(this._data));
        }
        this.populateScrollView();
        if (this._meta.currentIndex >= 0 && this._meta.currentIndex < this._data.length) {
            this.loadPhotoWithIdx(this._meta.currentIndex);
        }
    }

    private trimEmptyEnd() {
        while (this._data[this._data.length - 1].length <= 0)
            this._data.pop();
    }

    next() {
        //log(this._selectedIdx + 1);
        if (this._selectedIdx + 1 < this._data.length) {
            this.loadPhotoWithIdx(this._selectedIdx + 1);
        }
    }

    previous() {
        //log(this._selectedIdx - 1);
        if (this._selectedIdx - 1 >= 0) {
            this.loadPhotoWithIdx(this._selectedIdx - 1);
        }
    }

    setZoom(event: EventTouch, zoom: number) {
        //log(zoom);
        this.camera.setZoom(zoom);
    }

    makeFavorite() {
        if (this._meta) {
            const idx = this._mapIndex && this._selectedIdx < this._mapIndex.length ? this._mapIndex[this._selectedIdx] : this._selectedIdx;
            if (this._meta.isLiked(idx)) {
                this._meta.removeFromFavorites(idx);
            } else {
                this._meta.addFavoriteWithIdx(idx, this._data[this._selectedIdx]);
            }
        }
    }

    deleteCurrent() {
        if (this._meta) {
            const idx = this._mapIndex && this._selectedIdx < this._mapIndex.length ? this._mapIndex[this._selectedIdx] : this._selectedIdx;
            if (this._meta.isDeleted(idx)) {
                this._meta.restore(idx);
            } else {
                this._meta.delete(idx);
            }
        }
    }

    openInputWindow() {
        WindowDirector.instance.openWindow('input') as InputWindow;
        this._inputWindow.setFilesWithMetaDate(this._metaProvider.entities, this._meta);
    }

    openFavoritesWindow() {
        const fw = WindowDirector.instance.openWindow('favorites') as FavoritesWindow;
    }

    toggleFavoritesList(d: DropListItem) {
        if (this._data.length > 0) {
            const list = this._favoritesProvider.getMetaDataEntity(d.name);
            if (!list.has(this._data[this._selectedIdx])) {
                list.addFavoriteWithIdx(this._selectedIdx, this._data[this._selectedIdx]);
            } else {
                list.removeFromFavoritesUrl(this._data[this._selectedIdx])
            }
        }
    }

    private static getFileIdData(data: string[]): FileIdentificationData {
        let i = 0;
        const id: FileIdentificationData = { firstUrls: [] };
        while (i < data.length && i < 3)
            id.firstUrls.push(data[i++]);
        return id;
    }

}
