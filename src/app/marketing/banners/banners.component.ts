import { Component, OnInit, OnDestroy } from "@angular/core";
import { AppConfig } from "src/app/services/global.service";
import * as firebase from "firebase";
import { StoreSettings } from "../../models/store";
import { OverlayService } from '../../overlay/overlay.module';
import { ProgressSpinnerComponent } from '../../progress-spinner/progress-spinner.module';
import { Banners } from "src/app/models/banner";


@Component({
    selector: 'app-banners-cmp',
    templateUrl: './banners.component.html',
    styleUrls: ['./banners.component.css']
})

export class BannersComponent implements OnInit, OnDestroy {

    ngOnDestroy() {
    }

    constructor(private previewProgressSpinner: OverlayService) {
    }

    banners: Banners

    slider1_title: string = ''
    slider1_subtitle: string = ''
    slider1_image: string = './assets/img/image_placeholder.jpg'

    slider2_title: string = ''
    slider2_subtitle: string = ''
    slider2_image: string = './assets/img/image_placeholder.jpg'

    grid1_title: string = ''
    grid1_subtitle: string = ''
    grid1_image: string = './assets/img/image_placeholder.jpg'

    grid2_title: string = ''
    grid2_subtitle: string = ''
    grid2_image: string = './assets/img/image_placeholder.jpg'

    grid3_title: string = ''
    grid3_subtitle: string = ''
    grid3_image: string = './assets/img/image_placeholder.jpg'

    grid4_title: string = ''
    grid4_subtitle: string = ''
    grid4_image: string = './assets/img/image_placeholder.jpg'

    parallax_banner_title: string = ''
    parallax_banner_sub_title: string = ''
    parallax_banner_last_text: string = ''
    parallax_banner_image: string = './assets/img/image_placeholder.jpg'

    collection_text: string = ''
    collection_image: string = './assets/img/image_placeholder.jpg'

    sidebar_image: string = './assets/img/image_placeholder.jpg'

    banner_font_size = 0
    banner_text_color = ''
    config = new AppConfig()

    ngOnInit() {
        this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
        firebase.firestore().collection('db').doc('tacadmin').collection('settings').doc('banners').get().then(snap => {
            this.previewProgressSpinner.close()
            if (!snap.exists) {
                return
            }
            const ban = <Banners>snap.data()
            //console.log(`sidebar image = ${ban.sidebar_image}`)
            this.slider1_title = (ban.slider1_title != undefined) ? ban.slider1_title : ''
            this.slider1_subtitle = (ban.slider1_subtitle != undefined) ? ban.slider1_subtitle : ''
            this.slider1_image = (ban.slider1_image != undefined) ? ban.slider1_image : './assets/img/image_placeholder.jpg'

            this.slider2_title = (ban.slider2_title != undefined) ? ban.slider2_title : ''
            this.slider2_subtitle = (ban.slider2_subtitle != undefined) ? ban.slider2_subtitle : ''
            this.slider2_image = (ban.slider2_image != undefined) ? ban.slider2_image : './assets/img/image_placeholder.jpg'

            this.grid1_title = (ban.grid1_title != undefined) ? ban.grid1_title : ''
            this.grid1_subtitle = (ban.grid1_subtitle != undefined) ? ban.grid1_subtitle : ''
            this.grid1_image = (ban.grid1_image != undefined) ? ban.grid1_image : './assets/img/image_placeholder.jpg'

            this.grid2_title = (ban.grid2_title != undefined) ? ban.grid2_title : ''
            this.grid2_subtitle = (ban.grid2_subtitle != undefined) ? ban.grid2_subtitle : ''
            this.grid2_image = (ban.grid2_image != undefined) ? ban.grid2_image : './assets/img/image_placeholder.jpg'

            this.grid3_title = (ban.grid3_title != undefined) ? ban.grid3_title : ''
            this.grid3_subtitle = (ban.grid3_subtitle != undefined) ? ban.grid3_subtitle : ''
            this.grid3_image = (ban.grid3_image != undefined) ? ban.grid3_image : './assets/img/image_placeholder.jpg'

            this.grid4_title = (ban.grid4_title != undefined) ? ban.grid4_title : ''
            this.grid4_subtitle = (ban.grid4_subtitle != undefined) ? ban.grid4_subtitle : ''
            this.grid4_image = (ban.grid4_image != undefined) ? ban.grid4_image : './assets/img/image_placeholder.jpg'

            this.parallax_banner_title = (ban.parallax_banner_title != undefined) ? ban.parallax_banner_title : ''
            this.parallax_banner_sub_title = (ban.parallax_banner_sub_title != undefined) ? ban.parallax_banner_sub_title : ''
            this.parallax_banner_last_text = (ban.parallax_banner_last_text != undefined) ? ban.parallax_banner_last_text : ''
            this.parallax_banner_image = (ban.parallax_banner_image != undefined) ? ban.parallax_banner_image : './assets/img/image_placeholder.jpg'

            this.collection_text = (ban.collection_text != undefined) ? ban.collection_text : ''
            this.collection_image = (ban.collection_image != undefined) ? ban.collection_image : './assets/img/image_placeholder.jpg'

            this.sidebar_image = (ban.sidebar_image != undefined) ? ban.sidebar_image : './assets/img/image_placeholder.jpg'
            this.banner_font_size = (ban.banner_font_size != undefined) ? ban.banner_font_size : 0
            this.banner_text_color = (ban.banner_text_color != undefined) ? ban.banner_text_color : '#000000'
            //console.log(`this sidebar image = ${this.sidebar_image}`)
        })
    }

