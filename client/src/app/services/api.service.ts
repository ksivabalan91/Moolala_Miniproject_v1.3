import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { User } from '../Shared/Models/User.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  portfolioMap = new Map<number,number>();

  constructor(private http: HttpClient) {     
  }

  // serverUrl = 'http://localhost:8080/api/';
  serverUrl = 'https://moola-la-production.up.railway.app/api/';

  createNewUser(user: User) {
    return lastValueFrom(this.http.post(this.serverUrl + 'createnewuser', user))
  }
  updateUsername(username: string, uid: string) {
    return lastValueFrom(this.http.put(this.serverUrl + 'updateusername', { username: username, id: uid }))
  }

  postFeedback(category: string, comments: string, userId: string) {
    return lastValueFrom(this.http.post(this.serverUrl + 'postfeedback', { category: category, comments: comments, userId: userId }))
  }

  getStockNews(tickers:string, portfolioId: number){
    this.updateOffset(portfolioId);
    const offset = this.portfolioMap.get(portfolioId);
    return this.http.post(this.serverUrl+'stocknews', { tickers: tickers, limit:4, offset:offset })
  }

  updateOffset(portfolioId:number){
    if (this.portfolioMap.has(portfolioId)) {
      // Portfolio ID exists, increment offset by 1
      const currentOffset = this.portfolioMap.get(portfolioId)!;
      this.portfolioMap.set(portfolioId, currentOffset + 1);
    } else {
      // Portfolio ID doesn't exist, add it to the map with offset 0
      this.portfolioMap.set(portfolioId, 0);
    }
  }
  
}
