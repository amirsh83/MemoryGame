import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { feedbackModel } from '../models/feedback';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FeedbacksService {


  public constructor(private httpClient: HttpClient) { }

  public getallfeedbacks(): Observable<feedbackModel[]> {
      return this.httpClient.get<feedbackModel[]>("http://localhost:61217/api/feedbacks");
  }

  public addFeedback(feedbackmodel: feedbackModel): Observable<feedbackModel> {
    return this.httpClient.post<feedbackModel>("http://localhost:61217/api/feedback",feedbackmodel);
}

}