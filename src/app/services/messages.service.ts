import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageModel } from '../models/message';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  constructor(private httpClient: HttpClient) { }

  public addUMessage(messagemodel: MessageModel): Observable<MessageModel> {
      return this.httpClient.post<MessageModel>("http://localhost:61217/api/contact",messagemodel);
  }




}
