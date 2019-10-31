import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import * as firebase from "firebase";
import { AdminUsers } from "./models/admin.users";
import { UserIdleService } from 'angular-user-idle';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-my-app',
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {
  private _router: Subscription;
  isLoggedIn: boolean = false;
  email: string = '';
  isLogout = true

  constructor(private router: Router, private userIdle: UserIdleService) {
  }

  checkLoggedInAccess() {
    this.email = localStorage.getItem('email');
    if (this.email == null) {
      this.email = '';
    }
    firebase.auth().onAuthStateChanged(userData => {
      if (userData) {
        this.isLoggedIn = true;
        localStorage.setItem('logged', 'true');
      } else {
        localStorage.setItem('logged', 'false');
        if (this.isLogout) {
          this.logUserOut(true)
        } else {
          this.logUserOut(false)
        }
      }
    });
  }

  checkblockeduser() {
    this.email = localStorage.getItem('email');
    if (this.email == null) {
      return
    }
    firebase.firestore().collection('db').doc('tacadmin').collection('users').doc(this.email).onSnapshot(user => {
      const m = <AdminUsers>user.data()
      if (m != null) {
        const blocked: boolean = m.blocked
        if (blocked) {
          this.logUserOut(true)
        }
      }
    })
  }

  logUserOut(clearAll: boolean) {
    if (clearAll) {
      this.isLoggedIn = false;
      firebase.auth().signOut();
      localStorage.clear();
      this.router.navigate(['/pages/login'])
    } else {
      this.isLoggedIn = false;
      firebase.auth().signOut();
      this.router.navigate(['/pages/lock'])
    }
  }

  ngOnInit() {

    firebase.initializeApp(environment.firebase);

    this._router = this.router.events.filter(event => event instanceof NavigationEnd).subscribe((event: NavigationEnd) => {
      const body = document.getElementsByTagName('body')[0];
      const modalBackdrop = document.getElementsByClassName('modal-backdrop')[0];
      if (body.classList.contains('modal-open')) {
        body.classList.remove('modal-open');
        modalBackdrop.remove();
      }
    });

    this.checkLoggedInAccess()
    this.checkblockeduser()

    this.userIdle.startWatching();
    // Start watch when time is up.
    this.userIdle.onTimeout().subscribe(() => {
      this.isLogout = false
      this.logUserOut(false)
      this.stopWatching()
    });
  }

  stopWatching() {
    this.userIdle.stopTimer();
    this.userIdle.stopWatching();
  }
}
