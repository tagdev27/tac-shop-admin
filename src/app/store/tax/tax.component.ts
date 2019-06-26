import { Component, OnInit, OnDestroy } from "@angular/core";
import * as firebase from "firebase";
import { AppConfig } from "../../services/global.service";
import { config } from "rxjs";
import { OverlayService } from '../../overlay/overlay.module';
import { ProgressSpinnerComponent } from '../../progress-spinner/progress-spinner.module';


@Component({
    selector: 'app-tax-cmp',
    templateUrl: './tax.component.html',
    styleUrls: ['./tax.component.css']
})

export class TaxComponent implements OnInit, OnDestroy {

    ngOnDestroy() {

    }

    constructor(private previewProgressSpinner: OverlayService){

    }

    tax:string = ''
    config = new AppConfig()

    ngOnInit(){
        this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
        firebase.firestore().collection('db').doc('tacadmin').collection('settings').doc('tax').get().then(snap => {
            this.previewProgressSpinner.close()
            this.tax = snap.data()['tax_value']
        })
    }

    setTax(){
        if(this.tax == ''){
            this.config.displayMessage("Please enter tax value", false)
            return
        }
        this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
        firebase.firestore().collection('db').doc('tacadmin').collection('settings').doc('tax').set({'tax_value':this.tax}).then(snap => {
            this.previewProgressSpinner.close()
            this.config.displayMessage("Tax value saved", true)
        }).catch(err => {
            this.previewProgressSpinner.close()
            this.config.displayMessage(`${err}`, false)
        })
    }
}