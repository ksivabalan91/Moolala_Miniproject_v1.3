import { Component, Input, OnInit, Output } from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { Portfolio } from '../investment/models/portfolio.model';
import { Ticker } from '../investment/models/ticker.model';
import { default as Annotation } from 'chartjs-plugin-annotation';
import { Subject } from 'rxjs';
import { TickerColor } from './Models/ticker-color.model';

@Component({
  selector: 'app-doughnut-chart',
  templateUrl: './doughnut-chart.component.html',
  styleUrls: ['./doughnut-chart.component.scss']
})
export class DoughnutChartComponent implements OnInit {

  @Input()
  portfolio!: Portfolio;
  @Input()
  showLegend: boolean = true;
  @Input()
  showTitle: boolean = false;
  doughnutChartType: ChartType = 'doughnut';

  backgroundColors: string[] = [];

  @Output()
  donutColors = new Subject<TickerColor[]>();

  tickerColor: TickerColor[] = [];

  @Input()
  doughnutChartData!: ChartConfiguration['data'];

  @Input()
  doughnutChartOptions!: ChartConfiguration['options'];

  constructor() {
    Chart.register(Annotation);
  }

  ngOnInit() {
    console.log('initializing doughnut chart')
    if (this.doughnutChartData == undefined) {
      this.doughnutChartData = {
        labels: [],
        datasets: [{
          hoverOffset: 10,
          data: [],
          backgroundColor: this.backgroundColors,
          label: 'Portfolio %',
        }]
      };
    }
    if (this.doughnutChartOptions == undefined) {
      this.doughnutChartOptions = {
        responsive: true,
        plugins: {
          legend: { display: this.showLegend, position: 'bottom' },
          title: { display: this.showTitle, text: this.portfolio.portfolioName, font: { size: 20 } },
          tooltip: { enabled: true, },
          annotation: {}
        }
      }
    }
    
    this.portfolio.sortTickersByMarketValue();

    if (this.portfolio.netValue == 0) {
      this.doughnutChartData.labels?.push('No Tickers');
      this.doughnutChartData.datasets[0].data.push(1);
      this.doughnutChartData.datasets[0].backgroundColor = this.getRandomColor();
    } else {
      this.portfolio.tickers.forEach((ticker: Ticker) => {
        this.doughnutChartData.labels?.push(ticker.ticker);
        this.doughnutChartData.datasets[0].data.push(ticker.marketValue / this.portfolio.netValue * 100);
        const color = this.getRandomColor();
        this.backgroundColors.push(color);
        this.tickerColor.push(new TickerColor(ticker.ticker, color, ticker.marketValue, ticker.marketValue / this.portfolio.netValue));
      });
    }
    this.donutColors.next(this.tickerColor);
  }

  getRandomColor() {
    const minBrightness = 20; // Minimum brightness value (0-255) for the generated color
    const maxBrightness = 255; // Maximum brightness value (0-255) for the generated color

    let color;
    do {
      color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    } while (!isColorValid(color));

    return color;

    function isColorValid(color: string) {
      // Remove the '#' symbol and convert the color to RGB format
      const rgbColor = color.slice(1).match(/.{2}/g)?.map(hex => parseInt(hex, 16));

      if (rgbColor) {
        // Check the brightness value of the color
        const brightness = (rgbColor[0] * 299 + rgbColor[1] * 587 + rgbColor[2] * 114) / 1000;
        return brightness >= minBrightness && brightness <= maxBrightness;
      }

      return false;
    }
  }


}
