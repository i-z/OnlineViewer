
import { _decorator, Component, Node, assetManager, Sprite, log, Texture2D, ImageAsset, SpriteFrame, UITransform } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('PhotoDownloader')
export class PhotoDownloader extends Component {

    @property(Sprite)
    targetSprite: Sprite = null;

    start () {
    }

    downloadAndShow(url:string) {
        assetManager.loadRemote(url, (err, asset) => {
            const imageAsset = asset as ImageAsset
            const spriteFrame = new SpriteFrame();
            const tex = new Texture2D();
            tex.image = imageAsset;
            spriteFrame.texture = tex;
            this.targetSprite.spriteFrame = spriteFrame;
            const transform = this.targetSprite.node.getComponent(UITransform);
            transform.setContentSize(imageAsset.width, imageAsset.height);
        });
    }
}
