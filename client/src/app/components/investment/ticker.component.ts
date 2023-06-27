import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faCirclePlus, faTrash, faCaretRight, faCaretDown, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { Ticker } from './models/ticker.model';
import { PortfolioService } from '../../services/portfolio.service';

@Component({
  selector: 'app-ticker',
  templateUrl: './ticker.component.html',
  styleUrls: ['./ticker.component.scss']
})
export class TickerComponent implements OnInit {

  @Input() isCollapsed: boolean = false;
  @Input() ticker!: Ticker;
  @Input() idx!: number;

  @Output() showTradingViewChart = new EventEmitter();

  faCaret: IconDefinition = faCaretRight;
  faCirclePlus = faCirclePlus;
  faTrash = faTrash;

  color!: string;
  sign!: string;


  constructor(private portSvc: PortfolioService) { }

  ngOnInit() {
    if (this.ticker.totalGain > 0) {
      this.color = 'text-lime-600';
      this.sign = '+'
    } else {
      this.color = "text-rose-600"
      this.sign = ''
    }
  }

  dropdown() {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      this.faCaret = faCaretDown;
    }
    else {
      this.faCaret = faCaretRight;
    }
  }

  calculateTotalGainPercent() {
    return this.ticker.totalGain / (this.ticker.totalShares * this.ticker.averageCostPerShare);
  }

  deleteTicker() {
    this.portSvc.deleteTicker(this.idx);
  }

  showChart() {
    this.showTradingViewChart.emit();
  }

}
