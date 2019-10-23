import { Component, OnInit, OnDestroy } from "@angular/core";
import { AppConfig } from "../../services/global.service";
import * as firebase from "firebase"
import swal from "sweetalert2";
import { OverlayService } from '../../overlay/overlay.module';
import { ProgressSpinnerComponent } from '../../progress-spinner/progress-spinner.module';
import { Delivery } from "src/app/models/delivery";

declare interface TableData {
    headerRow: string[];
    dataRows: string[][];
}

@Component({
    selector: 'app-delivery-cmp',
    templateUrl: './delivery.component.html',
    styleUrls: ['./delivery.component.css']
})

export class DeliveryComponent implements OnInit, OnDestroy {

    public tableData1: TableData;
    delivery: Delivery[] = []
    config = new AppConfig()
    data: string[][] = [];
    closeResult = ''

    isAddEdit = false
    isAddCurrency = true
    dName = ''
    dDesc = ''
    dAmt = 0
    currentCurrent: any

    constructor(private previewProgressSpinner: OverlayService){
        this.tableData1 = {
            headerRow: ['#', 'Name', 'Description', 'Amount', 'Created Date', 'Modified Date', 'Actions'],
            dataRows: this.data
        };
    }

    getDeliveries() {
        firebase.firestore().collection('db').doc('tacadmin').collection('delivery').onSnapshot(query => {
            this.data = []
            this.delivery = []
            var index = 0
            query.forEach(data => {
                const del = <Delivery>data.data()
                this.delivery.push(del)
                this.data.push([`${index + 1}`, del.id, del.name, del.description, `₦${del.value}`, del.created_date, del.modified_date, 'btn-link'])
                index = index + 1
            })
            this.tableData1 = {
                headerRow: ['#', 'Name', 'Description', 'Amount', 'Created Date', 'Modified Date', 'Actions'],
                dataRows: this.data
            };
        });
    }

    ngOnDestroy() {

    }

    ngOnInit() {
        this.getDeliveries()
    }

    addCurrency() {
        this.isAddEdit = true
    }

    cancelCurrency() {
        this.isAddEdit = false
        this.clearFields()
    }

    clearFields() {
        this.dName = ''
        this.dDesc = ''
        this.dAmt = 0
    }

    editCurr(curr: any) {
        this.currentCurrent = curr
        this.dName = curr[2]
        this.dDesc = curr[3]
        this.dAmt = Number(`${curr[4]}`.substring(1))
        this.isAddCurrency = false
        this.isAddEdit = true
    }

    deleteCurr(curr: any) {
        const id = `${curr[1]}`
        swal({
            title: 'Delete Alert',
            text: 'Are you sure about deleting this delivery?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
            confirmButtonClass: "btn btn-success",
            cancelButtonClass: "btn btn-danger",
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                firebase.firestore().collection('db').doc('tacadmin').collection('delivery').doc(id).delete().then(del => {
                    const current_email = localStorage.getItem('email')
                    const current_name = localStorage.getItem('name')
                    this.config.logActivity(`${current_name}|${current_email} deleted this delivery: ${curr[2]}`)
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

    submitCurrency() {
        if (this.dName == '' || this.dAmt == 0 || this.dDesc == '') {
            this.config.displayMessage("Please enter all fields.", false)
            return
        }
        this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
        const current_email = localStorage.getItem('email')
        const current_name = localStorage.getItem('name')
        if (this.isAddCurrency) {
            const id = firebase.database().ref().push().key
            const newCurr: Delivery = {
                id: id,
                created_by: `${current_name}|${current_email}`,
                created_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
                modified_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
                value: this.dAmt,
                name: this.dName,
                description: this.dDesc
            }
            firebase.firestore().collection('db').doc('tacadmin').collection('delivery').doc(id).set(newCurr).then(del => {
                this.config.logActivity(`${current_name}|${current_email} created this delivery: ${this.dName}`)
                this.previewProgressSpinner.close()
                this.clearFields()
                this.config.displayMessage("Successfully created", true);
                this.isAddEdit = false
                this.isAddCurrency = true
            }).catch(err => {
                this.previewProgressSpinner.close()
                this.config.displayMessage(`${err}`, false);
            })
        } else {
            firebase.firestore().collection('db').doc('tacadmin').collection('delivery').doc(this.currentCurrent[1]).update({
                'modified_date': `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
                'value': this.dAmt,
                'name': this.dName,
                'description': this.dDesc
            }).then(del => {
                this.config.logActivity(`${current_name}|${current_email} updated this delivery: ${this.dName}`)
                this.previewProgressSpinner.close()
                this.clearFields()
                this.config.displayMessage("Successfully updated", true);
                this.isAddEdit = false
                this.isAddCurrency = true
            }).catch(err => {
                this.previewProgressSpinner.close()
                this.config.displayMessage(`${err}`, false);
            })
        }
    }


}