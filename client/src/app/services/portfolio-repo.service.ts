import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom, map } from 'rxjs';
import { LineChart } from '../components/charts/Models/line-chart.model';
import { Lot } from '../components/investment/models/lot.model';
import { Portfolio } from '../components/investment/models/portfolio.model';
import { Ticker } from '../components/investment/models/ticker.model';

@Injectable({
  providedIn: 'root'
})
export class PortfolioRepoService {

  constructor(private http: HttpClient) {
  }

  serverUrl = 'http://localhost:8080/api/';
  // serverUrl = 'https://moola-la-production.up.railway.app/api/';
  portfolios!: Portfolio[];
  userId!: string;
  allChartData!: any;

  getAllPortFolios(userId: string) {
    this.userId = userId;
    console.log('get all portfolios');
    const headers = new HttpHeaders().set('Accept', 'application/json');
    return lastValueFrom(this.http.get(this.serverUrl + userId + '/getallportfolios', { headers }).pipe(
      map((data: any) => this.mapPortFolioData(data))
    ))
  }

  getCurrentPrice() {
    const params = new HttpParams().set('tickers', this.getAllTickers());
    const headers = new HttpHeaders().set('Accept', 'application/json');
    lastValueFrom(this.http.get(this.serverUrl + 'stockprice', { params, headers }))
      .then((data: any) => {
        this.portfolios.forEach((portfolio: Portfolio) => {
          portfolio.tickers.forEach((ticker: Ticker) => {
            const matchingTicker = data.find((item: any) => item.ticker.toLowerCase() === ticker.ticker.toLowerCase())
            if (matchingTicker) {
              ticker.updateCurrentPrice(matchingTicker.last);
            }
          });
          portfolio.update();
        });
      }).then(() => { this.saveAllPortfolios() })
  }
  getCurrentPriceForOne(ticker:string) {
    const params = new HttpParams().set('tickers', ticker.trim());
    const headers = new HttpHeaders().set('Accept', 'application/json');
    return lastValueFrom(this.http.get( this.serverUrl+ 'stockprice', { params, headers })).then((data: any) => {
      const lastValue = data[0].last;
      return lastValue;
    })
  }

  getAllTickers(): string {
    const stringArr: string[] = this.portfolios.reduce((tickers: string[], portfolio: Portfolio) => {
      return tickers.concat(portfolio.tickers.map(ticker => ticker.ticker));
    }, []);
    return stringArr.join(',');
  }

  setAllPortfolios(portfolios: Portfolio[]) {
    this.portfolios = portfolios;
  }

  addNewPortfolio(portfolioName: string) {
    this.portfolios.push(new Portfolio(portfolioName, []));
    this.saveAllPortfolios();
  }

  updatePortfolioName(portfolioIdx: number, portfolioName: string) {
    this.portfolios[portfolioIdx].portfolioName = portfolioName;
    this.saveAllPortfolios();
  }

  updateCharts() {
    this.http.put(this.serverUrl + this.userId + '/updateChartData',null)
      .subscribe(
        (response: any) => {
          console.log(response);
        }
      );

  }
  deletePortfolio(portfolioIdx: number) {
    this.portfolios.splice(portfolioIdx, 1);
    this.saveAllPortfolios();
  }

  getPortfolio(portfolioIdx: number): Portfolio {
    if (this.portfolios.length > 0) {
      return this.portfolios[portfolioIdx];
    }
    else {
      return this.portfolios[0];
    }
  }

  saveAllPortfolios() {
    this.http.put(this.serverUrl + this.userId + '/updateportfolios', this.portfolios)
      .subscribe(
        (response: any) => {
          console.log(response);
        }
      );
  }

  //! This is to make sure the mapped arrays are the correct classes of Ticker and Lot
  mapPortFolioData(data: any): Portfolio[] {
    return data.map(
      (portfolioData: any) => {
        const tickers = portfolioData.tickers.map(
          (tickerData: any) => {
            const lots = tickerData.lots.map(
              (lotData: any) => {
                const lot = new Lot(new Date(lotData.purchaseDate), lotData.shares, lotData.costPerShare)
                lot.marketValue = lotData.marketValue;
                lot.totalGain = lotData.totalGain;
                return lot;
              })
            const ticker = new Ticker(tickerData.ticker, tickerData.currentPrice, lots)
            return ticker;
          })
        const portfolio = new Portfolio(portfolioData.portfolioName, tickers);
        return portfolio;
      })
  }

  getChartData(portfolioname:string):LineChart[] {
    const chartDataArray = this.allChartData[portfolioname];
    if(chartDataArray){
      return chartDataArray.map((lineChartData: any)=>{return new LineChart(lineChartData.date, lineChartData.netValue, lineChartData.cost)})      
    } else{
      return []
    }
  }
  
  async getAllChartData(userId: string){
    const headers = new HttpHeaders().set('Accept', 'application/json');
    this.allChartData =  await lastValueFrom(this.http.get(this.serverUrl + userId + '/getChartData', { headers })).then((data: any) => {return data.charts})
  }

  exportCSV(portfolioIdx: number): void {
    let portfolioName = '';
    let headers = undefined;
    if(portfolioIdx==1337){
      portfolioName = 'all';
    }else{
      portfolioName = this.portfolios[portfolioIdx].portfolioName;
    }
    headers = new HttpHeaders().set('portfolioName', portfolioName);
  
    this.http.get(this.serverUrl + this.userId + '/downloadCSV', { responseType: 'blob', headers: headers })
      .subscribe((data: Blob) => {
        // Create a blob URL for the downloaded file
        const csvFile = new Blob([data], { type: 'text/csv' });
        const downloadUrl = URL.createObjectURL(csvFile);
  
        // Create a link element and trigger the download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = portfolioName+'_data.csv';
        link.click();
  
        // Clean up the temporary blob URL
        URL.revokeObjectURL(downloadUrl);
      });
  }
  

}