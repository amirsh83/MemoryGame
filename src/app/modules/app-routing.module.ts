import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from '../components/home/home.component';
import { AuthHomeComponent } from '../components/auth-home/auth-home.component';
import { RegisterComponent } from '../components/register/register.component';
import { LoginComponent } from '../components/login/login.component';
import { FeedbacksComponent } from '../components/feedbacks/feedbacks.component';
import { GameresultsComponent } from '../components/gameresults/gameresults.component';
import { AboutComponent } from '../components/about/about.component';
import { ContactUsComponent} from '../components/contact-us/contact-us.component';
import {LeavefeedbackComponent} from '../components/leavefeedback/leavefeedback.component'
import {GameComponent} from '../components/game/game.component'

const routes: Routes = [
  { path: "home", component: HomeComponent },
  { path: "authhome", component: AuthHomeComponent },
  { path: "register", component: RegisterComponent },
  { path: "login", component: LoginComponent },
  { path: "login/username/password", component: LoginComponent },
  { path: "gameresults", component: GameresultsComponent },
  { path: "feedbacks", component: FeedbacksComponent },
  { path: "feedback", component: LeavefeedbackComponent },
  { path: "contact", component: ContactUsComponent },
  { path: "game", component: GameComponent },
  { path: "about", component: AboutComponent },
  { path: "**", redirectTo: "/home", pathMatch: "full" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
