import { Component, OnInit, Pipe } from '@angular/core';
import { GameresultsService } from '../../services/gameresults.service';
import { GameResultsModel } from '../../models/gameresults';



@Component({
  selector: 'app-gameresults',
  templateUrl: './gameresults.component.html',
  styleUrls: ['./gameresults.component.css']
})


@Pipe({
  name: 'TimeSpan'
})
export class GameresultsComponent implements OnInit {

  public result: GameResultsModel[];

  
  public constructor(private gameresultservice: GameresultsService){}


      ngOnInit() {
        this.gameresultservice.getallresults().subscribe((result) => {
            this.result = result;
            });
    }

}