    async setSliderOne() {
        const image = (<HTMLInputElement>document.getElementById("slider1")).files
        if (this.slider1_title == '' || this.slider1_subtitle == '') {
            this.config.displayMessage("Please enter all fields & select image for each setting", false)
            return
        }
        if (image.length == 0) {
            if (this.slider1_image.search("assets/img") > 0) {
                this.config.displayMessage("Please enter all fields & select image for each setting", false)
                return
            }
        }
        this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
        const ban: Banners = {
            slider1_subtitle: this.slider1_subtitle,
            slider1_title: this.slider1_title,
            slider1_image: this.slider1_image,
        }
        if (image.length > 0) {
            const image_url = await this.uploadImageToFirebase(image)
            ban.slider1_image = image_url
            this.uploadValuesToBannerTable(ban)
        } else {
            this.uploadValuesToBannerTable(ban)
        }
    }

    async setSliderTwo() {
        const image = (<HTMLInputElement>document.getElementById("slider2")).files
        if (this.slider2_title == '' || this.slider2_subtitle == '') {
            this.config.displayMessage("Please enter all fields & select image for each setting", false)
            return
        }
        if (image.length == 0) {
            if (this.slider2_image.search("assets/img") > 0) {
                this.config.displayMessage("Please enter all fields & select image for each setting", false)
                return
            }
        }
        this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
        const ban: Banners = {
            slider2_subtitle: this.slider2_subtitle,
            slider2_title: this.slider2_title,
            slider2_image: this.slider2_image,
        }
        if (image.length > 0) {
            const image_url = await this.uploadImageToFirebase(image)
            ban.slider2_image = image_url
            this.uploadValuesToBannerTable(ban)
        } else {
            this.uploadValuesToBannerTable(ban)
        }
    }

    async setGridOne() {
        const image = (<HTMLInputElement>document.getElementById("grid1")).files
        if (this.grid1_title == '' || this.grid1_subtitle == '') {
            this.config.displayMessage("Please enter all fields & select image for each setting", false)
            return
        }
        if (image.length == 0) {
            if (this.grid1_image.search("assets/img") > 0) {
                this.config.displayMessage("Please enter all fields & select image for each setting", false)
                return
            }
        }
        this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
        const ban: Banners = {
            grid1_subtitle: this.grid1_subtitle,
            grid1_title: this.grid1_title,
            grid1_image: this.grid1_image,
        }
        if (image.length > 0) {
            const image_url = await this.uploadImageToFirebase(image)
            ban.grid1_image = image_url
            this.uploadValuesToBannerTable(ban)
        } else {
            this.uploadValuesToBannerTable(ban)
        }
    }

    async setGridTwo() {
        const image = (<HTMLInputElement>document.getElementById("grid2")).files
        if (this.grid2_title == '' || this.grid2_subtitle == '') {
            this.config.displayMessage("Please enter all fields & select image for each setting", false)
            return
        }
        if (image.length == 0) {
            if (this.grid2_image.search("assets/img") > 0) {
                this.config.displayMessage("Please enter all fields & select image for each setting", false)
                return
            }
        }
        this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
        const ban: Banners = {
            grid2_subtitle: this.grid2_subtitle,
            grid2_title: this.grid2_title,
            grid2_image: this.grid2_image,
        }
        if (image.length > 0) {
            const image_url = await this.uploadImageToFirebase(image)
            ban.grid2_image = image_url
            this.uploadValuesToBannerTable(ban)
        } else {
            this.uploadValuesToBannerTable(ban)
        }
    }

    async setGridThree() {
        const image = (<HTMLInputElement>document.getElementById("grid3")).files
        if (this.grid3_title == '' || this.grid3_subtitle == '') {
            this.config.displayMessage("Please enter all fields & select image for each setting", false)
            return
        }
        if (image.length == 0) {
            if (this.grid3_image.search("assets/img") > 0) {
                this.config.displayMessage("Please enter all fields & select image for each setting", false)
                return
            }
        }
        this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
        const ban: Banners = {
            grid3_subtitle: this.grid3_subtitle,
            grid3_title: this.grid3_title,
            grid3_image: this.grid3_image,
        }
        if (image.length > 0) {
            const image_url = await this.uploadImageToFirebase(image)
            ban.grid3_image = image_url
            this.uploadValuesToBannerTable(ban)
        } else {
            this.uploadValuesToBannerTable(ban)
        }
    }

