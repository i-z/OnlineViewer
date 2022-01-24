
import { _decorator, Component, Node, assetManager, Sprite, log, Texture2D, ImageAsset, SpriteFrame, UITransform } from 'cc';
const { ccclass, property } = _decorator;

export interface DownloadedSpriteFrame {
    spriteFrame: SpriteFrame,
    width: number,
    height: number
}

@ccclass('PhotoDownloader')
export class PhotoDownloader extends Component {

    @property(Sprite)
    targetSprite: Sprite = null;

    start() {
    }

    downloadAndShow(url: string) {
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

    downloadPhoto(url: string): Promise<DownloadedSpriteFrame> {
        return new Promise<DownloadedSpriteFrame>((res, rej) => {
            assetManager.loadRemote(url, (err, asset) => {
                if (err) {
                    rej(err);
                    return;
                }
                const imageAsset = asset as ImageAsset
                const spriteFrame = new SpriteFrame();
                const tex = new Texture2D();
                tex.image = imageAsset;
                spriteFrame.texture = tex;
                res({spriteFrame: spriteFrame, width: imageAsset.width, height: imageAsset.height});
            });

        })

    }
}
