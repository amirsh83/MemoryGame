import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GameResultsModel } from '../models/gameresults';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameresultsService {

 public constructor(private httpClient: HttpClient) { }

  public getallresults(): Observable<GameResultsModel[]> {
      return this.httpClient.get<GameResultsModel[]>("http://localhost:61217/api/results");
  }


  public addGameResulr(gameresults: GameResultsModel): Observable<GameResultsModel> {
    return this.httpClient.post<GameResultsModel>("http://localhost:61217/api/results",gameresults);
}
  
}