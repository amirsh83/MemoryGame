import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ImagesModel } from '../models/images';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImagesService {

  public constructor(private httpClient: HttpClient) { }

  public getAllImages(): Observable<ImagesModel[]> {
      return this.httpClient.get<ImagesModel[]>("http://localhost:61217/api/images");
  }


 
  
}