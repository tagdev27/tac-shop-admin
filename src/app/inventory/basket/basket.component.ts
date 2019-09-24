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
import { DateAdapter } from '@angular/material';
import { OverlayService } from '../../overlay/overlay.module';
import { ProgressSpinnerComponent } from '../../progress-spinner/progress-spinner.module';

import { Product, Item, ProductColor, ProductSize, ProductTags } from "src/app/models/product";
import { AppConfig } from "src/app/services/global.service";
import { MainCategory } from 'src/app/models/main.category';
import { SubCategory } from 'src/app/models/sub.category';
import { Items } from 'src/app/models/items';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ClipboardService } from 'ngx-clipboard'

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

    constructor(private previewProgressSpinner: OverlayService, private http: HttpClient, private toast:ToastrService, private clip:ClipboardService) { }

    public dataTable: DataTable;
    config = new AppConfig()
    data: string[][] = []
    products: Product[] = []
    main_categories: MainCategory[] = []
    sub_categories: SubCategory[] = []
    items: Items[] = []

    addNewPro = false
    editPro = false
    currentProRow: Product

    selectedProduct: Product
    isDeletedView = false

    ///////////////////////
    basket_image = './assets/img/image_placeholder.jpg'
    basket_name = ''
    basket_price = 0
    basket_sale_price = 0
    basket_discount = 0
    basket_short_desc = ''
    basket_full_desc = ''
    basket_stock = 0
    basket_new = ''
    basket_sale = 'false'
    basket_category: string[] = []
    basket_colors: string[] = ['red', 'green', 'blue']
    basket_sizes: string[] = ['M', 'L', 'XL']
    basket_tags: string[] = ['wine', 'basket', 'gift']
    basket_items: Item[] = []
    basket_weight = 0
    basket_sale_start_date = ''
    basket_sale_end_date = ''
    basket_dynamic_link = ''

    tag_items: Item[] = []

    true_false_data = [
        { value: 'false', viewValue: 'False' },
        { value: 'true', viewValue: 'True' },
    ]
    ///////////////////////

    getDiscount() {
        return ((this.basket_price - this.basket_sale_price) * 100) / this.basket_sale_price
    }

    clearField() {
        this.basket_image = './assets/img/image_placeholder.jpg'
        this.basket_name = ''
        this.basket_price = 0
        this.basket_sale_price = 0
        this.basket_discount = 0
        this.basket_short_desc = ''
        this.basket_full_desc = ''
        this.basket_stock = 0
        this.basket_new = ''
        this.basket_sale = 'false'
        this.basket_category = []
        this.basket_colors = ['red', 'green', 'blue']
        this.basket_sizes = ['M', 'L', 'XL']
        this.basket_tags = ['wine', 'basket', 'gift']
        this.basket_items = []
        this.basket_weight = 0
        this.basket_sale_start_date = ''
        this.basket_sale_end_date = ''
        this.basket_dynamic_link = ''
    }

    ngOnDestroy() {

    }

    ngOnInit() {
        this.getProducts()
        this.getMainCategories()
        this.getSubCategoriesByID()
        this.getItems()
    }

    addPro() {
        this.addNewPro = true
        //this.addNewCat2 = true
    }

    cancelAddPro() {
        this.addNewPro = false
        //this.addNewCat2 = false
        this.editPro = false
        this.clearField()
    }

    getProducts() {
        this.isDeletedView = false
        firebase.firestore().collection('db').doc('tacadmin').collection('products').where("deleted", "==", false).onSnapshot(query => {
            this.data = []
            this.products = []
            var index = 0
            query.forEach(data => {
                const pro = <Product>data.data()
                this.products.push(pro)
                this.data.push([`${index}`, pro.pictures[0], pro.name, `₦${pro.price}`, `${pro.stock}`, pro.created_date, pro.modified_date, 'btn-link', pro.dynamic_link])
                index = index + 1
            })
            this.dataTable = {
                headerRow: ['Image', 'Name', 'Price', 'Stock', 'Created Date', 'Modified Date', 'Actions'],
                footerRow: ['Image', 'Name', 'Price', 'Stock', 'Created Date', 'Modified Date', 'Actions'],
                dataRows: this.data
            };
        });
    }

    getDeletedProducts() {
        this.isDeletedView = true
        firebase.firestore().collection('db').doc('tacadmin').collection('products').where("deleted", "==", true).onSnapshot(query => {
            this.data = []
            this.products = []
            var index = 0
            query.forEach(data => {
                const pro = <Product>data.data()
                this.products.push(pro)
                this.data.push([`${index}`, pro.pictures[0], pro.name, `₦${pro.price}`, `${pro.stock}`, pro.created_date, pro.modified_date, 'btn-link'])
                index = index + 1
            })
            this.dataTable = {
                headerRow: ['Image', 'Name', 'Price', 'Stock', 'Created Date', 'Modified Date', 'Actions'],
                footerRow: ['Image', 'Name', 'Price', 'Stock', 'Created Date', 'Modified Date', 'Actions'],
                dataRows: this.data
            };
        });
    }

    getMainCategories() {
        firebase.firestore().collection('db').doc('tacadmin').collection('main-categories').where("deleted", "==", false).onSnapshot(query => {
            this.main_categories = []
            var index = 0
            query.forEach(data => {
                const category = <MainCategory>data.data()
                this.main_categories.push(category)
            })
        });
    }

    getItems() {
        firebase.firestore().collection('db').doc('tacadmin').collection('items').where("deleted", "==", false).onSnapshot(query => {
            this.items = []
            var index = 0
            query.forEach(data => {
                const it = <Items>data.data()
                this.tag_items.push({ display: it.name, value: it.image, id: it.id })
                this.items.push(it)
            })
        });
    }

    getSubCategoriesByID() {//main_cat_id:string .where("main_category_id", "==", main_cat_id)
        firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').where("deleted", "==", false).onSnapshot(query => {
            this.sub_categories = []
            var index = 0
            query.forEach(data => {
                const category = <SubCategory>data.data()
                this.sub_categories.push(category)
            })
        });
    }

    async getMainCategoryNameFromId(id: string) {
        const mainData: firebase.firestore.DocumentSnapshot = await firebase.firestore().collection('db').doc('tacadmin').collection('main-categories').doc(id).get()
        return <MainCategory>mainData.data()
    }

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    async productSubmitClicked() {
        const image = (<HTMLInputElement>document.getElementById("pro_images")).files
        if (this.basket_name == '' || this.basket_price == 0 || this.basket_short_desc == '' || this.basket_full_desc == '' || this.basket_stock == 0 || this.basket_new == '' || this.basket_sale == '' || this.basket_category.length == 0 ) {//|| this.basket_items.length == 0
            this.config.displayMessage("All fields marked with * are required", false)
            return
        }
        this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
        if (!this.editPro) {//new add
            if (this.basket_image == '' || image.length == 0) {
                this.config.displayMessage("Please upload an image for this gift basket", false)
                return
            }
            const key = firebase.database().ref().push().key
            const upload_task = firebase.storage().ref("product").child(`${key}.jpg`)
            upload_task.put(image.item(0)).then(task => {
                const key = firebase.database().ref().push().key
                const id = this.randomInt(0, 9999999999)
                const current_email = localStorage.getItem('email')
                const current_name = localStorage.getItem('name')
                upload_task.getDownloadURL().then(async url => {
                    const dynamic_link = await this.createDynamicLink(`https://tacgifts.com/home/left-sidebar/product/${id}`, url)
                    const product: Product = {
                        id: id,
                        key: key,
                        name: this.basket_name,
                        price: (this.basket_sale == 'true') ? this.basket_sale_price : this.basket_price,
                        salePrice: (this.basket_sale == 'true') ? this.basket_price : this.basket_sale_price,
                        discount: this.basket_discount,
                        pictures: [url],
                        shortDetails: this.basket_short_desc,
                        description: this.basket_full_desc,
                        stock: this.basket_stock,
                        new: (this.basket_new == 'true') ? true : false,
                        sale: (this.basket_sale == 'true') ? true : false,
                        category: this.basket_category.join(','),
                        colors: this.basket_colors,
                        size: this.basket_sizes,
                        tags: this.basket_tags,
                        variants: [],
                        items: this.basket_items,
                        scheduled_sales_period: `${this.basket_sale_start_date}-${this.basket_sale_end_date}`,
                        weight: this.basket_weight,
                        created_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
                        created_by: `${current_name}|${current_email}`,
                        deleted: false,
                        modified_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
                        menu_link: `/product/${id}`,
                        dynamic_link: dynamic_link['shortLink'],
                        rating: 5.0,
                        merchant: 'tac'
                    }
                    firebase.firestore().collection('db').doc('tacadmin').collection('products').doc(key).set(product).then(d => {
                        this.config.logActivity(`${current_name}|${current_email} created this product: ${this.basket_name}`)
                        this.previewProgressSpinner.close()
                        this.config.displayMessage(`Product created successfully.`, true);
                        this.addNewPro = false
                        this.editPro = false
                        this.clearField()
                    }).catch(err => {
                        this.previewProgressSpinner.close()
                        this.config.displayMessage(`${err}`, false);
                    })
                }).catch(err => {
                    this.previewProgressSpinner.close()
                    this.config.displayMessage(`${err}`, false);
                })
            }).catch(err => {
                this.previewProgressSpinner.close()
                this.config.displayMessage(`${err}`, false);
            })
        } else {//update
            var image_url = this.basket_image
            if (image.length > 0) {
                const key = firebase.database().ref().push().key
                const upload_task = firebase.storage().ref("product").child(`${key}.jpg`)
                upload_task.put(image.item(0)).then(task => {
                    upload_task.getDownloadURL().then(async url => {
                        image_url = url
                        const dynamic_link = await this.createDynamicLink(`https://tacgifts.com/home/left-sidebar/product/${this.currentProRow.id}`, image_url)
                        this.updateValues(image_url, dynamic_link['shortLink'])
                    }).catch(err => {
                        this.previewProgressSpinner.close()
                        this.config.displayMessage(`${err}`, false);
                    })
                }).catch(err => {
                    this.previewProgressSpinner.close()
                    this.config.displayMessage(`${err}`, false);
                })
            } else {
                const dynamic_link = await this.createDynamicLink(`https://tacgifts.com/home/left-sidebar/product/${this.currentProRow.id}`, image_url)
                this.updateValues(image_url, dynamic_link['shortLink'])
            }
        }

    }

    updateValues(image_url: string, dynamic_link:string) {
        const product: Product = {
            name: this.basket_name,
            price: (this.basket_sale == 'true') ? this.basket_sale_price : this.basket_price,
            salePrice: (this.basket_sale == 'true') ? this.basket_price : this.basket_sale_price,
            discount: this.basket_discount,
            pictures: [image_url],
            shortDetails: this.basket_short_desc,
            description: this.basket_full_desc,
            stock: this.basket_stock,
            new: (this.basket_new == 'true') ? true : false,
            sale: (this.basket_sale == 'true') ? true : false,
            category: this.basket_category.join(","),
            colors: this.basket_colors,
            size: this.basket_sizes,
            tags: this.basket_tags,
            variants: [],
            items: this.basket_items,
            scheduled_sales_period: `${this.basket_sale_start_date}-${this.basket_sale_end_date}`,
            weight: this.basket_weight,
            modified_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
        }
        const current_email = localStorage.getItem('email')
        const current_name = localStorage.getItem('name')
        firebase.firestore().collection('db').doc('tacadmin').collection('products').doc(this.currentProRow.key).update(product).then(d => {
            this.config.logActivity(`${current_name}|${current_email} updated this product: ${this.basket_name}`)
            this.previewProgressSpinner.close()
            this.config.displayMessage(`Product updated successfully.`, true);
            this.addNewPro = false
            this.editPro = false
            this.clearField()
        }).catch(err => {
            this.previewProgressSpinner.close()
            this.config.displayMessage(`${err}`, false);
        })
    }

    restoreProClick(_id: any) {
        const id = `${this.products[_id].id}`
        const name = `${this.products[_id].name}`
        swal({
            title: 'Restore Alert',
            text: 'Are you sure about restoring this product?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, restore it!',
            cancelButtonText: 'No, keep it',
            confirmButtonClass: "btn btn-success",
            cancelButtonClass: "btn btn-danger",
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                firebase.firestore().collection('db').doc('tacadmin').collection('products').doc(id).update({ 'deleted': false }).then(del => {
                    const current_email = localStorage.getItem('email')
                    const current_name = localStorage.getItem('name')
                    this.config.logActivity(`${current_name}|${current_email} restored this product: ${name}`)
                    this.config.displayMessage("Successfully restored", true);
                }).catch(err => {
                    this.config.displayMessage(`${err}`, false);
                })
            } else {
                swal({
                    title: 'Cancelled',
                    text: 'Restoration not successful',
                    type: 'error',
                    confirmButtonClass: "btn btn-info",
                    buttonsStyling: false
                }).catch(swal.noop)
            }
        })
    }

    deletePro(_id: any) {
        const id = `${this.products[_id].id}`
        const name = `${this.products[_id].name}`
        swal({
            title: 'Delete Alert',
            text: 'Are you sure about deleting this product?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
            confirmButtonClass: "btn btn-success",
            cancelButtonClass: "btn btn-danger",
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                firebase.firestore().collection('db').doc('tacadmin').collection('products').doc(id).update({ 'deleted': true }).then(del => {
                    const current_email = localStorage.getItem('email')
                    const current_name = localStorage.getItem('name')
                    this.config.logActivity(`${current_name}|${current_email} deleted this product: ${name}`)
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

    copyLink(_id:any){
        const link = `${this.products[_id].dynamic_link}`
        this.clip.copyFromContent(link)
        this.config.displayMessage(`${link} copied to clipboard`, true)
        //this.toast.success('Link copied to clipboard')
        // ngxClipboard [cbContent]="row[8]" (cbOnSuccess)="isCopied = true"
    }

    editProClick(_id: any) {
        this.editPro = true
        this.addNewPro = true
        this.currentProRow = this.products[_id]
        //////fill in fields///////////////////
        this.basket_image = this.currentProRow.pictures[0]
        this.basket_name = this.currentProRow.name
        this.basket_price = this.currentProRow.price
        this.basket_sale_price = this.currentProRow.salePrice
        this.basket_discount = this.currentProRow.discount
        this.basket_short_desc = this.currentProRow.shortDetails
        this.basket_full_desc = this.currentProRow.description
        this.basket_stock = this.currentProRow.stock
        this.basket_new = (this.currentProRow.new) ? 'true' : 'false'
        this.basket_sale = (this.currentProRow.sale) ? 'true' : 'false'
        this.basket_category = this.currentProRow.category.split(",")
        this.basket_colors = this.currentProRow.colors
        this.basket_sizes = this.currentProRow.size
        this.basket_tags = this.currentProRow.tags
        this.basket_items = this.currentProRow.items
        this.basket_weight = this.currentProRow.weight
        //console.log(this.currentProRow.scheduled_sales_period.split('-')[0])
        this.basket_sale_start_date = this.currentProRow.scheduled_sales_period.split('-')[0]
        this.basket_sale_end_date = this.currentProRow.scheduled_sales_period.split('-')[1]
        this.basket_dynamic_link = this.currentProRow.dynamic_link
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
        //$('').modal()
        $('.card .material-datatables label').addClass('form-group');
    }

    createDynamicLink(product_link: string, image_url: string) {
        const options = {
            "dynamicLinkInfo": {
                "domainUriPrefix": "tacgifts.page.link",
                "link": product_link,
                "navigationInfo": {
                    "enableForcedRedirect": true,
                },
                "socialMetaTagInfo": {
                    "socialTitle": this.basket_name,
                    "socialDescription": this.basket_full_desc,
                    "socialImageLink": image_url
                },
                "androidInfo": {
                    "androidPackageName": "com.taconline.giftshop"
                },
                "iosInfo": {
                    "iosBundleId": "com.taconline.giftshop"
                }
            },
            "suffix": {
                "option": "SHORT"
            }
        }
        return this.http.post("https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyAu77RE_S5__DnrmaR1LKJvqtNNyR0mSzo", options, { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }).toPromise()
    }
}