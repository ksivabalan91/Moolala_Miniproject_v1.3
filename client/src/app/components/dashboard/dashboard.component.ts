import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { PortfolioRepoService } from 'src/app/services/portfolio-repo.service';
import { Portfolio } from '../investment/models/portfolio.model';
import { TickerColor } from '../charts/Models/ticker-color.model';
import { Ticker } from '../investment/models/ticker.model';
import { AnimationOptions } from 'ngx-lottie';
import { faSocks } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  title = 'clock-greets';
  time!: Date;
  hours!: number;
  msg!: string;
  username!: string | null
  faSocks = faSocks;
  lottieOptions1!: AnimationOptions;
  lottieOptions2!: AnimationOptions;
  lottieOptions3!: AnimationOptions;
  lottieOptions4!: AnimationOptions;
  userUID!: string;
  netValue!: number;
  totalGain!: number;
  totalGainPercent!: number;
  portfolioName: string = 'NAV';
  portfolioList: Portfolio[] = [];
  consolidatedPortfolioList: Portfolio[] = [];
  newPortfolioNames: string[] = [];
  isEdit: boolean[] = [];
  tickerColors: TickerColor[][] = [];
  authSub$ = new Subscription();
  isLoading = true;

  constructor(private portfolioRepoSvc: PortfolioRepoService, private router: Router, private authSvc: FirebaseauthService) {
    setInterval(() => {
      this.time = new Date();
    }, 1000);

    this.decide();
  }
  async ngOnInit() {
    this.lottieOptions1 = {
      path: '/assets/animations/64165-statistics-chart.json',
      loop: true,
      autoplay: true,
    };
    this.lottieOptions2 = {
      path: '/assets/animations/52717-fire.json',
      loop: true,
      autoplay: true,
    };
    this.lottieOptions3 = {
      path: '/assets/animations/95634-spinner-loader.json',
      loop: true,
      autoplay: true,
    };
    this.lottieOptions4 = {
      path: '/assets/animations/28442-space.json',
      loop: true,
      autoplay: true,
    };
    const user = await this.authSvc.getCurrentUser()
    if (user == null)
      this.router.navigate(['/']);
    else {
      this.userUID = user?.uid;
      this.username = user?.displayName;
    }

    const data: Portfolio[] = await this.portfolioRepoSvc.getAllPortFolios(this.userUID)
      .catch((err) => {
        console.log(err)
        console.log('no portfolios found')
        this.portfolioRepoSvc.setAllPortfolios([]);
        this.portfolioList = this.portfolioRepoSvc.portfolios;
        this.isLoading = false;
        return [];
      });

    await this.portfolioRepoSvc.getAllChartData(this.userUID).catch((err) => {
      this.isLoading = false;
    });
    this.portfolioRepoSvc.setAllPortfolios(data);
    this.portfolioList = this.portfolioRepoSvc.portfolios;
    this.consolidatePorfolio();
    this.netValue = this.portfolioList.reduce((a, b) => a + b.netValue, 0)
    this.totalGain = this.portfolioList.reduce((a, b) => a + b.totalGain, 0)
    this.totalGainPercent = this.totalGain / (this.netValue - this.totalGain)

    for (let portfolio of this.portfolioList) {
      this.isEdit.push(true);
      this.newPortfolioNames.push(portfolio.portfolioName);
    }
    this.isLoading = false;
  }

  setColors(data: TickerColor[]) {
    const tickerarray = data.sort((a, b) => b.percent - a.percent).slice(0, 5);
    this.tickerColors.push(tickerarray);
  }

  changeChart(idx: number, lineChart: HTMLElement) {
    if (idx == 1337) {
      this.portfolioName = 'NAV';
    } else {
      this.portfolioName = this.portfolioList[idx].portfolioName;
    }
    lineChart.scrollIntoView({ behavior: 'smooth' });
  }

  openPortfolio(portfolioId: number) {
    this.router.navigate(['portfolio', portfolioId])
  }

  consolidatePorfolio() {
    const combinedPortfolio: Portfolio = new Portfolio('Combined', []);
    combinedPortfolio.portfolioName = 'Combined Portfolio';

    for (const portfolio of this.portfolioList) {
      combinedPortfolio.netValue += portfolio.netValue;
      combinedPortfolio.totalGain += portfolio.totalGain;

      for (const ticker of portfolio.tickers) {
        const existingTicker = combinedPortfolio.tickers.find(t => t.ticker === ticker.ticker);
        if (existingTicker) {
          existingTicker.totalShares += ticker.totalShares;
          existingTicker.marketValue += ticker.marketValue;
          existingTicker.totalGain += ticker.totalGain;

          for (const lot of ticker.lots) {
            existingTicker.lots.push(lot);
          }
        } else {
          const newTicker = new Ticker(ticker.ticker, ticker.currentPrice, ticker.lots);
          combinedPortfolio.tickers.push(newTicker);
        }
      }
    }
    console.log(combinedPortfolio)
    this.consolidatedPortfolioList.push(combinedPortfolio);
  }
  exportCSV() {
    this.portfolioRepoSvc.exportCSV(1337);
  }

  decide() {
    this.hours = new Date().getHours();
    if (this.hours < 10) {
      this.msg = "Good Morning"
    } else if (this.hours < 16) {
      this.msg = "Good Afternoon"
    } else if (this.hours < 24) {
      this.msg = "Good Evening"
    }
  }


}
