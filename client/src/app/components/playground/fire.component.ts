import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faFireFlameCurved, faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { Chart, ChartConfiguration } from 'chart.js';
import { default as Annotation } from 'chartjs-plugin-annotation';
import { AnimationOptions } from 'ngx-lottie';
import { FireChart } from '../charts/Models/fire-chart.model';

@Component({
  selector: 'app-fire',
  templateUrl: './fire.component.html',
  styleUrls: ['./fire.component.scss']
})
export class FireComponent implements OnInit {

  faFireFlameCurved = faFireFlameCurved;
  faCircleQuestion = faCircleQuestion;
  lottieOptions!: AnimationOptions;
  showform = true;
  switch: string = 'animation'

  data: FireChart[] = [];
  lineChartData!: ChartConfiguration['data']
  lineChartOptions!: ChartConfiguration['options']
  animationDuration: number = 1000;
  counter: number = 0;

  form!: FormGroup;
  fireAge: number = 0;
  yearsToFire: number = 0;

  constructor(private fb: FormBuilder) {
    Chart.register(Annotation);
  }

  ngOnInit() {
    this.form = this.fb.group({
      currentAge: this.fb.control(25, [Validators.required]),
      retirementAge: this.fb.control(40, [Validators.required]),
      endAge: this.fb.control(65, [Validators.required]),

      annualIncome: this.fb.control(60000, [Validators.required]),
      annualSpending: this.fb.control(30000, [Validators.required]),
      retirementAnnualSpending: this.fb.control(30000, [Validators.required]),
      incomeGrowthRate: this.fb.control(2, [Validators.required]),

      cashValue: this.fb.control(0, [Validators.required]),
      cashAllocation: this.fb.control(0, [Validators.required]),
      cashReturn: this.fb.control(0.05, [Validators.required]),

      stockValue: this.fb.control(100000, [Validators.required]),
      stockAllocation: this.fb.control(100, [Validators.required]),
      stockReturn: this.fb.control(8, [Validators.required]),

      otherAssetValue: this.fb.control(0, [Validators.required]),
      otherAssetAllocation: this.fb.control(0, [Validators.required]),
      otherAssetReturn: this.fb.control(0, [Validators.required]),

      inflationRate: this.fb.control(3, [Validators.required]),
      safeWithdrawalRate: this.fb.control(4, [Validators.required]),
    })
    this.setLottiePath();
    this.form.valueChanges.subscribe(() => {
      if (this.counter != 0) {
        this.animationDuration = 0;
      }
      this.counter++;
      this.submit();
    });
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
        path = '/assets/animations/8517-charts.json';
        loop = true;
        break;
    }
    this.lottieOptions = {
      path: path,
      loop: loop,
      autoplay: true,
    };
  }

  submit() {
    this.generateChartData();
    if (this.data.length == 0) {
      this.switch = 'error';
      this.setLottiePath();
      return;
    }

    this.lineChartData = {
      datasets: [
        {
          xAxisID: 'x',
          yAxisID: 'y',
          data: this.data.map((x) => x.fireNumber),
          label: 'Fire Number',
          backgroundColor: 'rgba(194, 245, 247, 0)', // Transparent cyan color
          borderColor: '#06B6D4',
          borderWidth: 1,
          pointBackgroundColor: 'rgba(194, 245, 247)',
          pointBorderColor: '#06B6D4',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#06B6D4',
          pointRadius: 0,
          fill: 'origin',
        },
        {
          xAxisID: 'x',
          yAxisID: 'y',
          data: this.data.map((x) => x.netWorth),
          label: 'Net Worth',
          backgroundColor: 'rgba(233, 216, 253, 0.4)', // Transparent purple color
          borderColor: '#7B41B5',
          pointBackgroundColor: 'rgba(233, 216, 253, 0.4)',
          pointBorderColor: '#7B41B5',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#7B41B5',
          pointRadius: 1,
          fill: 'origin',
        },
        {
          xAxisID: 'x',
          yAxisID: 'y',
          data: [{ x: this.form.value.retirementAge, y: Math.min(0, this.data[this.data.length - 1].netWorth) }, { x: this.form.value.retirementAge, y: Math.max(this.data[this.data.length - 1].netWorth, this.data[0].fireNumber + 100000) }],
          label: 'Retired:' + this.form.value.retirementAge,
          backgroundColor: 'red',
          borderColor: 'red',
          borderWidth: 1,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: 'origin',
        }
      ],
      labels: this.data.map((x) => x.age
      )
    };
    console.log('animation duration: ' + this.animationDuration)
    this.lineChartOptions = {
      animation: {
        duration: this.animationDuration,
      },
      responsive: true,
      maintainAspectRatio: false,
      borderColor: 'rgb(245, 101, 0)',
      elements: {
        line: { tension: 0.5 }
      },
      scales: {
        x: {
          border: {
            color: 'rgb(245, 101, 0)',
            width: 0,
          },
          position: 'bottom',
          grid: {
            color: 'rgb(50, 50, 50, 0.05)',
            lineWidth: 1,
            display: true
          },
          ticks: {
            color: '#7B41B5'
          },
        },
        y: {
          border: {
            color: 'rgb(245, 101, 0)',
            width: 0,
          },
          position: 'left',
          grid: { color: 'rgb(50, 50, 50, 0.05)', },
          ticks: {
            maxTicksLimit: 10,
            color: '#7B41B5'
          },
          max: Math.round(Math.max(this.data[this.data.length - 1].netWorth, this.data[0].fireNumber + 100000)),
          min: Math.round(Math.min(0, this.data[this.data.length - 1].netWorth))
        }
      },
      plugins: {
        legend: { display: true },
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
              value: this.data[0].fireNumber, // Y-axis value where the line should be placed
              borderColor: 'rgba(242, 153, 74)', // Customize the color of the line
              borderWidth: 0, // Customize the width of the line
              label: {
                display: true,
                content: 'Fire Number: $ ' + this.data[0].fireNumber.toLocaleString(),
                color: '#06B6D4',
                backgroundColor: 'rgba(194, 245, 247, 0)',
                position: 'end',
                xAdjust: 0,
                yAdjust: -10,
                font: {
                  size: 12,
                }
              }
            },
          ]
        }
      }
    }
    this.switch = 'chartGenerated';
  };

  generateChartData() {
    this.fireAge = 0;
    this.data = [];

    let currentAge = this.form.value.currentAge;
    const retirementAge = this.form.value.retirementAge;
    const endAge = this.form.value.endAge;
    const ageDiff = endAge - currentAge;

    const annualIncome = this.form.value.annualIncome;
    const annualSpending = this.form.value.annualSpending;
    const retirementAnnualSpending = this.form.value.retirementAnnualSpending;

    let cashValue = this.form.value.cashValue;
    const cashAllocation = this.form.value.cashAllocation / 100;
    const cashReturn = this.form.value.cashReturn / 100;

    let stockValue = this.form.value.stockValue;
    const stockAllocation = this.form.value.stockAllocation / 100;
    const stockReturn = this.form.value.stockReturn / 100;

    let otherAssetValue = this.form.value.otherAssetValue;
    const otherAssetAllocation = this.form.value.otherAssetAllocation / 100;
    const otherAssetReturn = this.form.value.otherAssetReturn / 100;

    const incomeGrowthRate = this.form.value.incomeGrowthRate / 100;
    const inflationRate = this.form.value.inflationRate / 100;
    const safeWithdrawalRate = this.form.value.safeWithdrawalRate / 100;

    const fireNumber = retirementAnnualSpending / safeWithdrawalRate;

    let netWorth = cashValue + stockValue + otherAssetValue;

    const year0 = new FireChart(this.form.value.currentAge, 0, 0, 0, netWorth, fireNumber);
    this.data.push(year0);

    let adjustedAnnualIncome = this.form.value.annualIncome;
    let annualSaving = 0;

    for (let i = 1; i < ageDiff + 1; i++) {
      const year = i
      currentAge += 1

      if (currentAge <= retirementAge) {
        //! income after inflation and growth
        adjustedAnnualIncome = annualIncome * Math.pow(1 + incomeGrowthRate - inflationRate, year - 1);
        annualSaving = adjustedAnnualIncome - annualSpending;
      } else {
        adjustedAnnualIncome = 0
        annualSaving = adjustedAnnualIncome - retirementAnnualSpending;
      }

      if (cashValue != 0)
        cashValue = cashValue * (1 - inflationRate + cashReturn) + annualSaving * cashAllocation;
      if (stockValue != 0)
        stockValue = stockValue * (1 - inflationRate + stockReturn) + annualSaving * stockAllocation;
      if (otherAssetValue != 0)
        otherAssetValue = otherAssetValue * (1 - inflationRate + otherAssetReturn) + annualSaving * otherAssetAllocation;

      netWorth = cashValue + stockValue + otherAssetValue;

      const fireChartPoint = new FireChart(currentAge, year, adjustedAnnualIncome, annualSaving, netWorth, fireNumber);
      this.data.push(fireChartPoint);
    }

    // find the year when networth is greater than fireNumber
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].netWorth > this.data[i].fireNumber) {
        this.fireAge = this.data[i].age;
        this.yearsToFire = this.fireAge - this.data[0].age;
        break;
      }
    }
  }
}