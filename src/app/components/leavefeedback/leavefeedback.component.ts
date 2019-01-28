import { Component} from '@angular/core';
import { FeedbacksService } from '../../services/feedbacks.service';
import { feedbackModel } from '../../models/feedback';
import { User } from '../../models/user';
import {Router} from '@angular/router';
import {LoginService} from '../../services/login.service';


@Component({
  selector: 'app-leavefeedback',
  templateUrl: './leavefeedback.component.html',
  styleUrls: ['./leavefeedback.component.css']
})
export class LeavefeedbackComponent  {


private user: User = new User();

  public  feedback: feedbackModel = new feedbackModel();

  
  public constructor(private feedbacksservice: FeedbacksService, private router: Router, private loginservice: LoginService){}

  public ngOnInit(): void{
  this.isloggedin();
  }
  

  private isloggedin(): void {
    if ((this.loginservice.isLoggedIn() != true)){
      this.router.navigate(['/login']);
    }
  }

  public addfeedback(): void {     
    let uid =   localStorage.getItem('uid');  
    this.feedback.userid = parseInt(uid);
    this.feedbacksservice.addFeedback(this.feedback).subscribe(
        m => {
            alert("Feedack sent.");
        }
      )

      
  }

}
