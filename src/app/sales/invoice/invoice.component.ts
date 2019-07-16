import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import * as firebase from "firebase";
import { CartItem } from '../../models/cart.item';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { OverlayService } from '../../overlay/overlay.module';
import { ProgressSpinnerComponent } from '../../progress-spinner/progress-spinner.module';
import { AppConfig } from '../../services/global.service';

declare interface DataTable {
    headerRow: string[];
    footerRow: string[];
    dataRows: string[][];
}

@Component({
    selector: 'app-invoice-cmp',
    templateUrl: 'invoice.component.html',
    styleUrls: ['./invoice.component.css']
})

export class InvoiceComponent implements OnInit {

    public dataTable: DataTable;
    data: string[][] = []
    config = new AppConfig()

    ngOnInit() {
        this.getInvoices()
    }
    
    constructor(private modalService: NgbModal, private previewProgressSpinner: OverlayService){
    }

    getInvoices() {
        firebase.firestore().collection('invoices').onSnapshot(query => {
            this.data = []
            var index = 1
            query.forEach(data => {
                const inv = data.data()
                this.data.push([`${index}`, inv['invoice_id'], inv['email'], inv['created_date'], inv['invoice_url']])
                index = index + 1
            })
            this.dataTable = {
                headerRow: ['ID', 'Invoice ID', 'User Email', 'Created Date', 'File'],
                footerRow: ['ID', 'Invoice ID', 'User Email', 'Created Date', 'File'],
                dataRows: this.data
            };
        });
    }

    ngAfterViewInit() {
        (<any>$('#datatables')).DataTable({
            "pagingType": "full_numbers",
            "lengthMenu": [
                [10, 25, 50, -1],
                [10, 25, 50, "All"]
            ],
            responsive: true,
            language: {
                search: "_INPUT_",
                searchPlaceholder: "Search records",
            }

        });

        const table = (<any>$('#datatables')).DataTable();

        $('.card .material-datatables label').addClass('form-group');
    }
}
