
import { _decorator, Component, Node, UIOpacity, assert, tween } from 'cc';
import { WindowTransitionBase } from './WindowTransitionBase';
const { ccclass, property } = _decorator;
 
@ccclass('FadeWindowTransition')
export class FadeWindowTransition extends WindowTransitionBase {

   open(w: Node): Promise<void> {
      const op = w.getComponent(UIOpacity);
      assert(op, "FadeWindowTransition requires UIOpacity");
      op.opacity = 0;
      return new Promise<void>((res) => {
          tween(op)
          .to(0.15, { opacity: 255 })
          .call(res)
          .start()
      });
  }

  close(w: Node): Promise<void> {
   const op = w.getComponent(UIOpacity);
   assert(op, "FadeWindowTransition requires UIOpacity");
      return new Promise<void>((res) => {
          tween(op)
          .to(0.15, { opacity: 0 })
          .call(res)
          .start()
      });
  }

}