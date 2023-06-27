import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PortfolioListComponent } from './components/investment/portfolio-list.component';
import { PortfolioComponent } from './components/investment/portfolio.component';
import { HomeComponent } from './components/landing/home.component';
import DcaComponent from './components/playground/dca.component';
import ErrorComponent from './components/error.component';
import { FireComponent } from './components/playground/fire.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UnderConstructionComponent } from './components/under-construction.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'dca', component: DcaComponent },
  { path: 'fire', component: FireComponent },
  { path: 'error', component: ErrorComponent },
  { path: 'construction', component: UnderConstructionComponent },
  { path: 'portfolio/:id', component: PortfolioComponent },
  { path: 'portfolios', component: PortfolioListComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
