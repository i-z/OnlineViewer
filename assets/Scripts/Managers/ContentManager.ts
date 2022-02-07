
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
import { FileMeta } from '../Core/FileMeta';
import { downloadTextFromBrowser } from '../Utils/DOMHelper';
import { CustomToggleButton } from '../Components/CustomToggleButton';
const { ccclass, property } = _decorator;

@ccclass('ContentManager')
export class ContentManager extends Component {

    @property(InputWindow)
    inputWindow: InputWindow;

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

    private _data: string[] = []
    private _selectedIdx: number = 0;
    get selectedIndex(): number {
        return this._selectedIdx;
    }

    private _metaProvider: FileMetaProvider = null;
    private _meta: FileMeta = null;

    start() {
        this._metaProvider = new FileMetaProvider();

        this.inputWindow.node.on(InputWindowEvents.INPUT, (text: string) => {
            if (text.length > 0) {
                WindowDirector.instance.closeWindow('input');
            }
            this.processData(text);
        });

        this.inputWindow.node.on(InputWindowEvents.DOWNLOAD_META, (name: string) => {
            const m = this._metaProvider.getFileMeta(name);
            if (m) {
                downloadTextFromBrowser(name + '.json', m.toJSON());
            }
        });

        this.listScroll.node.on(ListScrollViewEvent.SELECT_ITEM, (idx: number) => {
            this.loadPhotoWithIdx(idx);
        });

        this.textFileInput.node.on(FileInputEventType.DATA_RECEIVED, (str: string) => {
            this.processData(str, this.textFileInput.currentFileName);
            this.fileName.string = this.textFileInput.currentFileName;
        });

        const scene = this.getComponent(MainScene);
        scene.node.on(MainSceneEventType.FILE_INPUT_REQUESTED, () => {
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

                this.likeButon.isChecked = this._meta.isLiked(this._selectedIdx);
                this.deleteButon.isChecked = this._meta.isDeleted(this._selectedIdx);

            });
        }
    }

    processData(str: string, fileName?: string) {
        this._data = str.split(/\r?\n/);
        this.trimEmptyEnd();
        this.listScroll.setData(this._data);
        if (fileName) {
            this._meta = this._metaProvider.getFileMeta(fileName);
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

            if (this._meta.isLiked(this._selectedIdx)) {
                this._meta.removeFromFavorites(this._selectedIdx);
            } else {
                this._meta.addFavorite({ index: this._selectedIdx, url: this._data[this._selectedIdx] });
            }
            
            
        }
    }

    deleteCurrent() {
        if (this._meta) {
            if (this._meta.isDeleted(this._selectedIdx)) {
                this._meta.restore(this._selectedIdx);
            } else {
                this._meta.delete(this._selectedIdx);
            }
        }
    }

    openInputWindow() {
        const iw = WindowDirector.instance.openWindow('input') as InputWindow;
        iw.setFilesWithMetaDate(this._metaProvider.files);
    }
}
