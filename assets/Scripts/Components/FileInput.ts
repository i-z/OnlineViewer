
import { _decorator, Component, Node, input, log, error } from 'cc';
const { ccclass, property } = _decorator;

export enum FileInputEventType {
    DATA_RECEIVED = 'data_received'
}

@ccclass('FileInput')
export class FileInput extends Component {
    private _input: HTMLInputElement = null;
    private _currentFileName: string = '';

    private _resolve: (value: string | PromiseLike<string>) => void = null;
    private _rejection: (reason?: any) => void = null;

    start() {
        //<input type="file" id="inputFile" style="display: none;">
        this._input = document.createElement('input');
        this._input.id = 'inputFile';
        this._input.type = 'file';
        this._input.style.display = 'none';
        document.body.appendChild(this._input);
        this._input.addEventListener('change', this.getFileData.bind(this));
    }

    request(): Promise<string> {
        this._input.click();
        return new Promise((res, rej) => {
            this._resolve = res;
            this._rejection = rej;
        });
    }

    private getFileData(event: Event) {
        const input: HTMLInputElement = event.target as HTMLInputElement;
        if ('files' in input && input.files.length > 0) {
            this._currentFileName = input.files[0].name;
            this.readFileContent(input.files[0]).then(content => {
                if (this._resolve) {
                    this._resolve(content as string);
                }
            }).catch(err => {
                if (this._rejection) {
                    this._rejection(err);
                }
                error(err);
            });
        }
    }

    private async readFileContent(file): Promise<string> {
        const reader = new FileReader()
        return new Promise((resolve, reject) => {
            reader.onload = event => resolve(event.target.result as string)
            reader.onerror = error => reject(error)
            reader.readAsText(file)
        })
    }

    get currentFileName() {
        return this._currentFileName;
    }
}

