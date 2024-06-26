import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import * as firebase from "firebase";
import swal from 'sweetalert2';
import { SubCategory } from "../../models/sub.category";
import { MainCategory } from "../../models/main.category";
import { Router } from '@angular/router';
import { OverlayService } from '../../overlay/overlay.module';
import { ProgressSpinnerComponent } from '../../progress-spinner/progress-spinner.module';
import { AppConfig } from "../../services/global.service";
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import { Product } from 'src/app/models/product';

//declare var $: any;

declare interface DataTable {
    headerRow: string[];
    footerRow: string[];
    dataRows: string[][];
}

@Component({
    selector: 'app-subcat-cmp',
    templateUrl: './subcat.component.html',
    styleUrls: ['./subcat.component.css']
})

export class SubCatComponent implements OnInit, OnDestroy {

    public dataTable: DataTable;
    config = new AppConfig()
    data: string[][] = []
    categories: SubCategory[] = []
    main_categories: MainCategory[] = []

    newMainCategory = ''
    editMainCategory = ''

    addNewCat = false
    addNewCat2 = false
    editCat = false
    currentCatRow: any

    selectedCategory: SubCategory
    isDeletedView = false

    ngOnDestroy() {

    }

    constructor(private previewProgressSpinner: OverlayService) {
        //this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
        // this.dataTable = {
        //     headerRow: ['Image', 'Name', 'Description', 'Main Category', 'Created Date', 'Modified Date', 'Actions'],
        //     footerRow: ['Image', 'Name', 'Description', 'Main Category', 'Created Date', 'Modified Date', 'Actions'],
        //     dataRows: this.data
        // };
    }

    async getMainCategoryNameFromId(id: string) {
        const mainData: firebase.firestore.DocumentSnapshot = await firebase.firestore().collection('db').doc('tacadmin').collection('main-categories').doc(id).get()
        return <MainCategory>mainData.data()
    }

    // doUpdatesOnDB() {
    //     firebase.firestore().collection('db').doc('tacadmin').collection('products').get().then(query => {
    //         var index = 0
    //         query.forEach(async dt => {
    //             const pro = <Product>dt.data()
    //             let re = /\ /gi;
    //             const url_path_name = pro.name.toLowerCase().replace(re, '-')
    //             await firebase.firestore().collection('db').doc('tacadmin').collection('products').doc(pro.key).update({'menu_link':url_path_name})
    //             // index = index + 1
    //             // if(index == query.size){
    //             //     console.log('all done')
    //             // }
    //         })
    //     })
    // }

