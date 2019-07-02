import { Component, OnInit, OnDestroy } from "@angular/core";
import { Currency } from "../../models/currency";
import { AppConfig } from "../../services/global.service";
import * as firebase from "firebase"
import swal from "sweetalert2";
import { OverlayService } from '../../overlay/overlay.module';
import { ProgressSpinnerComponent } from '../../progress-spinner/progress-spinner.module';

declare interface TableData {
    headerRow: string[];
    dataRows: string[][];
}

declare interface Styles {
    id: string;
    title: string;
    image: string;
}

@Component({
    selector: 'app-gift-messages-cmp',
    templateUrl: './gift-messages.component.html',
    styleUrls: ['./gift-messages.component.css']
})

export class GiftMessagesComponent implements OnInit, OnDestroy {

    public tableData1: TableData;
    styles: Styles[] = []
    config = new AppConfig()
    data: string[][] = [];
    closeResult = ''

    isAddEdit = false
    isAdding = false
    sImage = './assets/img/image_placeholder.jpg'
    sTitle = ''
    currentStyle: any

    constructor(private previewProgressSpinner: OverlayService) {
        this.tableData1 = {
            headerRow: ['#', 'Image', 'Title', 'Actions'],
            dataRows: this.data
        };
    }

    getGiftCardStyles() {
        firebase.firestore().collection('db').doc('tacadmin').collection('gift-card-styles').onSnapshot(query => {
            this.data = []
            this.styles = []
            var index = 0
            query.forEach(data => {
                const st = <Styles>data.data()
                this.styles.push(st)
                this.data.push([`${index + 1}`, st.id, st.image, st.title, 'btn-link'])
                index = index + 1
            })
            this.tableData1 = {
                headerRow: ['#', 'Image', 'Title', 'Actions'],
                dataRows: this.data
            };
        });
    }

    ngOnDestroy() {

    }

    ngOnInit() {
        this.getGiftCardStyles()
    }

    addStyle() {
        this.isAddEdit = true
        this.isAdding = true
    }

    cancelStyle() {
        this.isAddEdit = false
        this.isAdding = false
        this.clearFields()
    }

    clearFields() {
        this.sImage = './assets/img/image_placeholder.jpg'
        this.sTitle = ''
    }

    editStyle(style: any) {
        this.sImage = style[2]
        this.sTitle = style[3]
        this.isAddEdit = true
        this.currentStyle = style
        this.isAdding = false
    }

    deleteStyle(style: any) {
        const id = `${style[1]}`
        swal({
            title: 'Delete Alert',
            text: 'Are you sure about deleting this gift card style?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
            confirmButtonClass: "btn btn-success",
            cancelButtonClass: "btn btn-danger",
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                firebase.firestore().collection('db').doc('tacadmin').collection('gift-card-styles').doc(id).delete().then(del => {
                    const current_email = localStorage.getItem('email')
                    const current_name = localStorage.getItem('name')
                    this.config.logActivity(`${current_name}|${current_email} deleted this gift card style: ${style[3]}`)
                    this.config.displayMessage("Successfully deleted", true);
                }).catch(err => {
                    this.config.displayMessage(`${err}`, false);
                })
            } else {
                swal({
                    title: 'Cancelled',
                    text: 'Deletion not successful',
                    type: 'error',
                    confirmButtonClass: "btn btn-info",
                    buttonsStyling: false
                }).catch(swal.noop)
            }
        })
    }

    async submitStyle() {
        const image = (<HTMLInputElement>document.getElementById("style_image")).files
        if (image.length == 0) {
            if (this.sImage.search("assets/img") > 0) {
                this.config.displayMessage("Please enter all fields & select an image", false)
                return
            }
        }
        if (this.sTitle == '') {
            this.config.displayMessage("Please enter all fields.", false)
            return
        }
        this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
        const id = (this.isAdding) ? firebase.database().ref().push().key : this.currentStyle[1]
        const st: Styles = {
            id: id,
            title: this.sTitle,
            image: this.sImage
        }
        if (image.length > 0) {
            const image_url = await this.uploadImageToFirebase(image)
            st.image = image_url
            this.uploadValuesToBannerTable(st,this.isAdding)
        } else {
            this.uploadValuesToBannerTable(st, this.isAdding)
        }
        
    }

    async uploadImageToFirebase(image: FileList): Promise<any> {
        const upload_task = firebase.storage().ref("gift-card-styles").child(image.item(0).name)
        const put = await upload_task.put(image.item(0))
        const url = await upload_task.getDownloadURL()
        return url
    }

    uploadValuesToBannerTable(sty: Styles, isAdd: boolean) {
        if (isAdd) {
            firebase.firestore().collection('db').doc('tacadmin').collection('gift-card-styles').doc(sty.id).set(sty).then(done => {
                const current_email = localStorage.getItem('email')
                const current_name = localStorage.getItem('name')
                this.config.logActivity(`${current_name}|${current_email} created this currency: ${sty.title}`)
                this.previewProgressSpinner.close()
                this.clearFields()
                this.config.displayMessage("Style saved", true)
                this.isAddEdit = false
                this.isAdding = false
            }).catch(err => {
                this.previewProgressSpinner.close()
                this.config.displayMessage(`${err}`, false)
            })
        } else {
            firebase.firestore().collection('db').doc('tacadmin').collection('gift-card-styles').doc(sty.id).update(sty).then(done => {
                const current_email = localStorage.getItem('email')
                const current_name = localStorage.getItem('name')
                this.config.logActivity(`${current_name}|${current_email} created this currency: ${sty.title}`)
                this.previewProgressSpinner.close()
                this.clearFields()
                this.config.displayMessage("Style saved", true)
                this.isAddEdit = false
                this.isAdding = false
            }).catch(err => {
                this.previewProgressSpinner.close()
                this.config.displayMessage(`${err}`, false)
            })
        }
    }


}