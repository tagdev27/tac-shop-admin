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
    selector: 'app-cartorders-cmp',
    templateUrl: 'cartorders.component.html',
    styleUrls: ['./cartorders.component.css']
})

export class CartComponent implements OnInit {

    public dataTable: DataTable;
    data: string[][] = []
    carts: CartItem[] = []
    config = new AppConfig()

    ngOnInit() {
        this.getUsers()
    }

    //@ViewChild('user', { static: false }) private userContainer: ElementRef;

    constructor(private modalService: NgbModal, private previewProgressSpinner: OverlayService) {
    }

    formatNumbers(curr: string, value: number) {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: (curr == '₦') ? 'NGN' : curr,
            minimumFractionDigits: 2
        })
        return formatter.format(value)
    }

    getUsers() {
        firebase.firestore().collection('products-in-cart').onSnapshot(query => {
            this.data = []
            // var data_index = 0
            var index = 1
            query.forEach(data => {
                const cart = <CartItem>data.data()
                const product = cart.product
                this.carts.push(cart)
                this.data.push([`${index}`, product.pictures[0], product.name, this.formatNumbers('₦', product.price), `${cart.quantity}`, cart.email, cart.country, cart.created_date])
                index = index + 1
                // data_index = data_index + 1
            })
            this.dataTable = {
                headerRow: ['ID', 'Product Image', 'Product Name', 'Product Price', 'Product Quantity', 'Email Address', 'Country', 'Created Date'],
                footerRow: ['ID', 'Product Image', 'Product Name', 'Product Price', 'Product Quantity', 'Email Address', 'Country', 'Created Date'],
                dataRows: this.data
            };
        });
    }

    // editUser(_id:any){
    //     console.log(_id)
    //     this.current_user = this.users[_id]
    //     this.blocked_value = `${this.users[_id].blocked}`
    //     this.open(this.userContainer, '', '')
    // }

    // userButtonAction() {
    //     this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
    //     firebase.firestore().collection('users').doc(this.current_user.id).update({
    //         'blocked': (this.blocked_value == 'true') ? true : false
    //     }).then(d => {
    //         this.previewProgressSpinner.close()
    //         this.modalService.dismissAll()
    //         this.config.displayMessage("User successfully updated.", true);
    //         this.blocked_value = ''
    //       }).catch(err => {
    //         this.previewProgressSpinner.close()
    //         this.config.displayMessage(`${err}`, false);
    //       })
    // }

    // open(content, type, modalDimension) {
    //     if (modalDimension === 'sm' && type === 'modal_mini') {
    //       this.modalService.open(content, { windowClass: 'modal-mini', size: 'sm', centered: true }).result.then((result) => {
    //         this.closeResult = 'Closed with: $result';
    //       }, (reason) => {
    //         this.closeResult = 'Dismissed $this.getDismissReason(reason)';
    //       });
    //     } else if (modalDimension === '' && type === 'Notification') {
    //       this.modalService.open(content, { windowClass: 'modal-danger', centered: true }).result.then((result) => {
    //         this.closeResult = 'Closed with: $result';
    //       }, (reason) => {
    //         this.closeResult = 'Dismissed $this.getDismissReason(reason)';
    //       });
    //     } else {
    //       this.modalService.open(content, { centered: true }).result.then((result) => {
    //         this.closeResult = 'Closed with: $result';
    //       }, (reason) => {
    //         this.closeResult = 'Dismissed $this.getDismissReason(reason)';
    //       });
    //     }
    //   }

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
