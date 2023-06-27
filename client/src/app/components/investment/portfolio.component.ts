import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { BarStyles, ITradingViewWidget, IntervalTypes, Themes } from 'angular-tradingview-widget';
import { PortfolioRepoService } from 'src/app/services/portfolio-repo.service';
import { PortfolioService } from '../../services/portfolio.service';
import { Portfolio } from './models/portfolio.model';
import { ApiService } from 'src/app/services/api.service';
import { News } from './models/news.model';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss'],
})
export class PortfolioComponent implements OnInit, OnDestroy {

  @ViewChild('main', { static: true }) mainContainer!: ElementRef;

  faCirclePlus = faCirclePlus;

  portfolio!: Portfolio;

  addTickerForm!: FormGroup;
  portfolioId!: number;

  allCollasped: boolean = false;
  showChart: boolean = false;

  news!: News[];

  widgetConfig!: ITradingViewWidget;

  constructor(
    private portfolioSvc: PortfolioService,
    private portfolioRepoSvc: PortfolioRepoService,
    private apiSvc: ApiService,
    private actRoute: ActivatedRoute,
    private fb: FormBuilder
  ) { }
  ngOnDestroy() {
    console.log('portfolio component destroyed');
    this.portfolioRepoSvc.updateCharts();
  }

  ngOnInit() {
    this.addTickerForm = this.fb.group({
      newTicker: this.fb.control('', [Validators.required, Validators.minLength(1)])
    })
    this.actRoute.params.subscribe(params => {

      this.portfolioId = params['id'];
      this.portfolio = this.portfolioSvc.getPortfolio(params['id'])
      this.getStockNews();
      
    })


  }

  addTicker() {
    console.log(this.addTickerForm.value['newTicker'])
    this.portfolioSvc.addTicker(this.addTickerForm.value['newTicker'].toUpperCase());
    this.addTickerForm.reset();
  }

  refreshPrices() {
    this.portfolioRepoSvc.getCurrentPrice();
  }

  exportCSV() {
    this.portfolioRepoSvc.exportCSV(this.portfolioId);
  }

  showTradingViewChart(ticker: string) {
    const width = this.mainContainer.nativeElement.offsetWidth
    this.widgetConfig = {
      symbol: ticker,
      allow_symbol_change: true,
      autosize: false,
      enable_publishing: false,
      height: 400,
      hideideas: true,
      hide_legend: false,
      hide_side_toolbar: true,
      hide_top_toolbar: false,
      interval: IntervalTypes.D,
      locale: 'en',
      save_image: true,
      show_popup_button: false,
      style: BarStyles.CANDLES,
      theme: Themes.LIGHT,
      timezone: 'Etc/UTC',
      toolbar_bg: '#F1F3F6',
      widgetType: 'widget',
      width: width,
      withdateranges: false
    };
    console.log('showing chart for ' + ticker);
    this.showChart = true;
  }

  getTickerArray():string{
    let stringArr: string[] = [];
      this.portfolio.tickers.forEach(ticker => {
        stringArr.push(ticker.ticker);
      })
    const tickers = stringArr.join(",");
    return tickers;
  }

  getStockNews(){
    const tickers = this.getTickerArray();

    this.apiSvc.getStockNews(tickers,this.portfolioId).subscribe((data) => {
      if (Array.isArray(data)) {          
        this.news = data.map((newsItem) => {
          return new News(
            new Date(newsItem.publishedDate),
            newsItem.title,
            newsItem.description,
            newsItem.source,
            newsItem.url
          );
        });
      }
    });
  }



}
