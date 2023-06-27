import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faSeedling, faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { AnimationOptions } from 'ngx-lottie';
import { PlaygroundService } from 'src/app/services/playground.service';
import { DCA } from './Models/dca.model';
import { Chart, ChartConfiguration } from 'chart.js';
import { LineChart } from '../charts/Models/line-chart.model';
import { default as Annotation } from 'chartjs-plugin-annotation';
import { PortfolioRepoService } from 'src/app/services/portfolio-repo.service';

@Component({
  selector: 'app-dca',
  templateUrl: './dca.component.html',
  styleUrls: ['./dca.component.scss']
})

export default class DcaComponent implements OnInit {

  faSeedling = faSeedling;
  faCircleQuestion = faCircleQuestion;
  lottieOptions!: AnimationOptions;

  showform = true;
  switch: string = 'animation'

  form!: FormGroup;

  data!: LineChart[];
  lineChartData!: ChartConfiguration['data']
  lineChartOptions!: ChartConfiguration['options']

  annualizedReturn!: number;
  totalChange!: number;
  totalReturn!: number;
  totalCost!: number;
  currentPrice!:number;
  totalShares!: number;
  avgCost!: number;

  constructor(private fb: FormBuilder, private playgroundSvc: PlaygroundService, private portRepoSvc: PortfolioRepoService) {
    Chart.register(Annotation);
  }

  ngOnInit(): void {
    const endDate = new Date();
    const startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate());

    this.form = this.fb.group({
      ticker: this.fb.control('TSLA', [Validators.required, Validators.minLength(1)]),
      startDate: this.fb.control(startDate.toLocaleDateString('en-CA'), [Validators.required]),
      endDate: this.fb.control(endDate.toLocaleDateString('en-CA'), [Validators.required]),
      investInterval: this.fb.control(30, [Validators.required]),
      investAmount: this.fb.control(500, [Validators.required]),
      initialAmount: this.fb.control(0),
    })
    this.setLottiePath();
  }

  setLottiePath(): void {
    let path: string;
    let loop: boolean = true;
    switch (this.switch) {
      case 'error':
        path = '/assets/animations/85978-error-dialog.json';
        loop = false;
        break;
      case 'loading':
        path = '/assets/animations/orangechart.json';
        break;
      default:
        // Set a default path if none of the cases match
        path = '/assets/animations/DCAHome.json';
        break;
    }
    this.lottieOptions = {
      path: path,
      loop: loop,
      autoplay: true,
    };
  }

  async submit(lineChart:HTMLElement) {
    this.switch = 'loading';
    this.setLottiePath();
    const dca = new DCA(this.form.value.ticker, new Date(this.form.value.startDate), new Date(this.form.value.endDate), this.form.value.investInterval, this.form.value.investAmount, this.form.value.initialAmount);
    this.data = await this.playgroundSvc.getDCAChart(dca)
    this.currentPrice = await this.portRepoSvc.getCurrentPriceForOne(this.form.value.ticker);
    
    

    if (this.data.length == 0) {
      this.switch = 'error';
      this.setLottiePath();
      return;
    }

    const netValue = this.data[this.data.length - 1].netValue;
    const years = (this.data[this.data.length - 1].date.getTime() - this.data[0].date.getTime()) / (1000 * 3600 * 24 * 365);

    this.totalCost = this.data[this.data.length - 1].cost;
    this.totalReturn = netValue - this.totalCost;
    this.totalChange = (netValue - this.totalCost) / this.totalCost;
    this.annualizedReturn = Math.pow((netValue / this.totalCost), (1 / years)) - 1;
    this.totalShares = netValue/this.currentPrice;
    this.avgCost = this.totalCost/this.totalShares;

    this.lineChartData = {
      datasets: [
        {
          data: this.data.map((x) => x.netValue),
          label: 'Net Asset Value',
          backgroundColor: 'rgba(242, 153, 74, 0.4)', // Transparent orange color
          borderColor: 'rgba(242, 153, 74)',
          pointBackgroundColor: 'rgba(242, 153, 74)',
          pointBorderColor: 'rgba(242, 153, 74)',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#7B41B5',
          pointRadius: 0,
          fill: 'origin',
        },
        {
          data: this.data.map((x) => x.cost),
          label: 'Amount Invested',
          backgroundColor: 'rgba(194, 245, 247, 0.4)', // Transparent cyan color
          borderColor: '#06B6D4',
          pointBackgroundColor: 'rgba(194, 245, 247)',
          pointBorderColor: '#06B6D4',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#06B6D4',
          pointRadius: 0,
          fill: 'origin',
        }
      ],
      labels: this.data.map((x) => {
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: '2-digit' };
        return x.date.toLocaleDateString('en-US', options);
      }
      )
    };

    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      elements: {
        line: { tension: 0 }
      },
      scales: {
        x: {
          grid: { color: 'rgb(50, 50, 50, 0)' },
          ticks: {
            maxTicksLimit: 10,
            color: 'rgb(245, 101, 0)'
          }
        },
        y: {
          position: 'left',
          grid: { color: 'rgb(50, 50, 50, 0)', },
          ticks: {
            maxTicksLimit: 10,
            color: 'rgb(245, 101, 0)'
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          mode: 'index', // Display tooltips for all intersecting elements at the same index
          intersect: false // Show the tooltip for the closest element in the x-direction

        },
        annotation: {
          annotations: [
            {
              type: 'line',
              scaleID: 'y',
              value: this.data[this.data.length - 1].netValue, // Y-axis value where the line should be placed
              borderColor: 'rgba(242, 153, 74)', // Customize the color of the line
              borderWidth: 2, // Customize the width of the line
              label: {
                display: true,
                content: 'Net asset value: $ ' + this.data[this.data.length - 1].netValue.toLocaleString(),
                color: 'white',
                position: 'start',
                backgroundColor: 'rgba(242, 153, 74)',
                font: {
                  size: 12,
                }
              }
            },
            {
              type: 'line',
              scaleID: 'y',
              value: this.data[this.data.length - 1].cost, // Y-axis value where the line should be placed
              borderColor: 'rgb(0, 191, 255)', // Customize the color of the line
              borderWidth: 2, // Customize the width of the line
              label: {
                display: true,
                content: 'Amount invested: $ ' + this.data[this.data.length - 1].cost.toLocaleString(),
                color: 'white',
                position: 'center',
                backgroundColor: 'rgb(0, 191, 255)',
                font: {
                  size: 12,
                }
              }
            }
          ]
        }
      }
    }
    lineChart.scrollIntoView({behavior:'smooth'})
    this.switch = 'chartGenerated';
  };

}