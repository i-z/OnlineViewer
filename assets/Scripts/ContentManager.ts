
import { _decorator, Component, Node, log, EditBox, Input, HtmlTextParser, EventMouse, EventKeyboard, systemEvent, input, Sprite, SpriteFrame, UITransform, Canvas, Vec3, SpringJoint2D } from 'cc';
import { ListScrollView, ListScrollViewEvent } from './ListScrollView';
import { PaginatedListScrollView } from './PaginatedListScrollView';
import { DownloadedSpriteFrame, PhotoDownloader } from './PhotoDownloader';
import { InputWindow, InputWindowEvents } from './AppWindows/InputWindow';
import WindowDirector from './Windows/WindowDirector';
import { WindowManager } from './Windows/WindowManager';
import { MainScene, MainSceneEventType } from './MainScene';
import { FileInput, FileInputEventType } from './Components/FileInput';
import { PlayerCameraController } from './Controllers/PlayerCameraController';
import { Bounds } from './Components/Bounds';
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

    @property(PlayerCameraController)
    camera: PlayerCameraController = null;

    @property(Canvas)
    canvas: Canvas;

    private _data: string[] = []

    start() {
        this.inputWindow.node.on(InputWindowEvents.INPUT, (text: string) => {
            if (text.length > 0) {
                WindowDirector.instance.closeWindow('input');
            }
            this.processData(text);
        });

        this.listScroll.node.on(ListScrollViewEvent.SELECT_ITEM, (idx: number) => {
            if (idx < this._data.length) {
                //this.photoDownloader.downloadAndShow(this._data[idx]);

                this.photoDownloader.downloadPhoto(this._data[idx]).then((spriteFrame: DownloadedSpriteFrame) => {
                    this.targetSprite.spriteFrame = spriteFrame.spriteFrame;
                    const transform = this.targetSprite.node.getComponent(UITransform);
                    transform.setContentSize(spriteFrame.width, spriteFrame.height);
                    const ctr = this.canvas.getComponent(UITransform)
                    this.camera.setZoom(1);
                    this.camera.node.position = new Vec3(0, 0, this.camera.node.position.z);
                    const margin = 10;
                    this.camera.setLimits(new Bounds(-spriteFrame.width / 2 - margin, -spriteFrame.height / 2 - margin, spriteFrame.width + 2 * margin, spriteFrame.height + 2 * margin));
                });
            }
        });

        this.textFileInput.node.on(FileInputEventType.DATA_RECEIVED, (str: string) => {
            this.processData(str);
        });

        const scene = this.getComponent(MainScene);
        scene.node.on(MainSceneEventType.FILE_INPUT_REQUESTED, () => {
            this.textFileInput.request();
        })
    }

    processData(str: string) {
        this._data = str.split(/\r?\n/);
        log(this._data.length);
        this.listScroll.setData(this._data);
    }
}
