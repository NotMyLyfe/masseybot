export default class BucketLimit {
    public name : string;
    public limit : number;
    public remaining : number;
    private _reset : Date;
    public resetAfter : number;
    
    constructor(name = '', limit = 0, remaining = 0, reset = new Date(0), resetAfter = 0){
        this.name = name;
        this.limit = limit;
        this.remaining = remaining;
        this._reset = reset;
        this.resetAfter = resetAfter;
    }

    public get reset() : Date{
        return this._reset;
    }

    public set reset(reset : Date | number){
        if(reset instanceof Date){
            this._reset = reset;
        } else {
            this._reset = new Date(reset);
        }
    }
}
