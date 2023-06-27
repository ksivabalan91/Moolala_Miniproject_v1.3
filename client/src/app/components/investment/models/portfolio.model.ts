import { Ticker } from "./ticker.model";

export class Portfolio{
    public portfolioName!:string;
    public netValue!:number;
    public totalGain!:number;
    public totalGainPercent!:number;
    public tickers!: Ticker[];


    constructor(portfolioName:string, tickers:Ticker[]){
        this.portfolioName = portfolioName;
        if(tickers.length>0){
            this.tickers = tickers;
            this.netValue = tickers.reduce((a,b)=>a+b.marketValue,0);
            this.totalGain = tickers.reduce((a,b)=>a+b.totalGain,0);
            this.totalGainPercent=this.totalGain/(this.netValue-this.totalGain)
        }else{
            this.tickers = tickers;
            this.netValue = 0
            this.totalGain = 0
            this.totalGainPercent= 0
        }
    }
    
    public update(){
        this.netValue = this.tickers.reduce((a,b)=>a+b.marketValue,0);
        this.totalGain = this.tickers.reduce((a,b)=>a+b.totalGain,0);
        this.totalGainPercent=this.totalGain/(this.netValue-this.totalGain)
    }
    public sortTickersByMarketValue() {
        this.tickers.sort((a, b) => a.marketValue - b.marketValue);
      }
}