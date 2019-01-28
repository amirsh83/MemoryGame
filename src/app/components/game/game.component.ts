import { Component, OnInit } from '@angular/core';
import { BoardComponent } from './board/board.component';
import {Router} from '@angular/router';
import {LoginService} from '../../services/login.service';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  constructor(private router: Router, private loginservice: LoginService) { }

  ngOnInit() {
    this.isloggedin();
  }


  private isloggedin(): void {
    if ((this.loginservice.isLoggedIn() != true)){
      this.router.navigate(['/login']);
    }
  }

}
