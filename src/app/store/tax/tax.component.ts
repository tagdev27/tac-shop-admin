import { Component, OnInit, OnDestroy } from "@angular/core";
import * as firebase from "firebase";
import { AppConfig } from "../../services/global.service";
import { config } from "rxjs";


@Component({
    selector: 'app-tax-cmp',
    templateUrl: './tax.component.html',
    styleUrls: ['./tax.component.css']
})

export class TaxComponent implements OnInit, OnDestroy {

    ngOnDestroy() {

    }

    tax:string = ''
    config = new AppConfig()

    ngOnInit(){
        firebase.firestore().collection('db').doc('tacadmin').collection('settings').doc('tax').get().then(snap => {
            this.tax = snap.data()['tax_value']
        })
    }

    setTax(){
        if(this.tax == ''){
            this.config.displayMessage("Please enter tax value", false)
            return
        }
        firebase.firestore().collection('db').doc('tacadmin').collection('settings').doc('tax').set({'tax_value':this.tax}).then(snap => {
            this.config.displayMessage("Tax value saved", true)
        }).catch(err => {
            this.config.displayMessage(`${err}`, false)
        })
    }
}