import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faCircleMinus, faCirclePlus, faFloppyDisk, faUpload } from '@fortawesome/free-solid-svg-icons'
import { Portfolio } from './models/portfolio.model';
import { Ticker } from './models/ticker.model';
import { Lot } from './models/lot.model';
import { PortfolioService } from '../../services/portfolio.service';

@Component({
  selector: 'app-lot',
  templateUrl: './lot.component.html',
  styleUrls: ['./lot.component.scss']
})
export class LotComponent implements OnInit {
  //! Icon import
  faCircleMinus = faCircleMinus
  faCirclePlus = faCirclePlus
  faFloppyDisk = faFloppyDisk
  faUpload = faUpload
  //! forms
  lotForm!: FormGroup;
  lotArray!: FormArray;

  //todo pass in from ticker component
  @Input() lots!: Lot[];
  @Input() currentPrice!: number;
  @Input() tickerIdx!: number;

  //todo to get from API call

  constructor(private fb: FormBuilder, private portSvc: PortfolioService) { }

  ngOnInit() {
    this.lotArray = this.fb.array([]);
    if (this.lots != null) {
      this.populateArray();
    }

    this.lotForm = this.fb.group({
      lots: this.lotArray
    });
  }
  submitLotForm() {
    //! collect data from form and create new Lot[]
    const updatedLots = this.lotForm.value['lots'].map((obj: any) => new Lot(new Date(obj.date), obj.shares, obj.costPerShare, this.currentPrice))
    this.portSvc.updateLots(this.tickerIdx, updatedLots);
  }
  populateArray() {
    const lots = this.lots;
    for (let lot of lots) {
      const purchaseDate = new Date(lot.purchaseDate);
      this.addLot(purchaseDate, lot.shares, lot.costPerShare)
    }
  }
  calculateMarketValue(shares: number) {
    return shares * this.currentPrice;
  }
  calculateTotalGain(shares: number, costPerShare: number) {
    const totalGain = shares * this.currentPrice - costPerShare * shares;

    return totalGain;
  }
  addLot(date: Date = new Date(), shares: number = 0, costPerShare: number = 0) {
    const formattedDate = date.toLocaleDateString('en-CA');
    this.lotArray.push(
      this.fb.group({
        date: this.fb.control(formattedDate, [Validators.required]),
        shares: this.fb.control<number>(shares, [Validators.required]),
        costPerShare: this.fb.control<number>(costPerShare, [Validators.required]),
      })
    )
  }
  deleteLot(i: number) {
    this.lotArray.removeAt(i)
  }

}
