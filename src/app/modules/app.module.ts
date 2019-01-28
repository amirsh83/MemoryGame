import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from '../components/home/home.component';
import { LoginComponent } from '../components/login/login.component';
import { GameresultsComponent } from '../components/gameresults/gameresults.component';
import { FeedbacksComponent } from '../components/feedbacks/feedbacks.component';
import { FormsModule } from '@angular/forms';
import {HttpClientModule} from "@angular/common/http";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { RegisterComponent } from '../components/register/register.component';
import { MatInputModule, MatButtonModule, MatCheckboxModule } from '@angular/material';
import { MenuComponent } from '../components/menu/menu.component';
import { HeaderComponent } from '../components/header/header.component';
import { LayoutComponent } from '../components/layout/layout.component';
import { AboutComponent } from '../components/about/about.component';
import { ContactUsComponent } from '../components/contact-us/contact-us.component';
import { LeavefeedbackComponent } from '../components/leavefeedback/leavefeedback.component';
import { GameComponent } from '../components/game/game.component';
import { LogoutComponent } from '../components/logout/logout.component';
import { TimeSpanPipe } from '../time-span.pipe';
import { AuthHomeComponent } from '../components/auth-home/auth-home.component';
import { BoardComponent } from '../components/game/board/board.component';
import { ImagesComponent } from '../components/images/images.component';
import { GamearenaComponent } from '../components/game/board/gamearena/gamearena.component';








@NgModule({
  declarations: [
  HomeComponent,
  LoginComponent,
  GameresultsComponent,
  FeedbacksComponent,
  RegisterComponent,
  MenuComponent,
  HeaderComponent,
  LayoutComponent,
  AboutComponent,
  ContactUsComponent,
  LeavefeedbackComponent,
  GameComponent,
  LogoutComponent,
  TimeSpanPipe,
  AuthHomeComponent,
  BoardComponent,
  ImagesComponent,
  GamearenaComponent,


],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatInputModule, 
    MatButtonModule,
    MatCheckboxModule

  ],
  providers: [],
  bootstrap: [LayoutComponent]
})
export class AppModule { }
