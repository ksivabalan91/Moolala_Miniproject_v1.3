export class Lot {
  public purchaseDate!: Date
  public shares!: number
  public costPerShare!: number
  public marketValue!: number
  public totalGain!: number

  constructor(purchaseDate: Date, shares: number, costPerShare: number, currentPrice?: number) {
    this.purchaseDate = purchaseDate;
    this.shares = shares;
    this.costPerShare = costPerShare;

    if (currentPrice !== undefined) {
      this.marketValue = shares * currentPrice;
      this.totalGain = this.marketValue - shares * costPerShare;
    }
  }

  public updateMetaData(currentPrice: number) {
    this.marketValue = this.shares * currentPrice;
    this.totalGain = this.marketValue - this.shares * this.costPerShare;
  }

}