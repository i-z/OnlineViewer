
import { _decorator, Component, Node, Sprite, tween, Color, assert } from 'cc';
import { TransitionBase } from './TransitionBase';
const { ccclass, property } = _decorator;

@ccclass('BlackFadeTransition')
export class BlackFadeTransition extends TransitionBase {
    @property(Sprite)
    curtain: Sprite = null;

    begin(): Promise<void> {
        assert(this.curtain, "No curtain");
        return new Promise<void>((res) => {
            tween(this.curtain)
            .to(0.15, { color: Color.BLACK })
            .call(res)
            .start()
        });
    }
    
    end(): Promise<void> {
        assert(this.curtain, "No curtain");
        return new Promise<void>((res) => {
            tween(this.curtain)
            .to(0.15, { color: new Color(0, 0, 0, 0) })
            .call(res)
            .start()
        });
    }

}
