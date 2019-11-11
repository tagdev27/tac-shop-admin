import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import * as firebase from "firebase";
import swal from 'sweetalert2';
import { MainCategory } from "../../models/main.category";
import { Router } from '@angular/router';
import { OverlayService } from '../../overlay/overlay.module';
import { ProgressSpinnerComponent } from '../../progress-spinner/progress-spinner.module';
import { AppConfig } from "../../services/global.service";
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import { Product } from 'src/app/models/product';
import { Reviews } from 'src/app/models/review';
import { TacOrder, Tracking } from 'src/app/models/orders';
import { EmailBody } from "src/app/services/emailing";
import { HttpClient } from '@angular/common/http';

//declare var $: any;

declare interface DataTable {
    headerRow: string[];
    footerRow: string[];
    dataRows: string[][];
}

@Component({
    selector: 'app-orders-cmp',
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.css']
})

export class OrdersComponent implements OnInit, OnDestroy {

    public dataTable: DataTable;
    config = new AppConfig()
    data: string[][] = []
    all_orders: TacOrder[] = []

    view = false
    currentOrder: TacOrder

    public dataTable1: DataTable;
    data1: string[][] = []

    current_status = ''
    status_note: string = ''
    order_status = ['pending', 'processing', 'shipped', 'completed', 'canceled']
    emailing = new EmailBody()

    ngOnDestroy() {

    }

    constructor(private previewProgressSpinner: OverlayService, private http: HttpClient) {
    }

    getOrders() {
        firebase.firestore().collection('orders').orderBy('timestamp', 'desc').onSnapshot(query => {
            this.data = []
            var index = 1
            query.forEach(async data => {
                const order = <TacOrder>data.data()
                this.all_orders.push(order)
                this.data.push([`${index}`, order.id, order.transaction_id, order.email, order.country, order.status, `${order.currency_used}${order.total_amount}`, order.created_date, 'btn-link'])
                index = index + 1
            })
            this.dataTable = {
                headerRow: ['ID', 'Order Id', 'Email', 'Country', 'Status', 'Total Amount', 'Created Date', 'Actions'],
                footerRow: ['ID', 'Order Id', 'Email', 'Country', 'Status', 'Total Amount', 'Created Date', 'Actions'],
                dataRows: this.data
            };
        });
    }

    getProductById(id: any) {
        return firebase.firestore().collection('db').doc('tacadmin').collection('products').doc(id).get()
    }

    ngOnInit() {
        this.getOrderByStatus('pending')
    }

    viewOrder(index: string) {
        this.view = true
        const fil = this.all_orders.filter((item, inde, arr) => {
            return item.id == index
        })
        this.currentOrder = fil[0]
        this.current_status = this.currentOrder.status.toLowerCase()

        //display products
        var _index = 1
        this.data1 = []
        this.currentOrder.carts.forEach(item => {
            this.data1.push([`${_index}`, item.product.pictures[0], item.product.name, `₦${item.product.price}`, `${item.quantity}`])//${this.currentOrder.currency_used}
            _index = _index + 1
        })
        this.dataTable1 = {
            headerRow: ['ID', 'Product Image', 'Product Name', 'Product Price', 'Product Quantity'],
            footerRow: ['ID', 'Product Image', 'Product Name', 'Product Price', 'Product Quantity'],
            dataRows: this.data1
        };
    }

    cancelView() {
        this.view = false
        this.current_status = ''
        this.status_note = ''
        this.currentOrder = null
        this.dataTable1 = null
    }

    statusButtonAction() {
        if (this.status_note == '') {
            this.config.displayMessage('Please enter status note', false)
            return
        }
        this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
        const name = `${this.currentOrder.shipping_details['firstname']}`
        const email_body = this.emailing.getStatusEmailBody(this.currentOrder.transaction_id, name, this.current_status, this.status_note)
        const tracking: Tracking[] = this.currentOrder.tracking_details
        tracking.push({
            icon: 'start',
            title: `Order ${this.current_status}`,
            text: this.status_note,
            time: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
        })
        firebase.firestore().collection('orders').doc(this.currentOrder.id).update({
            'status': this.current_status,
            'tracking_details': tracking
        }).then(done => {
            const current_email = localStorage.getItem('email')
            const current_name = localStorage.getItem('name')
            this.config.logActivity(`${current_name}|${current_email} updated the status of this product with order ID: ${this.currentOrder.transaction_id}`)

            const check = (<HTMLInputElement>document.getElementById("emailSend")).checked
            if (check) {
                const email = this.currentOrder.email
                const pd = this.previewProgressSpinner
                const cf = this.config
                $(function () {
                    $.ajax({
                        url: `https://avidprintsconcierge.com/emailsending/send.php?sender_email=${email}&sender_name=${name}`,
                        type: "post",
                        dataType: "html",
                        success: function (data) {
                            pd.close()
                            cf.displayMessage('Updated successfully', true)
                        },
                        error: function (err) {
                            pd.close()
                            cf.displayMessage('Updated successfully', true)
                        },
                        data: {
                            body: `${email_body}`
                        }
                    });
                });
            } else {
                this.previewProgressSpinner.close()
                this.config.displayMessage('Updated successfully', true)
            }
        }).catch(err => {
            this.previewProgressSpinner.close()
            this.config.displayMessage(`${err}`, false);
        })
    }

    getOrderByStatus(query: string) {
        if (query == 'all') {
            this.getOrders()
        } else {
            firebase.firestore().collection('orders').where("status", "==", query).orderBy('timestamp', 'desc').get().then(query => {
                this.data = []
                var index = 1
                query.forEach(async data => {
                    const order = <TacOrder>data.data()
                    this.all_orders.push(order)
                    this.data.push([`${index}`, order.id, order.transaction_id, order.email, order.country, order.status, `${order.currency_used}${order.total_amount}`, order.created_date, 'btn-link'])
                    index = index + 1
                })
                this.dataTable = {
                    headerRow: ['ID', 'Order Id', 'Email', 'Country', 'Status', 'Total Amount', 'Created Date', 'Actions'],
                    footerRow: ['ID', 'Order Id', 'Email', 'Country', 'Status', 'Total Amount', 'Created Date', 'Actions'],
                    dataRows: this.data
                };
            });
        }
    }

    // deleteRev(rev: any) {
    //     const id = `${rev[1]}`
    //     swal({
    //         title: 'Delete Alert',
    //         text: 'Are you sure about deleting this review?',
    //         type: 'warning',
    //         showCancelButton: true,
    //         confirmButtonText: 'Yes, delete it!',
    //         cancelButtonText: 'No, keep it',
    //         confirmButtonClass: "btn btn-success",
    //         cancelButtonClass: "btn btn-danger",
    //         buttonsStyling: false
    //     }).then((result) => {
    //         if (result.value) {
    //             firebase.firestore().collection('reviews').doc(id).delete().then(del => {
    //                 const current_email = localStorage.getItem('email')
    //                 const current_name = localStorage.getItem('name')
    //                 this.config.logActivity(`${current_name}|${current_email} deleted this review: ${rev[2]}`)
    //                 this.config.displayMessage("Successfully deleted", true);
    //             }).catch(err => {
    //                 this.config.displayMessage(`${err}`, false);
    //             })
    //         } else {
    //             swal({
    //                 title: 'Cancelled',
    //                 text: 'Deletion not successful',
    //                 type: 'error',
    //                 confirmButtonClass: "btn btn-info",
    //                 buttonsStyling: false
    //             }).catch(swal.noop)
    //         }
    //     })
    // }

    ngAfterViewInit() {
        //$.noConflict();
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