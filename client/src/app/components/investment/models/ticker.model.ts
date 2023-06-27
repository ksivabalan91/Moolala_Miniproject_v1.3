import { Lot } from "./lot.model";

export class Ticker {
    public ticker!: string;
    // public isCrypto!: boolean;
    public totalShares!: number;
    public averageCostPerShare!: number;
    public currentPrice!: number;
    public marketValue!: number;
    public totalGain!: number;
    public lots!: Lot[];

    constructor(ticker: string, currentPrice: number, lots: Lot[]) {
        //! iterate through array to consolidate total amount invested
        let totalInvested = lots.reduce((a, b) => a + (b.shares * b.costPerShare), 0);
        this.lots = lots;
        this.ticker = ticker;
        this.currentPrice = currentPrice
        this.totalShares = lots.reduce((a, b) => a + b.shares, 0);
        this.averageCostPerShare = totalInvested / this.totalShares;
        this.marketValue = this.currentPrice * this.totalShares;
        this.totalGain = this.marketValue - totalInvested;
    }

    public updateLots(lots:Lot[]) {
        this.lots=lots
        let totalInvested = this.lots.reduce((a, b) => a + (b.shares * b.costPerShare), 0);
        this.totalShares = this.lots.reduce((a, b) => a + b.shares, 0);
        this.averageCostPerShare = totalInvested / this.totalShares;
        this.marketValue = this.currentPrice * this.totalShares;
        this.totalGain = this.marketValue - totalInvested;
    }

    public updateCurrentPrice(currentPrice: number) {
        this.currentPrice = currentPrice;
        if(this.lots.length > 0){
            for (let lot of this.lots) {
                lot.updateMetaData(currentPrice);
            }
            this.updateLots(this.lots)
        }
    }

}