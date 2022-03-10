
import { _decorator, Component, Node, log } from 'cc';
import { ListItemData } from './ListItem';
import { ListScrollView, ListScrollViewEvent } from './ListScrollView';
const { ccclass, property } = _decorator;


@ccclass('PaginatedListScrollView')
export class PaginatedListScrollView extends Component {

    @property(ListScrollView)
    listScroll: ListScrollView;

    @property(ListScrollView)
    paginator: ListScrollView;

    @property
    itemsOnPage: number = 100;

    private _data: string[] = []

    start() {
        this.paginator.node.on(ListScrollViewEvent.SELECT_ITEM, (idx) => {
            this.setPage(idx);
        });
    }

    setData(data: string[], data1?: ListItemData[]) {
        this._data = data;
        const pages = Math.ceil(data.length / this.itemsOnPage);
        const pn = new Array(pages).fill(1).map((e, i) => String(i + 1));
        this.paginator.setData(pn);
        this.setPage(0, data1);
    }

    setPage(num: number, data1?: ListItemData[]) {
        const start = this.itemsOnPage * num;
        const end = start + this.itemsOnPage > this._data.length ? this._data.length : start + this.itemsOnPage;
        this.listScroll.setData(this._data.slice(this.itemsOnPage * num, end), start, data1);
    }

}

