import { Component} from '@angular/core';
import { MessagesService } from '../../services/messages.service';
import { MessageModel } from '../../models/message';


@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent {

  public  message: MessageModel = new MessageModel();


  public constructor(private messageservice: MessagesService){}

  public addMessage(): void {         
    this.messageservice.addUMessage(this.message).subscribe(
        m => {
            alert("Message sent");
            
        }
      )
  }

}
