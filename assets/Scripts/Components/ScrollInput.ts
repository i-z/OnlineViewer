
import { _decorator, Component, Node, log, EventMouse, UITransform, Vec2, director } from 'cc';
const { ccclass, property } = _decorator;

export enum ScrollInputEventType {
    UPDATE_Y = 'update_y'
}

@ccclass('ScrollInput')
export class ScrollInput extends Component {

    @property(Node)
    touchInputPanel: Node = null;
    @property
    width: number = 100;
    @property
    height: number = 100;

    @property
    min: number = 0;
    @property
    max: number = 860;

    @property(Vec2)
    canvasPosition: Vec2 = new Vec2(1, 0);

    private _scrollDiv: HTMLDivElement = null;
    private _scrollBorderDiv: HTMLDivElement = null;
    private _innerDiv: HTMLDivElement = null;
    private _scrollBarSize: number = 0;
    private _canvasRect: DOMRect = null;
    private _valueY: number = 0;

    public get valueY(): number {
        return this._scrollDiv.scrollTop + this.min;
    }
    public set valueY(v: number) {
        this._valueY = Math.round(v);
        this._scrollDiv.scrollTop = Math.round(v) - this.min
    }

    onLoad() {
        this._scrollDiv = document.createElement("div");
        this._scrollDiv.id = "scrollDiv";
        this._scrollDiv.style.width = `${this.width}px`;
        this._scrollDiv.style.height = `${this.height}px`;
        this._scrollDiv.style.position = "absolute";
        this._scrollDiv.style.left = `0px`;
        this._scrollDiv.style.top = `0px`;
        this._scrollDiv.style.overflow = "scroll";
        this._scrollDiv.style.opacity = "0";

        this._scrollBorderDiv = document.createElement("div");
        this._scrollBorderDiv.id = "scrollBorderDiv";
        this._scrollBorderDiv.style.width = `${this.width - 2}px`;
        this._scrollBorderDiv.style.height = `${this.height - 2}px`;
        this._scrollBorderDiv.style.position = "absolute";
        this._scrollBorderDiv.style.left = `0px`;
        this._scrollBorderDiv.style.top = `0px`;
        this._scrollBorderDiv.style.border = "1px solid";

        this._innerDiv = document.createElement("div");
        this._innerDiv.style.height = `${this.height}px`;
        this._innerDiv.style.backgroundColor = "red";
        this._innerDiv.style.backgroundImage = "radial-gradient(circle, #000000 1px, rgba(0, 0, 0, 0) 1px)";
        this._innerDiv.style.backgroundSize = "20px 20px";

        this._scrollDiv.appendChild(this._innerDiv);
        document.body.appendChild(this._scrollBorderDiv);
        document.body.appendChild(this._scrollDiv);
        this._scrollBarSize = this._scrollDiv.offsetHeight - this._scrollDiv.clientHeight;

        this.updateSize();

        this._scrollDiv.addEventListener('scroll', (event: WheelEvent) => {
            if (this._scrollDiv.scrollTop + this.min != this._valueY) {
                this.node.emit(ScrollInputEventType.UPDATE_Y, this._scrollDiv.scrollTop + this.min);
                this._valueY = this._scrollDiv.scrollTop + this.min; 
            }
        })

        this._scrollDiv.addEventListener('mousemove', (event: MouseEvent) => {
            //log(`${event.x - this._canvasRect.x} ${this._canvasRect.y + this._canvasRect.height - event.y}`);
        })

        this.node.on(Node.EventType.SIZE_CHANGED, this.updateSize.bind(this));
    }

    public updateSize() {
        const canvas = document.getElementById('GameCanvas');
        this._canvasRect = canvas.getBoundingClientRect();
        this._scrollDiv.style.width = `${this.width}px`;
        this._scrollDiv.style.height = `${this.height}px`;
        this._innerDiv.style.width = `${this.width - 20}px`;
        this._innerDiv.style.height = `${this._scrollDiv.offsetHeight - this._scrollBarSize + (this.max - this.min)}px`;
        this._scrollDiv.style.left = `${this._canvasRect.x + this.canvasPosition.x * (this._canvasRect.width - this._scrollDiv.offsetWidth)}px`;
        this._scrollDiv.style.top = `${this._canvasRect.y + (1 - this.canvasPosition.y) * (this._canvasRect.height - this._scrollDiv.offsetHeight)}px`;
        this._scrollBorderDiv.style.width = `${this.width - 2}px`;
        this._scrollBorderDiv.style.height = `${this.height - 2}px`;
        this._scrollBorderDiv.style.left = this._scrollDiv.style.left;
        this._scrollBorderDiv.style.top = this._scrollDiv.style.top
    }
}
