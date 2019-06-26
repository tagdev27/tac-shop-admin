import { Component, OnInit, OnDestroy } from "@angular/core";
import { AppConfig } from "src/app/services/global.service";
import * as firebase from "firebase";
import { StoreSettings } from "../../models/store";
import { OverlayService } from '../../overlay/overlay.module';
import { ProgressSpinnerComponent } from '../../progress-spinner/progress-spinner.module';


@Component({
    selector: 'app-about-cmp',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css']
})

export class AboutComponent implements OnInit, OnDestroy {

    ngOnDestroy() {

    }

    constructor(private previewProgressSpinner: OverlayService) {

    }

    address: string = ''
    email: string = ''
    number: string = ''
    fax: string = ''
    desc: string = ''
    facebook: string = ''
    instagram: string = ''
    twitter: string = ''

    settings: StoreSettings

    config = new AppConfig()

    ngOnInit() {
        this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
        firebase.firestore().collection('db').doc('tacadmin').collection('settings').doc('store').get().then(snap => {
            this.previewProgressSpinner.close()
            if (!snap.exists) {
                return
            }
            this.settings = <StoreSettings>snap.data()
            this.address = this.settings.address
            this.email = this.settings.email
            this.number = this.settings.number
            this.fax = this.settings.fax
            this.desc = this.settings.description
            this.facebook = this.settings.facebook_url
            this.instagram = this.settings.instagram_url
            this.twitter = this.settings.twitter_url
        })
    }

    setAbout() {
        if (this.address == '' || this.email == '' || this.number == '' || this.fax == '' || this.desc == '') {
            this.config.displayMessage("Please all fields except the social accounts are required.", false)
            return
        }
        if (this.facebook != '') {
            if (!this.facebook.startsWith('http') || !this.facebook.startsWith('https')) {
                this.config.displayMessage("Please facebook url must start with http:// or https://.", false)
                return
            }
        }
        if (this.instagram != '') {
            if (!this.instagram.startsWith('http') || !this.instagram.startsWith('https')) {
                this.config.displayMessage("Please instagram url must start with http:// or https://.", false)
                return
            }
        }
        if (this.twitter != '') {
            if (!this.twitter.startsWith('http') || !this.twitter.startsWith('https')) {
                this.config.displayMessage("Please twitter url must start with http:// or https://.", false)
                return
            }
        }
        this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
        const setting: StoreSettings = {
            address: this.address,
            email: this.email,
            number: this.number,
            fax: this.fax,
            description: this.desc,
            facebook_url: this.facebook,
            instagram_url: this.instagram,
            twitter_url: this.twitter
        }
        firebase.firestore().collection('db').doc('tacadmin').collection('settings').doc('store').set(setting).then(snap => {
            this.previewProgressSpinner.close()
            this.config.displayMessage("Store Settings saved", true)
        }).catch(err => {
            this.previewProgressSpinner.close()
            this.config.displayMessage(`${err}`, false)
        })
    }
}