
import { _decorator, Component, Node, input, log } from 'cc';
const { ccclass, property } = _decorator;

export enum FileInputEventType {
    DATA_RECEIVED = 'data_received'
}
 
@ccclass('FileInput')
export class FileInput extends Component {
    private _input: HTMLInputElement = null;
    private _currentFileName: string = '';

    start () {
        //<input type="file" id="inputFile" style="display: none;">
        this._input = document.createElement('input');
        this._input.id = 'inputFile';
        this._input.type = 'file';
        this._input.style.display = 'none';
        document.body.appendChild(this._input);
        this._input.addEventListener('change', this.getFileData.bind(this));
    }

    request() {
        this._input.click();
    }

    private getFileData(event: Event) {
        const input: HTMLInputElement = event.target as HTMLInputElement;
        if ('files' in input && input.files.length > 0) {
            this._currentFileName = input.files[0].name;
            this.readFileContent(input.files[0]).then(content => {
                this.node.emit(FileInputEventType.DATA_RECEIVED, content as string);
            }).catch(error => console.log(error))
        }
    }

    private readFileContent(file) {
        const reader = new FileReader()
      return new Promise((resolve, reject) => {
        reader.onload = event => resolve(event.target.result)
        reader.onerror = error => reject(error)
        reader.readAsText(file)
      })
    }

    get currentFileName() {
        return this._currentFileName;
    }
}

