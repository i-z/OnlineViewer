
import { _decorator, Component, Node, director, assert, log, tween, UIOpacity, view, Size } from 'cc';
import { WindowTransitionBase } from './WindowTransitionBase';
const { ccclass, property } = _decorator;
import Window, { WindowBehaviour } from './Window';

@ccclass('WindowNode')
export class WindowNode {
    @property
    name: string = '';
    @property(Node)
    window: Node = null;
}

@ccclass('WindowManager')
export class WindowManager extends Component {

    @property([WindowNode])
    windows: WindowNode[] = [];

    @property(Node)
    darkCover: Node = null;

    private _defaultTransition: WindowTransitionBase = null;
    private _activeWindows: Map<string, Window> = new Map<string, Window>();
    private _windows: Array<Window> = new Array<Window>();

    start() {
        this._defaultTransition = this.getComponent(WindowTransitionBase);
        if (!this._defaultTransition) {
            log("WindowManager's default transition is not set");
        }
        this.windows.forEach(w => w.window.active = false);
    }

    openWindow(name: string): Window {
        const wn = this.windows.find(n => n.name == name);
        if (!wn) {
            assert(false, `Can't find window ${name}`);
            return null;
        }
        const aw = this._activeWindows.get(name);
        if (aw) {
            log(`Window ${name} already in use`);
            return null;
        }

        let wnd = wn.window.getComponent(Window);
        if (!wnd) {
            wnd = wn.window.addComponent(Window);
        }

        if (this._windows.length > 0 && this._windows[this._windows.length - 1].behaviour == WindowBehaviour.MODAL && wnd.behaviour != WindowBehaviour.MODAL_MESSAGE) {
            log("Modal window prevents from opening other windows");
            return null;
        }

        wnd.name = name;
        if (!wnd.show(this._defaultTransition)) {
            return null;
        }

        wnd.node.parent.active = true;

        //const viewSize = new Size(view.getVisibleSizeInPixel().x / devicePixelRatio, view.getVisibleSizeInPixel().y / devicePixelRatio);
        const viewSize = view.getVisibleSize();
         const windowSize = wnd.windowSize;
         if (viewSize.width < windowSize.width) {
             windowSize.width = viewSize.width;
         }
         if (viewSize.height < windowSize.height) {
             windowSize.height = viewSize.height;
         }
         wnd.windowSize = windowSize;

        this._activeWindows.set(name, wnd);
        this._windows.push(wnd);
        
        if (wnd.behaviour == WindowBehaviour.MODAL) {
            const op = this.darkCover.getComponent(UIOpacity);
            assert(op, "WindowManager's darkCover requires UIOpacity component");
            op.opacity = 0;
            this.darkCover.active = true;
            tween(op)
            .to(0.15, { opacity: 255 })
            .start();
        }

        return wnd;
    }

    closeWindow(name: string) {
        const wn = this.windows.find(n => n.name == name);
        if (!wn) {
            assert(false, `Can't find window ${name}`);
            return;
        }

        const wnd = this._activeWindows.get(name);
        if (!wnd) {
            log(`Window ${name} already closed`);
            return;
        }

        if (!wnd.hide(this._defaultTransition)) {
            return;
        }

        if (wnd.behaviour == WindowBehaviour.MODAL && wnd === this._windows[this._windows.length - 1]) {
            const op = this.darkCover.getComponent(UIOpacity);
            assert(op, "WindowManager's darkCover requires UIOpacity component");
            tween(op)
            .to(0.15, { opacity: 0 })
            .call(() => this.darkCover.active = false)
            .start();
        }

        this._activeWindows.delete(name);
        this._windows = this._windows.filter(w => w.name != name);
    }

    getWindow(name: string): Window {
        const wn = this.windows.find(n => n.name == name);
        if (!wn) {
            assert(false, `Can't find window ${name}`);
            return null;
        }
        return wn.window.getComponent(Window);
    }

}
