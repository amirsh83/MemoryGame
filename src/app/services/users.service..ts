import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { Observable, BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private httpClient: HttpClient) { }

    public addUser(userModel: User): Observable<User> {
        return this.httpClient.post<User>("http://localhost:61217/api/users",userModel);
    }

    public isvaliduser(username: string, password: string): Observable<boolean> {
      return this.httpClient.get<boolean>(`http://localhost:61217/api/login/${username}/${password}`);
    }

    public uid(username: string): Observable<string> {
      return this.httpClient.get<string>(`http://localhost:61217/api/uid/${username}`);
    }

    public userInfo$ = new BehaviorSubject(null);



}



