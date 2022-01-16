import { log, Rect, Size, Vec2 } from "cc";

export class Bounds extends Rect {

    public get contentSize(): Vec2 {
        return new Vec2(this.size.width, this.size.y)
    }
    public set contentSize(v: Vec2) {
        const c = this.center;
        this.x = c.x - v.x / 2;
        this.y = c.y - v.y / 2;
        this.size = new Size(v.x, v.y);
    }

    public get center(): Vec2 {
        return new Vec2(this.x + this.width / 2, this.y + this.height / 2);
    }
    public set center(v: Vec2) {
        const off = this.center.subtract(v);
        this.x -= off.x;
        this.y -= off.y;
    }

}