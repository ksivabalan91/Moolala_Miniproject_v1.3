import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Lot } from '../components/investment/models/lot.model';
import { Portfolio } from '../components/investment/models/portfolio.model';
import { Ticker } from '../components/investment/models/ticker.model';
import { PortfolioRepoService } from './portfolio-repo.service';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {

  constructor(private http: HttpClient, private portfolioRepoSvc: PortfolioRepoService) { }

  portfolio!: Portfolio;
  portfolioId!: number;
  updateColor = new Subject<string>();
  updateSign = new Subject<string>();
  
  getPortfolio(portfolioId: number) {
    // this.portfolio = this.generateExamplePortFolio();
    this.portfolioId = portfolioId;
    this.portfolio = this.portfolioRepoSvc.getPortfolio(portfolioId);      
    console.log("PortfolioService's Port folio", this.portfolio)
    return this.portfolio;
  }
  
  updateLots(tickerIdx: number, lots: Lot[]) {
    this.portfolio.tickers[tickerIdx].updateLots(lots);
    this.portfolio.update();
    this.portfolioRepoSvc.saveAllPortfolios();
  }
  
  addTicker(ticker:string){
    const lots: Lot[] = [];
    this.portfolio.tickers.push(new Ticker(ticker,0,lots));
    this.portfolioRepoSvc.getCurrentPrice();
    this.portfolio.update();       
  }
  
  deleteTicker(tickerIdx: number) {
    this.portfolio.tickers.splice(tickerIdx, 1);
    console.log(this.portfolio.tickers)
    this.portfolio.update();
    this.portfolioRepoSvc.saveAllPortfolios();     
  }
  
}