    async setGridFour() {
        const image = (<HTMLInputElement>document.getElementById("grid4")).files
        if (this.grid4_title == '' || this.grid4_subtitle == '') {
            this.config.displayMessage("Please enter all fields & select image for each setting", false)
            return
        }
        if (image.length == 0) {
            if (this.grid4_image.search("assets/img") > 0) {
                this.config.displayMessage("Please enter all fields & select image for each setting", false)
                return
            }
        }
        this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
        const ban: Banners = {
            grid4_subtitle: this.grid4_subtitle,
            grid4_title: this.grid4_title,
            grid4_image: this.grid4_image,
        }
        if (image.length > 0) {
            const image_url = await this.uploadImageToFirebase(image)
            ban.grid4_image = image_url
            this.uploadValuesToBannerTable(ban)
        } else {
            this.uploadValuesToBannerTable(ban)
        }
    }

    async setParallax() {
        const image = (<HTMLInputElement>document.getElementById("parallax")).files
        if (this.parallax_banner_title == '' || this.parallax_banner_sub_title == '' || this.parallax_banner_last_text == '') {
            this.config.displayMessage("Please enter all fields & select image for each setting", false)
            return
        }
        if (image.length == 0) {
            if (this.parallax_banner_image.search("assets/img") > 0) {
                this.config.displayMessage("Please enter all fields & select image for each setting", false)
                return
            }
        }
        this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
        const ban: Banners = {
            parallax_banner_sub_title: this.parallax_banner_sub_title,
            parallax_banner_title: this.parallax_banner_title,
            parallax_banner_last_text: this.parallax_banner_last_text,
            parallax_banner_image: this.parallax_banner_image,
        }
        if (image.length > 0) {
            const image_url = await this.uploadImageToFirebase(image)
            ban.parallax_banner_image = image_url
            this.uploadValuesToBannerTable(ban)
        } else {
            this.uploadValuesToBannerTable(ban)
        }
    }

    async setCollection() {
        const image = (<HTMLInputElement>document.getElementById("collection")).files
        if (this.collection_text == '') {
            this.config.displayMessage("Please enter all fields & select image for each setting", false)
            return
        }
        if (image.length == 0) {
            if (this.collection_image.search("assets/img") > 0) {
                this.config.displayMessage("Please enter all fields & select image for each setting", false)
                return
            }
        }
        this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
        const ban: Banners = {
            collection_text: this.collection_text,
            collection_image: this.collection_image,
        }
        if (image.length > 0) {
            const image_url = await this.uploadImageToFirebase(image)
            ban.collection_image = image_url
            this.uploadValuesToBannerTable(ban)
        } else {
            this.uploadValuesToBannerTable(ban)
        }
    }

    async setSideBar() {
        const image = (<HTMLInputElement>document.getElementById("sidebar")).files
        if (image.length == 0) {
            if (this.sidebar_image.search("assets/img") > 0) {
                this.config.displayMessage("Please enter all fields & select image for each setting", false)
                return
            }
        }
        this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
        const ban: Banners = {
            sidebar_image: this.sidebar_image
        }
        if (image.length > 0) {
            const image_url = await this.uploadImageToFirebase(image)
            ban.sidebar_image = image_url
            this.uploadValuesToBannerTable(ban)
        } else {
            this.uploadValuesToBannerTable(ban)
        }
    }

    async uploadImageToFirebase(image: FileList): Promise<any> {
        const key = firebase.database().ref().push().key
        const upload_task = firebase.storage().ref("banners").child(`${key}.jpg`)
        const put = await upload_task.put(image.item(0))
        const url = await upload_task.getDownloadURL()
        return url
    }

    uploadValuesToBannerTable(banner: Banners) {
        firebase.firestore().collection('db').doc('tacadmin').collection('settings').doc('banners').update(banner).then(done => {
            this.previewProgressSpinner.close()
            this.config.displayMessage("Banner Settings saved", true)
        }).catch(err => {
            this.previewProgressSpinner.close()
            this.config.displayMessage(`${err}`, false)
        })
    }

    setColorFontSize() {
        if(this.banner_font_size <= 10){
            this.config.displayMessage("Font size must be greater than 10", false)
            return
        }
        this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
        const ban: Banners = {
            banner_font_size: this.banner_font_size,
            banner_text_color: this.banner_text_color
        }
        this.uploadValuesToBannerTable(ban)
    }
}