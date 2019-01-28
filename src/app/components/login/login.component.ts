import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { UsersService } from '../../services/users.service.';
import {Router} from '@angular/router';
import {LoginService} from '../../services/login.service';
import {MenuComponent} from '../menu/menu.component'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit  {


  public  user: User = new User();
  public  menu: MenuComponent = new MenuComponent(this.loginservice);
  public isvalid: boolean;
  public uid: string;

  public constructor(private userservice: UsersService, private router: Router, private loginservice: LoginService){}


public ngOnInit(): void{
  this.user.username = "";
  this.user.password = "";

    localStorage.setItem('loggedin', 'false');
this.isloggedin();
}

private isloggedin(): void {
  if ((this.loginservice.isLoggedIn() == true)){
    this.router.navigate(['/authhome']);
  }
}


  public login(): void { 
  let observable = this.userservice.isvaliduser(this.user.username, this.user.password);
  let uidd: number;
 
  observable.subscribe(isvalid => {
      this.isvalid = isvalid;
      if(this.isvalid){
     
        // let uidd = this.userservice.uid(this.user.username);
        // let uid = uidd.toString()
      this.getUseridFromUsername(this.user.username)
      
      localStorage.setItem('loggedin', 'true');
   
   
         console.log(this.uid)
     this.isloggedin();
       alert("you are logged in!")
   this.menu.menuchange();
     //   console.log("uid: " + JSON.stringify(uidd));
      } else {
        localStorage.setItem('loggedin', 'false');
        alert("incorrect user name or password");
      }   
    }
    
    )

    
  }




  public getUseridFromUsername(userName: string): void{
    let observable = this.userservice.uid(userName);
            observable.subscribe(userID=>{
                this.uid = userID;
                localStorage.setItem('uid',  this.uid);
                //this.enterSession();
            });


}

}