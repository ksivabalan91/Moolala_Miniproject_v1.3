import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServiceWorkerModule } from '@angular/service-worker';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';

import { AppComponent } from './app.component';
import { LotComponent } from './components/investment/lot.component';
import { PortfolioComponent } from './components/investment/portfolio.component';
import { TickerComponent } from './components/investment/ticker.component';
import { PortfolioListComponent } from './components/investment/portfolio-list.component';

import { SpaceDelimiterPipe } from './space-delimiter.pipe';
import { SpaceDelimiterRoundPipe } from './space-delimiter-round.pipe';

import { FirebaseauthService } from './services/firebaseauth.service';
import { HomeComponent } from './components/landing/home.component';
import { LoginComponent } from './components/landing/login.component';
import { NewuserformComponent } from './components/landing/newuserform.component';
import { environment } from 'src/environments/environment.prod';
import { ApiService } from './services/api.service';
import { PortfolioRepoService } from './services/portfolio-repo.service';
import { ProfileComponent } from './components/landing/profile.component';
import { NgChartsModule } from 'ng2-charts';
import { DoughnutChartComponent } from './components/charts/doughnut-chart.component';
import { LineChartComponent } from './components/charts/line-chart.component';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';
import ErrorComponent from './components/error.component';
import DcaComponent from './components/playground/dca.component';
import { PlaygroundService } from './services/playground.service';
import { DcaLineChartComponent } from './components/charts/dca-line-chart.component';
import { FireComponent } from './components/playground/fire.component';
import { TradingviewWidgetModule } from 'angular-tradingview-widget';
import { TradingviewWidgetComponent } from './components/charts/tradingview-widget.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UnderConstructionComponent } from './components/under-construction.component';
import { FeedbackComponent } from './components/landing/feedback.component';
import { NewsComponent } from './components/investment/news.component';



@NgModule({
  declarations: [
    AppComponent,
    LotComponent,
    TickerComponent,
    PortfolioComponent,
    PortfolioListComponent,
    SpaceDelimiterPipe,
    SpaceDelimiterRoundPipe,
    HomeComponent,
    LoginComponent,
    NewuserformComponent,
    ProfileComponent,
    DoughnutChartComponent,
    LineChartComponent,
    ErrorComponent,
    DcaComponent,
    DcaLineChartComponent,
    FireComponent,
    TradingviewWidgetComponent,
    DashboardComponent,
    UnderConstructionComponent,
    FeedbackComponent,
    NewsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgChartsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    FontAwesomeModule,
    LottieModule.forRoot({ player: () => player }),
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    TradingviewWidgetModule
  ],
  providers: [FirebaseauthService, ApiService, PortfolioRepoService, PlaygroundService],
  bootstrap: [AppComponent]
})
export class AppModule { }