    getCategories() {
        this.isDeletedView = false
        firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').onSnapshot(query => {
            this.data = []
            this.categories = []
            var index = 1
            query.forEach(async data => {
                const category = <SubCategory>data.data()
                this.categories.push(category)
                if (!category.deleted) {
                    const getMId = await this.getMainCategoryNameFromId(category.main_category_id);
                    this.data.push([`${index}`, category.id, category.name, category.description, getMId.name, category.created_date, category.created_by, category.image, `${category.deleted}`, category.meta, category.modified_date, category.link, 'btn-link'])
                }
                index = index + 1
            })
            this.dataTable = {
                headerRow: ['ID', 'Image', 'Name', 'Description', 'Main Category', 'Created Date', 'Modified Date', 'Actions'],
                footerRow: ['ID', 'Image', 'Name', 'Description', 'Main Category', 'Created Date', 'Modified Date', 'Actions'],
                dataRows: this.data
            };
        });
    }

    getDeletedCategories() {
        this.isDeletedView = true
        firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').onSnapshot(query => {
            this.data = []
            this.categories = []
            var index = 1
            query.forEach(async data => {
                const category = <SubCategory>data.data()
                this.categories.push(category)
                if (category.deleted) {
                    const getMId = await this.getMainCategoryNameFromId(category.main_category_id);
                    this.data.push([`${index}`, category.id, category.name, category.description, getMId.name, category.created_date, category.created_by, category.image, `${category.deleted}`, category.meta, category.modified_date, category.link, 'btn-link'])
                }
                index = index + 1
            })
            this.dataTable = {
                headerRow: ['ID', 'Image', 'Name', 'Description', 'Main Category', 'Created Date', 'Modified Date', 'Actions'],
                footerRow: ['ID', 'Image', 'Name', 'Description', 'Main Category', 'Created Date', 'Modified Date', 'Actions'],
                dataRows: this.data
            };
        });
    }

    getMainCategories() {
        firebase.firestore().collection('db').doc('tacadmin').collection('main-categories').get().then(query => {
            this.main_categories = []
            var index = 0
            query.forEach(data => {
                const category = <MainCategory>data.data()
                if (!category.deleted) {
                    this.main_categories.push(category)
                }
            })
        });
    }

    ngOnInit() {
        this.getCategories()
        this.getMainCategories()
    }

    addCat() {
        this.addNewCat = true
        this.addNewCat2 = true
    }

    cancelAddCat() {
        this.addNewCat = false
        this.addNewCat2 = false
        this.editCat = false
        this.jqueryDataTable()
    }

    categorySubmitClicked() {
        const name = (<HTMLInputElement>document.getElementById("cat_name")).value;
        const desc = (<HTMLInputElement>document.getElementById("cat_desc")).value;
        const meta = (<HTMLInputElement>document.getElementById("cat_meta")).value;
        const image = (<HTMLInputElement>document.getElementById("cat_image")).files

        if (name == '' || meta == '' || this.newMainCategory == '') {
            this.config.displayMessage("Please enter all fields", false)
            return
        }

        const len = name.length
        if (name.substring(len - 1) == ' ') {
            this.config.displayMessage("Please remove all trailing whitespaces in name field", false)
            return
        }

        if (image.item(0).size > 204800) {
            this.config.displayMessage("Size of image must not be greater than 200KB.", false)
            return
        }

        const mc = this.newMainCategory
        const selectedMain = this.main_categories.filter(function (item, index, array) {
            return item.name == mc
        })

        this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent)
        const key = firebase.database().ref().push().key
        if (image.length > 0) {
            const upload_task = firebase.storage().ref("sub-category").child(`${key}.jpg`)//image.item(0).name

            upload_task.put(image.item(0)).then(task => {
                upload_task.getDownloadURL().then(url => {
                    this.uploadCatData(selectedMain, url, desc, meta, name)
                }).catch(err => {
                    this.previewProgressSpinner.close()
                    this.config.displayMessage(`${err}`, false);
                })
            }).catch(err => {
                this.previewProgressSpinner.close()
                this.config.displayMessage(`${err}`, false);
            })
        } else {
            this.uploadCatData(selectedMain, 'https://tacadmin.firebaseapp.com/assets/img/image_placeholder.jpg', desc, meta, name)
        }
    }

    uploadCatData(selectedMain: MainCategory[], url: string, desc: string, meta: string, name: string) {
        const key = firebase.database().ref().push().key
        const current_email = localStorage.getItem('email')
        const current_name = localStorage.getItem('name')
        let re = /\ /gi;
        const re2 = /\'/gi;
        const re3 = /\//gi;
        const url_path_name = name.toLowerCase().replace(re, '-').replace(re2, '').replace(re3, '-')
        const category: SubCategory = {
            id: key,
            main_category_id: selectedMain[0].id,
            name: name,
            description: desc,
            created_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
            created_by: `${current_name}|${current_email}`,
            image: url,
            deleted: false,
            meta: meta,
            modified_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
            link: url_path_name,
            merchant: 'tac'
        }
        firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').doc(key).set(category).then(d => {
            this.config.logActivity(`${current_name}|${current_email} created this sub-category: ${name}`)
            this.previewProgressSpinner.close()
            this.config.displayMessage(`Sub-Category created successfully.`, true);
            this.addNewCat = false
            this.addNewCat2 = false
            this.editCat = false
        }).catch(err => {
            this.previewProgressSpinner.close()
            this.config.displayMessage(`${err}`, false);
        })
    }

    restoreCatClick(cat: any) {
        const id = `${cat[1]}`
        swal({
            title: 'Restore Alert',
            text: 'Are you sure about restoring this sub-category?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, restore it!',
            cancelButtonText: 'No, keep it',
            confirmButtonClass: "btn btn-success",
            cancelButtonClass: "btn btn-danger",
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').doc(id).update({ 'deleted': false }).then(del => {
                    const current_email = localStorage.getItem('email')
                    const current_name = localStorage.getItem('name')
                    this.config.logActivity(`${current_name}|${current_email} restored this sub-category: ${cat[1]}`)
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

    deleteCat(cat: any) {
        const id = `${cat[1]}`
        swal({
            title: 'Delete Alert',
            text: 'Are you sure about deleting this sub-category?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
            confirmButtonClass: "btn btn-success",
            cancelButtonClass: "btn btn-danger",
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').doc(id).update({ 'deleted': true }).then(del => {
                    const current_email = localStorage.getItem('email')
                    const current_name = localStorage.getItem('name')
                    this.config.logActivity(`${current_name}|${current_email} deleted this sub-category: ${cat[1]}`)
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

    editCatClick(cat: any) {
        this.editCat = true
        this.addNewCat = true
        this.addNewCat2 = false
        this.editMainCategory = cat[4]
        this.currentCatRow = cat
    }

    categoryUpdateClicked() {
        const name = (<HTMLInputElement>document.getElementById("ucat_name")).value;
        const desc = (<HTMLInputElement>document.getElementById("ucat_desc")).value;
        const meta = (<HTMLInputElement>document.getElementById("ucat_meta")).value;
        const image = (<HTMLInputElement>document.getElementById("ucat_image")).files

        if (name == '' || meta == '') {
            this.config.displayMessage("Please enter all fields and select an image", false)
            return
        }

        const len = name.length
        if (name.substring(len - 1) == ' ') {
            this.config.displayMessage("Please remove all trailing whitespaces in name field", false)
            return
        }

        if (name == `${this.currentCatRow[2]}` && desc == `${this.currentCatRow[3]}` && meta == `${this.currentCatRow[9]}` && image.length == 0 && this.editMainCategory == `${this.currentCatRow[4]}`) {
            this.addNewCat = false
            this.addNewCat2 = false
            this.editCat = false
            return
        }

        const mc = this.editMainCategory
        const selectedMain = this.main_categories.filter(function (item, index, array) {
            return item.name == mc
        })

        let re = /\ /gi;
        const re2 = /\'/gi;
        const re3 = /\//gi;
        const url_path_name = name.toLowerCase().replace(re, '-').replace(re2, '').replace(re3, '-')

        if (image.length == 0) {
            this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent)
            const key = this.currentCatRow[1]
            const current_email = localStorage.getItem('email')
            const current_name = localStorage.getItem('name')

            firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').doc(key).update({
                'name': name,
                'main_category_id': selectedMain[0].id,
                'description': desc,
                'meta': meta,
                'modified_date': `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
                'link': url_path_name
            }).then(d => {
                this.config.logActivity(`${current_name}|${current_email} updated this sub-category: ${name}`)
                this.previewProgressSpinner.close()
                this.config.displayMessage(`Sub-Category updated successfully.`, true);
                this.addNewCat = false
                this.addNewCat2 = false
                this.editCat = false
            }).catch(err => {
                this.previewProgressSpinner.close()
                this.config.displayMessage(`${err}`, false);
            })
            return
        }

        if (image.item(0).size > 204800) {
            this.config.displayMessage("Size of image must not be greater than 200KB.", false)
            return
        }

        this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent)


        const key = firebase.database().ref().push().key
        const upload_task = firebase.storage().ref("sub-category").child(`${key}.jpg`)

        upload_task.put(image.item(0)).then(task => {
            const key = this.currentCatRow[1]
            const current_email = localStorage.getItem('email')
            const current_name = localStorage.getItem('name')
            upload_task.getDownloadURL().then(url => {
                firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').doc(key).update({
                    'name': name,
                    'main_category_id': selectedMain[0].id,
                    'description': desc,
                    'image': url,
                    'meta': meta,
                    'modified_date': `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
                    'link': url_path_name
                }).then(d => {
                    this.config.logActivity(`${current_name}|${current_email} updated this sub-category: ${name}`)
                    this.previewProgressSpinner.close()
                    this.config.displayMessage(`Sub-Category updated successfully.`, true);
                    this.addNewCat = false
                    this.addNewCat2 = false
                    this.editCat = false
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
    }

    ngAfterViewInit() {
        this.jqueryDataTable()
    }

    jqueryDataTable() {
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

        // Edit record
        // table.on('click', '.edit', function (e) {
        //     let $tr = $(this).closest('tr');
        //     if ($($tr).hasClass('child')) {
        //         $tr = $tr.prev('.parent');
        //     }

        //     var data = table.row($tr).data();
        //     alert('You press on Row: ' + data[0] + ' ' + data[1] + ' ' + data[2] + '\'s row.');
        //     e.preventDefault();
        // });

        // // Delete a record
        // table.on('click', '.remove', function (e) {
        //     const $tr = $(this).closest('tr');
        //     table.row($tr).remove().draw();
        //     e.preventDefault();
        // });

        // //Like record
        // table.on('click', '.like', function (e) {
        //     alert('You clicked on Like button');
        //     e.preventDefault();
        // });

        $('.card .material-datatables label').addClass('form-group');
    }
}