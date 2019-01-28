import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class LoginService {

public isLoggedIn(): boolean{
  if(localStorage.getItem("loggedin")== "true"){
    return true
  } else{
    return false
  }
}


}