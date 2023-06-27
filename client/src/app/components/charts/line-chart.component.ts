import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { PortfolioRepoService } from 'src/app/services/portfolio-repo.service';
import { LineChart } from './Models/line-chart.model';
import { BaseChartDirective } from 'ng2-charts';
import { default as Annotation } from 'chartjs-plugin-annotation';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent implements OnInit, OnChanges {

  @ViewChild(BaseChartDirective, { static: true }) chart!: BaseChartDirective;

  userUID!: string;
  data!: LineChart[];
  lineChartType: ChartType = 'line';
  lineChartData!: ChartConfiguration['data']
  lineChartOptions!: ChartConfiguration['options']

  @Input()
  portfolioName: string = 'NAV';

  constructor(private portRepoSvc: PortfolioRepoService, private authSvc: FirebaseauthService, private router: Router) {
    Chart.register(Annotation);
  }

  async ngOnChanges() {
    const name = this.portfolioName
    this.data = await this.portRepoSvc.getChartData(name)
    this.updateChart();
  }

  async ngOnInit() {
    const name = this.portfolioName
    //! Get current user
    const user = await this.authSvc.getCurrentUser()
    if (user == null)
      this.router.navigate(['/']);
    else
      this.userUID = user?.uid
    await this.portRepoSvc.getAllChartData(this.userUID);
    this.data = await this.portRepoSvc.getChartData(name)
    this.updateChart();
    this.setDateRange(0);

  };

  setDateRange(range: number) {
    const currentDate = new Date();
    let filteredData: LineChart[] = [];
    let labelOptions: any;
    switch (range) {
      case 100: {
        filteredData = this.data
        filteredData = this.removeZeroData(filteredData);
        labelOptions = filteredData.map((x) => {
          const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: '2-digit' };
          return x.date.toLocaleDateString('en-US', options);
        })
        break;
      }
      case 1: {
        // Filter data for 1 month range
        const oneMonthAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
        filteredData = this.removeZeroData(this.data.filter((x) => x.date >= oneMonthAgo && x.date <= currentDate));
        labelOptions = filteredData.map((x) => {
          const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: '2-digit' };
          return x.date.toLocaleDateString('en-US', options);
        })
        break;
      }
      case 3: {
        // Filter data for 3 months range
        const threeMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, currentDate.getDate());
        filteredData = this.removeZeroData(this.data.filter((x) => x.date >= threeMonthsAgo && x.date <= currentDate));
        labelOptions = filteredData.map((x) => {
          const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: '2-digit' };
          return x.date.toLocaleDateString('en-US', options);
        })
        break;
      }
      case 6: {
        // Filter data for 6 months range
        const sixMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, currentDate.getDate());
        filteredData = this.removeZeroData(this.data.filter((x) => x.date >= sixMonthsAgo && x.date <= currentDate));
        labelOptions = filteredData.map((x) => {
          const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: '2-digit' };
          return x.date.toLocaleDateString('en-US', options);
        })
        break;
      }
      case 12: {
        // Filter data for 12 months range
        const twelveMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 12, currentDate.getDate());
        filteredData = this.removeZeroData(this.data.filter((x) => x.date >= twelveMonthsAgo && x.date <= currentDate));
        labelOptions = filteredData.map((x) => {
          const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: '2-digit' };
          return x.date.toLocaleDateString('en-US', options);
        })
        break;
      }
      default: {
        // Filter data for year-to-date range        
        const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
        filteredData = this.removeZeroData(this.data.filter((x) => x.date >= startOfYear && x.date <= currentDate));
        labelOptions = filteredData.map((x) => {
          const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: '2-digit' };
          return x.date.toLocaleDateString('en-US', options);
        })
      }
    }

    this.lineChartData = {
      datasets: [
        {
          data: filteredData.map((x) => x.cost),
          label: 'Amount Invested',
          backgroundColor: 'rgba(194, 245, 247, 0.4)', // Transparent cyan color
          borderColor: '#06B6D4',
          pointBackgroundColor: 'rgba(194, 245, 247, 0.4)', // Transparent cyan color
          pointBorderColor: '#06B6D4',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#06B6D4',
          pointRadius: 0,
          fill: 'origin',
        },
        {
          data: filteredData.map((x) => x.netValue),
          label: 'Net Asset Value',
          backgroundColor: 'rgba(233, 216, 253, 0.4)', // Transparent purple color
          borderColor: '#7B41B5',
          pointBackgroundColor: 'rgba(233, 216, 253, 0.4)', // Transparent purple color
          pointBorderColor: '#7B41B5',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#7B41B5',
          pointRadius: 0,
          fill: 'origin',
        }
      ],
      labels: labelOptions
    };

    this.chart.update();
  }

  updateChart() {
    this.removeZeroData(this.data);
    this.lineChartData = {
      datasets: [
        {
          data: this.data.map((x) => x.cost),
          label: 'Amount Invested',
          backgroundColor: 'rgba(194, 245, 247, 0.4)', // Transparent cyan color
          borderColor: '#06B6D4',
          pointBackgroundColor: 'rgba(194, 245, 247, 0.4)', // Transparent cyan color
          pointBorderColor: '#06B6D4',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#06B6D4',
          pointRadius: 0,
          fill: 'origin',
        },
        {
          data: this.data.map((x) => x.netValue),
          label: 'Net Asset Value',
          backgroundColor: 'rgba(233, 216, 253, 0.4)', // Transparent purple color
          borderColor: '#7B41B5',
          pointBackgroundColor: 'rgba(233, 216, 253, 0.4)', // Transparent purple color
          pointBorderColor: '#7B41B5',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#7B41B5',
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
      maintainAspectRatio: true,
      elements: {
        line: { tension: 0 }
      },
      scales: {
        x: {
          grid: { color: 'rgb(50, 50, 50)', lineWidth: 0.05 },
          ticks: {
            maxTicksLimit: 15,
            color: 'rgb(123, 65, 181)'
          }
        },
        y: {
          position: 'left',
          grid: { color: 'rgb(50, 50, 50)', lineWidth: 0.05 },
          ticks: {
            maxTicksLimit: 10,
            color: 'rgb(123, 65, 181)'
          },
          max: Math.floor(Math.max(this.data[this.data.length - 1].cost * 1.1, this.data[this.data.length - 1].netValue * 1.1)),
        }
      },
      plugins: {
        title: { display: true, text: this.portfolioName, color: 'Purple' },
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
              borderColor: '#7B41B5', // Customize the color of the line
              borderWidth: 2, // Customize the width of the line
              label: {
                display: true,
                content: 'Net asset value: $ ' + Math.floor(this.data[this.data.length - 1].netValue).toLocaleString(),
                color: '#7B41B5',
                position: 'start',
                xAdjust: 0,
                yAdjust: -10,
                backgroundColor: 'rgb(0, 191, 255,0)',
                font: {
                  size: 14,
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
                content: 'Amount invested: $ ' + Math.floor(this.data[this.data.length - 1].cost).toLocaleString(),
                color: 'rgb(0, 191, 255)',
                position: 'center',
                xAdjust: 0,
                yAdjust: -10,
                backgroundColor: 'rgb(0, 191, 255,0)',
                font: {
                  size: 14,
                }
              }
            }
          ]
        }
      }
    }
    this.chart.update();
  }

  removeZeroData(data: any[]) {
    console.log('removing zeros')
    const index = this.findFirstNonZeroIndex(data);
    console.log('non zero index at', index)
    if (index > 0) {
      console.log('splicing data')
      return data.splice(0, index);
    }
    return data;
  }
  findFirstNonZeroIndex(data: any[]) {
    console.log('finding first non zero index')
    for (let i = 0; i < data.length; i++) {
      if (data[i].cost > 0) {
        return i;
      }
    }
    return -1;
  }
};
