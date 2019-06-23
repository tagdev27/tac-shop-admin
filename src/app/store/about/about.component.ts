import { Component, OnInit, OnDestroy } from "@angular/core";
import { AppConfig } from "src/app/services/global.service";
import * as firebase from "firebase";


@Component({
    selector: 'app-about-cmp',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css']
})

export class AboutComponent implements OnInit, OnDestroy {

    ngOnDestroy() {

    }

    tax:string = ''
    config = new AppConfig()

    ngOnInit(){
        firebase.firestore().collection('db').doc('tacadmin').collection('settings').doc('store').get().then(snap => {
            this.tax = snap.data()['tax_value']
        })
    }

    setTax(){
        if(this.tax == ''){
            this.config.displayMessage("Please enter tax value", false)
            return
        }
        firebase.firestore().collection('db').doc('tacadmin').collection('settings').doc('store').set({'tax_value':this.tax}).then(snap => {
            this.config.displayMessage("Store Settings saved", true)
        }).catch(err => {
            this.config.displayMessage(`${err}`, false)
        })
    }
}