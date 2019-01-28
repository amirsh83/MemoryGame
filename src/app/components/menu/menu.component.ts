import { Component, OnInit } from '@angular/core';
import {LoginService} from '../../services/login.service';
import { BrowserModule } from '@angular/platform-browser';
import { template } from '@angular/core/src/render3';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html', 
  styleUrls: ['./menu.component.css']
 

})
export class MenuComponent implements OnInit {

  show: boolean;


  constructor(private loginservice: LoginService) { }

  ngOnInit() {
  this.show = this.loginservice.isLoggedIn();
  
  }
  
  public logout(): void { 
  
    localStorage.removeItem('loggedin');
    localStorage.removeItem('uid');
    window.location.reload();

 
  }


// making menu dynamic - user logged / logged out
  public menuchange(): void{
    if(this.loginservice.isLoggedIn() == true){
      window.location.reload();
    } else
      window.location.reload();
    
  }



}

