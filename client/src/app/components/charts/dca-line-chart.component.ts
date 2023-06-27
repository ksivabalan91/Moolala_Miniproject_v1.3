import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { PortfolioRepoService } from 'src/app/services/portfolio-repo.service';
import { LineChart } from './Models/line-chart.model';
import { BaseChartDirective } from 'ng2-charts';
import { default as Annotation } from 'chartjs-plugin-annotation';

@Component({
  selector: 'app-dca-line-chart',
  templateUrl: './dca-line-chart.component.html',
  styleUrls: ['./dca-line-chart.component.scss']
})
export class DcaLineChartComponent implements OnInit {

  @ViewChild(BaseChartDirective, { static: true }) chart!: BaseChartDirective;

  @Input()
  data!: any[];
  @Input()
  lineChartData!: ChartConfiguration['data']
  @Input()
  lineChartOptions!: ChartConfiguration['options']
  lineChartType: ChartType = 'line';

  ngOnInit() {
  }

}
