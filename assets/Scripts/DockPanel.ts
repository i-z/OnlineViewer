
import { _decorator, Component, Node, Widget, UITransform, tween, Size, log } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('DockPanel')
export class DockPanel extends Component {

    @property(Widget)
    widget: Widget;
    @property
    animationTime: number = 0.2;
    
    _contentSize: Size;

    start () {
        const tr: UITransform = this.node.getComponent(UITransform);
        this._contentSize = tr.contentSize;
        this.widget.left = -this._contentSize.width;
    }

    show() {
        tween(this.widget)
        .to(this.animationTime, { left: 0 })
        .start();
    }

    hide() {
        tween(this.widget)
        .to(this.animationTime, { left: -this._contentSize.width })
        .start();
    }
}