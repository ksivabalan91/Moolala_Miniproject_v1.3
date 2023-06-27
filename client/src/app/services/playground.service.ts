import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DCA } from '../components/playground/Models/dca.model';
import { lastValueFrom } from 'rxjs';
import { LineChart } from '../components/charts/Models/line-chart.model';

@Injectable({
  providedIn: 'root'
})

export class PlaygroundService {

  // serverUrl = 'http://localhost:8080/api/';
  serverUrl = 'https://moola-la-production.up.railway.app/api/';
  constructor(private http: HttpClient) {}

  getDCAChart(dca: DCA){
    console.log('get DCA line chart');
    const headers = new HttpHeaders().set('Accept', 'application/json');
    return lastValueFrom(this.http.post(this.serverUrl + 'getDcaChart', dca, { headers })).then((data: any) => {
      return data.map((lineChartData:any) => new LineChart(lineChartData.date, lineChartData.netValue, lineChartData.cost));
    }).catch((err) => {
      console.log(err);
      return [];
    });
  }

}
