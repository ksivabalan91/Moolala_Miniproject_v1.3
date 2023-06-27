export class DCA{
    public ticker!: string;
    public startDate!: Date;
    public endDate!: Date;
    public investInterval!: number;
    public investAmount!: number;
    public initialAmount!: number;


    constructor(ticker:string, startDate:Date, endDate:Date, investInterval:number, investAmount:number, initialAmount:number){
        this.ticker = ticker;
        this.startDate = startDate;
        this.endDate = endDate;
        this.investInterval = Math.floor(investInterval);
        this.investAmount = investAmount;
        this.initialAmount = initialAmount;
    }
}