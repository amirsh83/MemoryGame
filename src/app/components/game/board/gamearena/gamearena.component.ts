import { Component, OnInit } from '@angular/core';
import {GameresultsService} from '../../../../services/gameresults.service';
import {GameResultsModel} from '../../../../models/gameresults'
import {ImagesService} from '../../../../services/images.service';
import {ImagesModel} from '../../../../models/images'


@Component({
  selector: 'app-gamearena',
  templateUrl: './gamearena.component.html',
  styleUrls: ['./gamearena.component.css']
})
export class GamearenaComponent implements OnInit {

        public stepsTaken: number;
        public images: ImagesModel[];

        constructor(private imageService: ImagesService, private gameresultservice: GameresultsService) { }
    
        ngOnInit() {
            const observable = this.imageService.getAllImages();
            observable.subscribe(images => {
                this.images = images.concat(images);
                this.images = images;
            });
           this.stepsTaken = 0;
            this.game();
          
        
    
        }
                
              // start a new game
                public game(): void {
                    let firstCard;
                    let secondCard;
                    let cardFliped = false;
                    const cards = Array.from(document.querySelectorAll('.memory-card'));
                    let firstCardName: string
                    let secondCardName: string;
                    this.flip(firstCard, secondCard, cardFliped, cards,
                    firstCardName, secondCardName);
                       
                }
    
                  // flip a card logic
                public flip(firstCard, secondCard, cardFliped: boolean, cards,
                    firstCardName: string, secondCardName: string): void {
          
                        cards.forEach(card => card.addEventListener('click', function() {
                        if (this === firstCard) {}
                        else {
                        card.classList.add('flip');
                       
                     
                        if (!cardFliped) {
                          //first card
                            cardFliped = true;
                            firstCard = this;
                            firstCardName = this.getAttribute('name');
                            secondCardName = undefined;
                        }
                        else {
                          // second card
                            secondCard = this;
                            secondCardName = this.getAttribute('name');
                        }
                     
                        if (firstCardName === secondCardName) {
                        // cards match
                        firstCard.removeEventListener('click', function() {});
                        secondCard.removeEventListener('click', function() {});
                        setTimeout(() => {
                            secondCard.classList.add('hidden');
                            firstCard.classList.add('hidden');
                            cardFliped = false;
                            [firstCard, secondCard] = [null, null];
                            }, 1500);
                     
                        }
                        else if (secondCardName !== undefined) {
                             // not a match
                            setTimeout(() => {
                            secondCard.classList.remove('flip');
                            firstCard.classList.remove('flip');
                            cardFliped = false;
                            [firstCard, secondCard] = [null, null];
                            }, 1500);
                        }
                      }   
                  })); 
                } 
           

              

        
               
              
            }