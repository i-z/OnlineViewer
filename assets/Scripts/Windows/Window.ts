import { _decorator, Component, Enum, tween, Node, UIOpacity, Tween, Vec3, Animation, log, UITransform, Size, Widget } from 'cc';
const { ccclass, property, requireComponent } = _decorator;
import WindowDirector from './WindowDirector';
import { WindowTransitionBase} from './WindowTransitionBase';

export enum WindowState {
    CLOSED,
    OPENING,
    OPEN,
    CLOSING
}

export enum WindowBehaviour {
    NORMAL,
    MODAL,
    MODAL_MESSAGE
}

export enum WindowEventType {
    OPENING = "opening",
    OPENED = "opened",
    CLOSING = "closing",
    CLOSED = "closed"
}

@ccclass('Window')
@requireComponent(UITransform)
@requireComponent(Widget)
export default class Window extends Component {
    @property({ type: Enum(WindowBehaviour) })
    behaviour: WindowBehaviour = WindowBehaviour.MODAL;

    private _state: WindowState = WindowState.CLOSED;
    private _transform: UITransform = null;

    onLoad() {
        this._transform = this.getComponent(UITransform);
    }

    show(tr: WindowTransitionBase): boolean {
        if (this.getState() == WindowState.CLOSED) {
            this.onOpening();
            if (tr) {
                tr.open(this.node)
                .then(this.onOpened.bind(this));
            } else {
                this.onOpened();
            }
            return true;
        }
        log(`Window ${this.name} not ready to open`);
        return false;
    }

    hide(tr: WindowTransitionBase): boolean {
        if (this.getState() == WindowState.OPEN) {
            this.onClosing();
            if (tr) {
                tr.close(this.node)
                .then(this.onClosed.bind(this));
            } else {
                this.onClosed();
            }
            return true;
        }
        log(`Window ${this.name} not ready to close`);
        return false;
    }

    close() {
        WindowDirector.instance.closeWindow(this.name);
    }

    getState(): WindowState {
        return this._state;
    }

    protected onOpening() {
        this._state = WindowState.OPENING;
        this.node.active = true;
        this.node.emit(WindowEventType.OPENING);
    }

    protected onOpened() {
        this._state = WindowState.OPEN;
        this.node.emit(WindowEventType.OPENED);
    }

    protected onClosing() {
        this._state = WindowState.CLOSING;
        this.node.emit(WindowEventType.CLOSING);
    }

    protected onClosed() {
        this._state = WindowState.CLOSED;
        this.node.emit(WindowEventType.CLOSED);
        this.node.active = false;
    }

    public get windowSize() : Size {
        return this._transform.contentSize;
    }
    public set windowSize(v : Size) {
        this._transform.contentSize = v;
        const w =this.getComponent(Widget);
        w.updateAlignment();
    }
    
}