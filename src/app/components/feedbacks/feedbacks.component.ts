import { Component, OnInit } from '@angular/core';
import { FeedbacksService } from '../../services/feedbacks.service';
import { feedbackModel } from '../../models/feedback';


@Component({
  selector: 'app-feedbacks',
  templateUrl: './feedbacks.component.html',
  styleUrls: ['./feedbacks.component.css']
})
export class FeedbacksComponent implements OnInit {

  public feedback: feedbackModel[];

  
  public constructor(private feedbackservice: FeedbacksService){}


      ngOnInit() {
        this.feedbackservice.getallfeedbacks().subscribe((feedback) => {
            this.feedback = feedback;
        
            });
    }

}
