import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PortfolioRepoService } from 'src/app/services/portfolio-repo.service';
import { Portfolio } from './models/portfolio.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faTrash, faPen, faFloppyDisk, faCancel } from '@fortawesome/free-solid-svg-icons'
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { Subscription, lastValueFrom } from 'rxjs';
import { PortfolioService } from 'src/app/services/portfolio.service';

@Component({
  selector: 'app-portfolio-list',
  templateUrl: './portfolio-list.component.html',
  styleUrls: ['./portfolio-list.component.scss'],
  providers: [PortfolioService]
})
export class PortfolioListComponent implements OnInit, OnDestroy {
  faFloppyDisk = faFloppyDisk;
  faCancel = faCancel;
  faTrash = faTrash;
  faPen = faPen;

  portfolioList: Portfolio[] = [];
  netValue!: number;
  totalGain!: number;
  totalGainPercent!: number;

  newPortfolioNames: string[] = [];
  isEdit: boolean[] = [];

  form!: FormGroup;

  userUID!: string;

  constructor(private portfolioRepoSvc: PortfolioRepoService, private router: Router, private fb: FormBuilder, private authSvc: FirebaseauthService) { }
  ngOnDestroy() {
  }

  async ngOnInit() {
    this.form = this.fb.group({
      portName: this.fb.control('', [Validators.required, Validators.minLength(1)])
    })
    //! Get current user
    // const user = await this.authSvc.getCurrentUser()

    // if (user == null)
    //   this.router.navigate(['/']);
    // else
    //   this.userUID = user?.uid;

    this.portfolioList = this.portfolioRepoSvc.portfolios;
    this.netValue = this.portfolioList.reduce((a, b) => a + b.netValue, 0)
    this.totalGain = this.portfolioList.reduce((a, b) => a + b.totalGain, 0)
    this.totalGainPercent = this.totalGain / (this.netValue - this.totalGain)
    for (let portfolio of this.portfolioList) {
      this.isEdit.push(true);
      this.newPortfolioNames.push(portfolio.portfolioName);
    }
  }
  openPortfolio(portfolioId: number) {
    this.router.navigate(['portfolio', portfolioId])
  }
  addPortfolio() {
    this.portfolioRepoSvc.addNewPortfolio(this.form.value.portName);
    this.newPortfolioNames.push(this.form.value.portName);
    this.isEdit.push(true);
    this.form.reset();
  }
  deletePortfolio(portfolioId: number) {
    this.newPortfolioNames.splice(portfolioId, 1);
    this.isEdit.splice(portfolioId, 1);
    this.portfolioRepoSvc.deletePortfolio(portfolioId);
  }
  editPortfolioName(idx: number) {
    this.isEdit[idx] = !this.isEdit[idx];
  }
  savePortfolioName(idx: number) {
    this.portfolioRepoSvc.updatePortfolioName(idx, this.newPortfolioNames[idx]);
    this.isEdit[idx] = !this.isEdit[idx];
  }


}
