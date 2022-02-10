
import { _decorator, Component, Node, clamp, Prefab, assert, instantiate, log } from 'cc';
import { DropListItem, DropListItemButton } from './DropListItemButton';
const { ccclass, property } = _decorator;

@ccclass('DropList')
export class DropList extends Component {

    private _items: DropListItem[];
    private _itemButtons: DropListItemButton[];

    @property(Prefab)
    itemPrefab: Prefab = null;

    onLoad () {
        assert(this.itemPrefab, "Prefab not found");
    }

    setData(data: DropListItem[]) {
        this._items = data;
        this._itemButtons = [];
        this.node.removeAllChildren();

        for (const i of this._items) {
            const it = instantiate(this.itemPrefab);
            const ib = it.getComponent(DropListItemButton);
            it.parent = this.node;
            ib.onLoad();
            ib.setItem(i);
            this._itemButtons.push(ib);
        }
    }

    show() {
        this._itemButtons.forEach(i => {
            i?.reset();
        });
        this.node.active = true;
    }

    getSelected() {
        for (const ib of this._itemButtons) {
            if (ib.isSelected())
                return ib.getItem();
        }
        return null;
    }
}

