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

@Component({
    selector: 'app-currency-cmp',
    templateUrl: './currency.component.html',
    styleUrls: ['./currency.component.css']
})

export class CurrencyComponent implements OnInit, OnDestroy {

    public tableData1: TableData;
    currency: Currency[] = []
    config = new AppConfig()
    data: string[][] = [];
    closeResult = ''

    isAddEdit = false
    isAddCurrency = true
    cTitle = ''
    cName = ''
    cSymbol = ''
    cRate = 0
    currentCurrent: any

    constructor(private previewProgressSpinner: OverlayService){
        this.tableData1 = {
            headerRow: ['#', 'Country', 'Name', 'Symbol', 'Exchange Rate', 'Default', 'Created Date', 'Modified Date', 'Actions'],
            dataRows: this.data
        };
    }

    getCurrencies() {
        firebase.firestore().collection('db').doc('tacadmin').collection('currency').onSnapshot(query => {
            this.data = []
            this.currency = []
            var index = 0
            query.forEach(data => {
                const currency = <Currency>data.data()
                this.currency.push(currency)
                this.data.push([`${index + 1}`, currency.id, currency.country, currency.name, currency.symbol, `${currency.exchange_rate}`, `${currency.default}`, currency.created_date, currency.modified_date, 'btn-link'])
                index = index + 1
            })
            this.tableData1 = {
                headerRow: ['#', 'Country', 'Name', 'Symbol', 'Exchange Rate', 'Default', 'Created Date', 'Modified Date', 'Actions'],
                dataRows: this.data
            };
        });
    }

    ngOnDestroy() {

    }

    ngOnInit() {
        this.getCurrencies()
    }

    addCurrency() {
        this.isAddEdit = true
    }

    cancelCurrency() {
        this.isAddEdit = false
        this.clearFields()
    }

    clearFields() {
        this.cTitle = ''
        this.cName = ''
        this.cSymbol = ''
        this.cRate = ''
    }

    editCurr(curr: any) {
        if (curr[2] == 'Nigeria') {
            this.config.displayMessage("This currency can't be edited", false);
            return
        }
        this.currentCurrent = curr
        this.cTitle = curr[2]
        this.cName = curr[3]
        this.cSymbol = curr[4]
        this.cRate = curr[5]
        this.isAddCurrency = false
        this.isAddEdit = true
    }

    deleteCurr(curr: any) {
        if (curr[2] == 'Nigeria') {
            this.config.displayMessage("This currency can't be deleted", false);
            return
        }
        const id = `${curr[1]}`
        swal({
            title: 'Delete Alert',
            text: 'Are you sure about deleting this currency?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
            confirmButtonClass: "btn btn-success",
            cancelButtonClass: "btn btn-danger",
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                firebase.firestore().collection('db').doc('tacadmin').collection('currency').doc(id).delete().then(del => {
                    const current_email = localStorage.getItem('email')
                    const current_name = localStorage.getItem('name')
                    this.config.logActivity(`${current_name}|${current_email} deleted this currency: ${curr[2]}`)
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
        if (this.cName == '' || this.cRate == 0 || this.cSymbol == '' || this.cTitle == '') {
            this.config.displayMessage("Please enter all fields.", false)
            return
        }
        this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
        const current_email = localStorage.getItem('email')
        const current_name = localStorage.getItem('name')
        if (this.isAddCurrency) {
            const id = firebase.database().ref().push().key
            const newCurr: Currency = {
                id: id,
                created_by: `${current_name}|${current_email}`,
                created_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
                modified_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
                default: false,
                exchange_rate: this.cRate,
                name: this.cName,
                symbol: this.cSymbol,
                country: this.cTitle
            }
            firebase.firestore().collection('db').doc('tacadmin').collection('currency').doc(id).set(newCurr).then(del => {
                this.config.logActivity(`${current_name}|${current_email} created this currency: ${this.cTitle}`)
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
            firebase.firestore().collection('db').doc('tacadmin').collection('currency').doc(this.currentCurrent[1]).update({
                'modified_date': `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
                'exchange_rate': this.cRate,
                'name': this.cName,
                'symbol': this.cSymbol,
                'country': this.cTitle
            }).then(del => {
                this.config.logActivity(`${current_name}|${current_email} updated this currency: ${this.cTitle}`)
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