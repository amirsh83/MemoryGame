import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { UsersService } from '../../services/users.service.';
import {Router} from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent  {


   public  user: User = new User();


  public constructor(private userservice: UsersService, private router: Router){}

  public addUser(): void {         
    this.userservice.addUser(this.user).subscribe(
        u => {
            alert("Registration end successfully!");
           
        }
     
      )
      this.router.navigate(['/login']);
  }

}
