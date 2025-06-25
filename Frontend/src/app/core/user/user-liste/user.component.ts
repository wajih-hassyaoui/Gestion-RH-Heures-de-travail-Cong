import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import swal from 'sweetalert2';
import { ConfirmDialogModel,ConfirmationDialogComponent } from 'src/app/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DataService } from 'src/app/services/data.service';
import { PosteService } from '../../poste/posteService/poste.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { UserService } from '../userService/user.service';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { AddUserComponent } from '../add-user/add-user.component';
import { environment } from 'src/environments/environment';
import { TokenService } from 'src/app/authentification/AuthServices/token.service';
import { DepartmentService } from '../../Department/DepartmentService/department.service';
import { TeamService } from '../../team/teamService/team.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';


@Component({
  selector: 'app-proc',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  @ViewChild(MatSort, { static: false })
  sort!: MatSort; // Keep this single declaration and remove the duplicate
  @ViewChild(MatPaginator, { static: false })
  paginator!: MatPaginator;
  displayedColumns: string[] = ['fullName', 'email', 'telephone','role','department','Action' ];
  action:any;
  dataSource = new MatTableDataSource<any>();
  isShow: boolean = false;
  isupShow: boolean = true;
  apiURL = environment.apiUrl+"/";
  searchForm!: FormGroup;
  isShowAction:boolean=true
  listRole=[{id:3,roleName:"manager"},{id:4,roleName:"collaborator"}];
  list: Array<any> = [];
  departmentOptions: { value: number, label: string }[] = [];
  posteOptions: { value: number, label: string }[] = [];
  teamOptions: { value: number, label: string }[] = [];
  isshowSearchSup:boolean=true;
  isshowSearchadmin:boolean=true;
  isshowAddManager:boolean=true;
  isshowSearchmanager:boolean=true;

  constructor(
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private UserService: UserService,
    private router: Router,
    private notificationService: NotificationService,
    private dataService: DataService,private localStorageRole:TokenService,private departmentService:DepartmentService,private posteService:PosteService,private teamService:TeamService,private cdRef: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.getAllUsers()
    this.fetchDepartmentOptions();
    this.fetchPosteOptions();
    this.showAction();
    this.fetchTeamOptions();
    this.showSearchSup();
    this.showSearchadmin();
    this.showSearchmanager();
    this.showAddManager();
    this.updateView();
    this.searchForm =  new FormGroup({
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      email: new FormControl('' ),
      departmentId: new FormControl(''),
      posteId: new FormControl(''),
      teamId: new FormControl(''),
      roleId: new FormControl('')
     })
}
ngAfterViewInit() {
  this.dataSource.paginator = this.paginator;
  this.dataSource.sort = this.sort;
}
onSubmitsearch()
{
  console.log(this.searchForm.value)
 this.UserService.getuserSearch(this.searchForm.value).subscribe((data: any) => {
   this.dataSource = data;
 });

}
 showSearchmanager(){
  if(this.localStorageRole.getRole()=='manager' ){

    this.isshowSearchmanager=false

  }else{

    this.isshowSearchSup=true
  }
 }
 showSearchSup(){
  if(this.localStorageRole.getRole()=='superadmin' ){

    this.isshowSearchSup=false


  }else{

    this.isshowSearchSup=true
  }
 }
 showSearchadmin(){
  if(this.localStorageRole.getRole()=='admin' ){

    this.isshowSearchadmin=false


  }else{

    this.isshowSearchadmin=true
  }
 }
 showAddManager(){
  if(this.localStorageRole.getRole()=='manager' ){

    this.isshowAddManager=false

  }else{

    this.isshowAddManager=true
  }
 }
 updateView() {
  this.cdRef.detectChanges();
}
 showAction():void{
  if(this.localStorageRole.getRole()=='manager' || this.localStorageRole.getRole()=='collaborator' ){

    this.isShowAction=false
   this.displayedColumns = ['fullName', 'email', 'telephone','role','department', ];
  }else{

    this.isShowAction=true
  }

}
  previousSearch()
  {
    this.isShow = !this.isShow;
    this.isupShow = !this.isupShow;
    this.isshowSearchmanager;
    this.isshowSearchSup
    this.isshowSearchadmin
   }
onreset() {
  this.searchForm.reset();
  this.getAllUsers()
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  fetchPosteOptions() {
    this.posteService.getAllpostes().subscribe(
       (data: any) => {

         this.posteOptions= data.map((item: { id: Number; posteName: String; }) => ({ value: item.id, label: item.posteName }));;
       },
       (error) => {
         console.error('Error fetching options:', error);
       }
     );
   }
   fetchTeamOptions() {
    this.teamService.getAllTeams().subscribe(
       (data: any) => {

         this.teamOptions= data.map((item: { teamId: Number; teamName: String; }) => ({ value: item.teamId, label: item.teamName }));;
       },
       (error) => {
         console.error('Error fetching options:', error);
       }
     );
   }
   fetchDepartmentOptions() {
    this.departmentService.getAllDempartments().subscribe(
       (data: any) => {
         this.departmentOptions = data.map((item: { departmentId: Number; departmentName: String; }) => ({ value: item.departmentId, label: item.departmentName }));;
       },
       (error) => {
         console.error('Error fetching options:', error);
       }
     );
   }

  getAllUsers() {
    this.UserService.getAllUsers().subscribe((data: any) => {
      console.log(data)
      data.reverse();
      this.dataSource.data = data;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  refresh(): void {
    window. location.reload();
    }

    notifyError(): void {
      this.notificationService.error('Error!');
    }


    notifySuccess(): void {
      this.notificationService.success("Ligne supprimé  avec Succes !");
    }

    filter(filterValue: string): void {
      this.dataSource.filter = filterValue.trim().toLowerCase();
    }

  confirmStatus(event: MatSlideToggleChange, index: any): void {
    const action = event.checked ? 'activate' : 'deactivate';
  const message = `Are you sure you want to ${action} this line?`;


    const dialogData = new ConfirmDialogModel("Confirmation", message);
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '25%',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean)  => {
      if (confirmed ) {
        const action = event.checked


        this.UserService.actionUser(index,action).pipe(
          catchError(err => {
           if(err.status===400){

            this.snackBar.open(err.error.msg, '', {
              duration: 3000,
              panelClass: ['panelErrorClass']
            });}
            return throwError(err);
          })
        ).subscribe((data: any[]) => {

          data = this.dataSource.data;
          this.dataSource.data = data;
          const actionMessage = event.checked ? 'Activated' : 'Desactivated';
          const message = `${actionMessage} successfully`;
          this.snackBar.open(message, '', {
            duration: 3000,
            panelClass: ['panelClass']
          });
        });
      }
      this.getAllUsers()

    });
  }
  addUser(){
    this.Openpopup_Add_User(0, 'Add User',AddUserComponent);
  }

  Openpopup_Add_User(code: any, title: any,component:any) {
    var _popup = this.dialog.open(component, {
      width: '50%',
      data: {
        title: title,
        code: code
      }
    });
    _popup.afterClosed().subscribe(item => {

      this.getAllUsers()
    })
  }
  editUser(code:any,firstName:any,lastName:any,poste:any,telephone:any,posteId:any){
    this.Openpopup_Edit_User(code, 'Edit User',firstName,lastName,poste,telephone,posteId, EditUserComponent);
  }
  Openpopup_Edit_User(code: any, title: any,firstName:any,lastName:any,poste:any, telephone:any,posteId:any , component:any ) {
    var _popup = this.dialog.open(component, {
      width: '40%',
      data: {
        title: title,
        code: code,
        firstName:firstName,
        lastName:lastName,
        poste:poste,
        posteId:posteId,
        telephone:telephone
      }
    });
    _popup.afterClosed().subscribe(item => {

      this.getAllUsers()

    })
  }
}
