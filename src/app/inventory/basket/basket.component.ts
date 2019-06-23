import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import * as firebase from "firebase";
import swal from 'sweetalert2';
import { AdminUsers } from "../../models/admin.users";
import { AdminUsersService } from "../../services/admin-users.service";
import { timer } from 'rxjs';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';

declare interface DataTable {
    headerRow: string[];
    footerRow: string[];
    dataRows: string[][];
}

@Component({
    selector: 'app-basket-cmp',
    templateUrl: './basket.component.html',
    styleUrls: ['./basket.component.css']
})

export class BasketComponent implements OnInit, OnDestroy {

    public dataTable: DataTable;

    ngOnDestroy() {

    }

    ngOnInit() {

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