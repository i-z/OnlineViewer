
import { _decorator, Component, Node, Widget, UITransform, tween, Size, log, Enum } from 'cc';
const { ccclass, property } = _decorator;

export enum DockSide {
    TOP,
    LEFT,
    BOTTOM,
    RIGHT
}

@ccclass('DockPanel')
export class DockPanel extends Component {

    @property(Widget)
    widget: Widget;
    @property
    animationTime: number = 0.2;
    @property({ type: Enum(DockSide) })
    dockSide: DockSide = DockSide.LEFT;

    _contentSize: Size;
    _isOpened: boolean = false;

    onLoad() {
        const tr: UITransform = this.node.getComponent(UITransform);
        this._contentSize = tr.contentSize;
        if (!this._isOpened) {
            switch (this.dockSide) {
                case DockSide.LEFT:
                    this.widget.left = -this._contentSize.width;
                    break;
                case DockSide.RIGHT:
                    this.widget.right = -this._contentSize.width;
                    break;
                case DockSide.TOP:
                    this.widget.top = -this._contentSize.height;
                    break;
                case DockSide.BOTTOM:
                    this.widget.bottom = -this._contentSize.height;
                    break;
                default:
                    break;
            }
        }
    }

    show() {
        switch (this.dockSide) {
            case DockSide.LEFT:
                tween(this.widget)
                    .to(this.animationTime, { left: 0 })
                    .start();
                break;
            case DockSide.RIGHT:
                tween(this.widget)
                    .to(this.animationTime, { right: 0 })
                    .start();
                break;
            case DockSide.TOP:
                tween(this.widget)
                    .to(this.animationTime, { top: 0 })
                    .start();
                break;
            case DockSide.BOTTOM:
                tween(this.widget)
                    .to(this.animationTime, { bottom: 0 })
                    .start();
                break;
            default:
                break;
        }
    }

    hide() {
        switch (this.dockSide) {
            case DockSide.LEFT:
                tween(this.widget)
                    .to(this.animationTime, { left: -this._contentSize.width })
                    .start();
                break;
            case DockSide.RIGHT:
                tween(this.widget)
                    .to(this.animationTime, { right: -this._contentSize.width })
                    .start();
                break;
            case DockSide.TOP:
                tween(this.widget)
                    .to(this.animationTime, { top: -this._contentSize.height })
                    .start();
                break;
            case DockSide.BOTTOM:
                tween(this.widget)
                    .to(this.animationTime, { bottom: -this._contentSize.height })
                    .start();
                break;
            default:
                break;
        }
    }

    setOpened(v: boolean) {
        this._isOpened = v;
    }
}