
import { _decorator, Component, Node, log, EditBox, Input } from 'cc';
import { ListScrollView, ListScrollViewEvent } from './ListScrollView';
import { PaginatedListScrollView } from './PaginatedListScrollView';
import { PhotoDownloader } from './PhotoDownloader';
import { InputWindow, InputWindowEvents } from './Windows/InputWindow';
import { WindowManager } from './Windows/WindowManager';
const { ccclass, property } = _decorator;
 
@ccclass('ContentManager')
export class ContentManager extends Component {

    @property(InputWindow)
    inputWindow: InputWindow;

    @property(WindowManager)
    windowManager: WindowManager;

    @property(PaginatedListScrollView)
    listScroll: PaginatedListScrollView;

    @property(PhotoDownloader)
    photoDownloader: PhotoDownloader;

    private _data: string[] = []

    start () {
        this.inputWindow.node.on(InputWindowEvents.INPUT, (text:string) => {
            if (text.length > 0) {
                this.windowManager.closeWindow(0);
            }
            this.processData(text);
        });

        this.listScroll.node.on(ListScrollViewEvent.SELECT_ITEM, (idx: number) => {
            if (idx < this._data.length) {
                this.photoDownloader.downloadAndShow(this._data[idx]);
            }
        });
    }

    processData(str:string) {
        this._data = str.split('\n');
        log(this._data.length);
        this.listScroll.setData(this._data);
    }
}
