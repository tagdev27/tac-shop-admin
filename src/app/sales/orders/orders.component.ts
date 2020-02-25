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
import { ExportAsService, ExportAsConfig } from 'ngx-export-as';

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

    constructor(private previewProgressSpinner: OverlayService, private exportAsService: ExportAsService) {
    }

    formatNumbers(curr: string, value: number) {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: (curr == '₦') ? 'NGN' : curr,
            minimumFractionDigits: 2
        })
        return formatter.format(value)
    }

    getOrders() {
        firebase.firestore().collection('orders').orderBy('timestamp', 'desc').onSnapshot(query => {
            this.data = []
            var index = 1
            query.forEach(async data => {
                const order = <TacOrder>data.data()
                this.all_orders.push(order)
                this.data.push([`${index}`, order.id, order.transaction_id, order.email, order.country, order.status, order.payment_status, this.formatNumbers(order.currency_used, order.total_amount), order.created_date, 'btn-link'])
                index = index + 1
            })
            this.dataTable = {
                headerRow: ['ID', 'Order Id', 'Email', 'Country', 'Status', 'Payment Status', 'Total Amount', 'Created Date', 'Actions'],
                footerRow: ['ID', 'Order Id', 'Email', 'Country', 'Status', 'Payment Status', 'Total Amount', 'Created Date', 'Actions'],
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
            this.data1.push([`${_index}`, item.product.pictures[0], item.product.name, this.formatNumbers('₦', item.product.price), `${item.quantity}`])//${this.currentOrder.currency_used}
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
            firebase.firestore().collection('orders').where("status", "==", query).orderBy('timestamp', 'desc').onSnapshot(query => {
                this.data = []
                var index = 1
                query.forEach(async data => {
                    const order = <TacOrder>data.data()
                    this.all_orders.push(order)
                    this.data.push([`${index}`, order.id, order.transaction_id, order.email, order.country, order.status, order.payment_status, this.formatNumbers(order.currency_used, order.total_amount), order.created_date, 'btn-link'])
                    index = index + 1
                })
                this.dataTable = {
                    headerRow: ['ID', 'Order Id', 'Email', 'Country', 'Status', 'Payment Status', 'Total Amount', 'Created Date', 'Actions'],
                    footerRow: ['ID', 'Order Id', 'Email', 'Country', 'Status', 'Payment Status', 'Total Amount', 'Created Date', 'Actions'],
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

    resendInvoice() {
        const order = this.currentOrder
        this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
        const curr = (order.currency_used == '₦') ? 'NGN' : order.currency_used
        //send email automaticatlly
        const billing_name = `${order.shipping_details['firstname']} ${order.shipping_details['lastname']}`

        const currency_total_amount = this.formatNumbers(curr, order.total_amount)//`${curr}${order.total_amount}`
        const trans_id = order.transaction_id

        const shipping_details = `${order.shipping_details['fullname']}
                          <br> ${order.shipping_details['address']}
                          <br> ${order.shipping_details['state']}, ${order.shipping_details['country']}<br>
                          Contact No. ${order.shipping_details['recipientphone']}`

        const currency_shipping_fee = `${curr}0.00`//${this.OtherDetailsPayment['delivery']}`
        const currency_tax_fee = `Tax Inclusive`//`${curr}${this.OtherDetailsPayment['tax']}`

        var cart_items = ''
        const exchangeR = order.conversion_rate

        // this.cartService.getItems().subscribe(mCart => {
        order.carts.forEach(cart => {
            const unit_price = this.formatNumbers(curr, (cart.product.price / exchangeR)) //${curr}${(cart.product.price / exchangeR).toFixed(2)}
            const sub_total_price = this.formatNumbers(curr, ((cart.product.price * cart.quantity) / exchangeR))//${curr}${((cart.product.price * cart.quantity) / exchangeR).toFixed(2)}
            cart_items += `<tr>
    <td width="50%"
        class="m_-7433457280851606022ordered-item-label-td m_-7433457280851606022product"
        style="padding-top:10px;padding-bottom:10px;border-top:1px solid #cccccc;border-bottom:1px solid #cccccc;font-family:arial;font-size:12px;color:#333333;border-collapse:collapse">
        ${cart.quantity} x ${cart.product.name} </td>
    <td align="right" width="25%"
        class="m_-7433457280851606022ordered-item-unit-price-td"
        style="padding-top:10px;padding-bottom:10px;border-top:1px solid #cccccc;border-bottom:1px solid #cccccc;font-family:arial;font-size:12px;color:#333333;border-collapse:collapse;text-align:right">
        ${unit_price}
    </td>
    <td align="right" width="25%"
        class="m_-7433457280851606022ordered-item-cost-td"
        style="padding-top:10px;padding-bottom:10px;border-top:1px solid #cccccc;border-bottom:1px solid #cccccc;font-family:arial;font-size:12px;color:#333333;border-collapse:collapse;text-align:right">
        ${sub_total_price}
    </td>
    </tr>`
        })
        // })
        const email_body = this.emailing.getInvoiceBody(order.created_date, billing_name, currency_total_amount, trans_id, shipping_details, currency_shipping_fee, currency_tax_fee, cart_items, `${order.track_id}`)
        const email = order.shipping_details['email']
        this.uploadPDFToFirebase(email_body, email, trans_id, billing_name, email_body)
    }

    async uploadPDFToFirebase(body: string, email: string, trans_id: string, billing_name: string, email_body: string): Promise<any> {
        const key = firebase.database().ref().push().key
        const pk = this.previewProgressSpinner
        const conf = this.config
        $("#thehtml").append(body)
        const exportAsConfig: ExportAsConfig = {
            type: 'pdf', // the type you want to download
            fileName: `${key}.pdf`,
            elementId: 'getbody', // the id of html/table element
        }
        this.exportAsService.get(exportAsConfig).subscribe(base => {
            const upload_task = firebase.storage().ref("invoices").child(`${key}.pdf`)
            this.exportAsService.contentToBlob(base).subscribe(async file => {
                const put = await upload_task.put(file)
                const url = await upload_task.getDownloadURL()
                firebase.firestore().collection('invoices').doc(key).set({
                    'id': key,
                    'email': email,
                    'invoice_id': trans_id,
                    'created_date': `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
                    'timestamp_date': firebase.firestore.FieldValue.serverTimestamp(),
                    'invoice_url': url
                }).then(done => {
                    $(function () {
                        $.ajax({
                            url: `https://avidprintsconcierge.com/emailsending/send.php?sender_email=${email}&sender_name=${billing_name}`,
                            type: "post",
                            dataType: "html",
                            success: function (data) {
                                pk.close()
                                conf.displayMessage(`Invoice successfully sent to: ${email}`, true)
                            },
                            error: function (err) {
                                pk.close()
                                conf.displayMessage(`Invoice successfully sent to: ${email}`, true)
                            },
                            data: {
                                body: `${email_body}`
                            }
                        });
                    });
                })
            })
        })
    }
}