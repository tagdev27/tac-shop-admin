import { Component, OnInit } from '@angular/core';
import PerfectScrollbar from 'perfect-scrollbar';
import { AdminUsersService } from "../services/admin-users.service";
import { AdminUsers } from "../models/admin.users";
import * as firebase from "firebase";
import { Router } from '@angular/router';
import { timer } from 'rxjs';
import swal from 'sweetalert2';

declare const $: any;

//Metadata
export interface RouteInfo {
    path: string;
    title: string;
    type: string;
    icontype: string;
    access: boolean;
    collapse?: string;
    children?: ChildrenItems[];
}

export interface ChildrenItems {
    path: string;
    title: string;
    ab: string;
    type?: string;
}

//Menu Items
export const ROUTES: RouteInfo[] = [{
    path: '/dashboard',
    title: 'Dashboard',
    type: 'link',
    icontype: 'dashboard',
    access: true
}, {
    path: '/inventory',
    title: 'Inventory',
    type: 'sub',
    icontype: 'apps',
    collapse: 'inventory',
    access: false,
    children: [
        { path: 'category', title: 'Categories', ab: 'C' },
        { path: 'subcat', title: 'Sub Categories', ab: 'SC' },
        { path: 'items', title: 'Items', ab: 'I' },
        { path: 'basket', title: 'Gift Baskets', ab: 'GB' }
    ]
}, {
    path: '/sales',
    title: 'Sales',
    type: 'sub',
    icontype: 'content_paste',
    collapse: 'sales',
    access: false,
    children: [
        { path: 'orders', title: 'Paid Orders', ab: 'PO' },
        { path: 'catorders', title: 'Orders in Cart', ab: 'OC' },
        { path: 'invoice', title: 'Invoice', ab: 'I' },
        { path: 'report', title: 'Report', ab: 'R' }
    ]
}, {
    path: '/marketing',
    title: 'Marketing',
    type: 'sub',
    icontype: 'grid_on',
    collapse: 'marketing',
    access: false,
    children: [
        { path: 'banners', title: 'Banners', ab: 'B' },
        { path: 'newsletter', title: 'Newsletter', ab: 'N' }
    ]
}, {
    path: '/store',
    title: 'Store Settings',
    type: 'sub',
    icontype: 'place',
    collapse: 'store',
    access: false,
    children: [
        { path: 'tax', title: 'Tax', ab: 'T' },
        { path: 'currency', title: 'Currency', ab: 'C' },
        { path: 'about', title: 'About Store', ab: 'AS' },
        { path: 'payment', title: 'Payment', ab: 'P' }
    ]
}, {
    path: '/users',
    title: 'Users',
    type: 'link',
    icontype: 'widgets',
    access: false,

}, {
    path: '/logs',
    title: 'Logs',
    type: 'link',
    icontype: 'timeline',
    access: false,

}
];

@Component({
    selector: 'app-sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})

export class SidebarComponent implements OnInit {

    user: AdminUsers
    name: string = 'Username';
    image: string = './assets/img/default-avatar.png';
    role: string = 'user';
    access_level = '';
    service = new AdminUsersService();

    constructor(private router: Router) {
        this.getProfile();
    }

    getProfile() {
        const email = localStorage.getItem('email');
        this.service.getUserData(email).then(p => {
            if (p == null) {
                this.service.getUserData(email).then(q => {
                    this.name = q.name;
                    this.image = q.image;
                    this.role = q.role;
                    this.access_level = q.access_levels;
                    this.displayNav();
                })
            } else {
                this.name = p.name;
                this.image = p.image;
                this.role = p.role;
                this.access_level = p.access_levels;
                this.displayNav();
            }
        })
    }

    logout() {
        swal({
            title: 'Logout Alert',
            text: 'Are you sure about logging out?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, log me out!',
            cancelButtonText: 'No, keep me',
            confirmButtonClass: "btn btn-success",
            cancelButtonClass: "btn btn-danger",
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                firebase.auth().signOut();
                localStorage.clear();
                this.router.navigate(['/pages/login'])
            } else {
                swal({
                    title: 'Cancelled',
                    text: 'Logout not successful',
                    type: 'error',
                    confirmButtonClass: "btn btn-info",
                    buttonsStyling: false
                }).catch(swal.noop)
            }
        })
    }

    public menuItems: any[] = [];
    ps: any;

    isMobileMenu() {
        if ($(window).width() > 991) {
            return false;
        }
        return true;
    };

    displayNav() {
        ROUTES.forEach(menuItem => {
            if (menuItem.title == 'Dashboard') {
                this.menuItems.push(menuItem);
            } else {
                if (this.role == 'Administrator') {
                    menuItem.access = true;
                    this.menuItems.push(menuItem);
                } else {
                    menuItem.access = this.service.isAllowedAccess(this.access_level, menuItem.title);
                    this.menuItems.push(menuItem);
                }
            }
        })
    }

    ngOnInit() {
        //this.menuItems = ROUTES.filter(menuItem => menuItem);
        if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
            const elemSidebar = <HTMLElement>document.querySelector('.sidebar .sidebar-wrapper');
            this.ps = new PerfectScrollbar(elemSidebar);
        }
    }
    updatePS(): void {
        if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
            this.ps.update();
        }
    }
    isMac(): boolean {
        let bool = false;
        if (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0) {
            bool = true;
        }
        return bool;
    }
}
