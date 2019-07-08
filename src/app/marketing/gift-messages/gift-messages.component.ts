import { Component, OnInit, OnDestroy } from "@angular/core";
import { Currency } from "../../models/currency";
import { AppConfig } from "../../services/global.service";
import * as firebase from "firebase"
import swal from "sweetalert2";
import { OverlayService } from '../../overlay/overlay.module';
import { ProgressSpinnerComponent } from '../../progress-spinner/progress-spinner.module';
import { MainCategory } from "src/app/models/main.category";
import { SubCategory } from "src/app/models/sub.category";

declare interface TableData {
    headerRow: string[];
    dataRows: string[][];
}

declare interface Styles {
    id: string;
    title: string;
    image: string;
}

declare interface Messages {
    id: string;
    category: string;
    text: string;
}

@Component({
    selector: 'app-gift-messages-cmp',
    templateUrl: './gift-messages.component.html',
    styleUrls: ['./gift-messages.component.css']
})

export class GiftMessagesComponent implements OnInit, OnDestroy {

    public tableData1: TableData;
    public tableData2: TableData;

    styles: Styles[] = []
    messages: Messages[] = []
    config = new AppConfig()
    data: string[][] = [];
    data2: string[][] = [];
    closeResult = ''

    isAddEdit = false
    isAdding = false
    sImage = './assets/img/image_placeholder.jpg'
    sTitle = ''
    currentStyle: any

    //messages
    card_categories:string[] = []
    mCategory = []
    mText = ''
    isMessageAddEdit = false
    currentMessage:any

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

    getGiftCardMessages() {
        firebase.firestore().collection('db').doc('tacadmin').collection('gift-card-messages').onSnapshot(query => {
            this.data2 = []
            this.messages = []
            var index = 0
            query.forEach(data => {
                const msg = <Messages>data.data()
                this.messages.push(msg)
                this.data2.push([`${index + 1}`, msg.id, msg.category, msg.text, 'btn-link'])
                index = index + 1
            })
            this.tableData2 = {
                headerRow: ['#', 'Card Category', 'Card Message', 'Actions'],
                dataRows: this.data2
            };
        });
    }

    getMainCategories() {
        firebase.firestore().collection('db').doc('tacadmin').collection('main-categories').where("deleted", "==", false).get().then(query => {
            this.card_categories = []
            query.forEach(data => {
                const category = <MainCategory>data.data()
                this.card_categories.push(category.name)
            })
            this.getSubCategories()
        });
    }

    getSubCategories() {//main_cat_id:string .where("main_category_id", "==", main_cat_id)
        firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').where("deleted", "==", false).get().then(query => {
            query.forEach(data => {
                const category = <SubCategory>data.data()
                this.card_categories.push(category.name)
            })
        });
    }

    ngOnDestroy() {

    }

    ngOnInit() {
        this.getGiftCardStyles()
        this.getGiftCardMessages()
        this.getMainCategories()
    }

    addStyle() {
        this.isAddEdit = true
        this.isAdding = true
    }

    addMessage() {
        this.isMessageAddEdit = true
        this.isAdding = true
    }

    cancelStyle() {
        this.isAddEdit = false
        this.isAdding = false
        this.clearFields()
    }

    cancelMessage() {
        this.isMessageAddEdit = false
        this.isAdding = false
        this.clearFields()
    }

    clearFields() {
        this.sImage = './assets/img/image_placeholder.jpg'
        this.sTitle = ''
        this.mText = ''
        this.mCategory = []
    }

    editStyle(style: any) {
        this.sImage = style[2]
        this.sTitle = style[3]
        this.isAddEdit = true
        this.currentStyle = style
        this.isAdding = false
    }

    editMessage(msg:any){
        this.mCategory = `${msg[2]}`.split(',')
        this.mText = msg[3]
        this.isMessageAddEdit = true
        this.currentMessage = msg
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

    deleteMessage(msg:any){
        const id = `${msg[1]}`
        swal({
            title: 'Delete Alert',
            text: 'Are you sure about deleting this gift card message?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
            confirmButtonClass: "btn btn-success",
            cancelButtonClass: "btn btn-danger",
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                firebase.firestore().collection('db').doc('tacadmin').collection('gift-card-messages').doc(id).delete().then(del => {
                    const current_email = localStorage.getItem('email')
                    const current_name = localStorage.getItem('name')
                    this.config.logActivity(`${current_name}|${current_email} deleted this gift card message: ${msg[3]}`)
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

    submitMessage() {
        if(this.mCategory.length == 0 || this.mText == ''){
            this.config.displayMessage("Please enter all fields.", false)
            return
        }
        this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
        const id = (this.isAdding) ? firebase.database().ref().push().key : this.currentMessage[1]
        const msg: Messages = {
            id: id,
            category: this.mCategory.join(','),
            text: this.mText
        }
        if (this.isAdding) {
            firebase.firestore().collection('db').doc('tacadmin').collection('gift-card-messages').doc(msg.id).set(msg).then(done => {
                const current_email = localStorage.getItem('email')
                const current_name = localStorage.getItem('name')
                this.config.logActivity(`${current_name}|${current_email} created a card message`)
                this.previewProgressSpinner.close()
                this.clearFields()
                this.config.displayMessage("Gift Card Message saved", true)
                this.isMessageAddEdit = false
                this.isAdding = false
            }).catch(err => {
                this.previewProgressSpinner.close()
                this.config.displayMessage(`${err}`, false)
            })
        } else {
            firebase.firestore().collection('db').doc('tacadmin').collection('gift-card-messages').doc(msg.id).update(msg).then(done => {
                const current_email = localStorage.getItem('email')
                const current_name = localStorage.getItem('name')
                this.config.logActivity(`${current_name}|${current_email} created a card message`)
                this.previewProgressSpinner.close()
                this.clearFields()
                this.config.displayMessage("Gift Card Message saved", true)
                this.isMessageAddEdit = false
                this.isAdding = false
            }).catch(err => {
                this.previewProgressSpinner.close()
                this.config.displayMessage(`${err}`, false)
            })
        }
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
                this.config.logActivity(`${current_name}|${current_email} created this style: ${sty.title}`)
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
                this.config.logActivity(`${current_name}|${current_email} created this style: ${sty.title}`)
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