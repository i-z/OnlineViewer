
import { _decorator, Component, Node, log, EditBox, Input, HtmlTextParser, EventMouse, EventKeyboard, systemEvent, input } from 'cc';
import { ListScrollView, ListScrollViewEvent } from './ListScrollView';
import { PaginatedListScrollView } from './PaginatedListScrollView';
import { PhotoDownloader } from './PhotoDownloader';
import { InputWindow, InputWindowEvents } from './AppWindows/InputWindow';
import WindowDirector from './Windows/WindowDirector';
import { WindowManager } from './Windows/WindowManager';
import { MainScene, MainSceneEventType } from './MainScene';
import { FileInput, FileInputEventType } from './Components/FileInput';
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
                this.photoDownloader.downloadAndShow(this._data[idx]);
            }
        });

        this.textFileInput.node.on(FileInputEventType.DATA_RECEIVED, (str:string) => {
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
