import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';
import { DepartmentService } from '../DepartmentService/department.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../user/userService/user.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-edit-indicator',
  templateUrl: './edit-Department.component.html',
  styleUrls: ['./edit-Department.component.scss']
})

export class EditDeparmentComponent implements OnInit {


  inputdata: any;
  editdata: any;
  closemessage = 'closed using directive'
  Adminoptions: { value: number, label: string }[] = [];;
  myform!:FormGroup
selectedCategory: any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private ref: MatDialogRef<EditDeparmentComponent>, private buildr: FormBuilder,
    private departmentservice: DepartmentService,private snackBar: MatSnackBar,private userService:UserService) {

  }
  ngOnInit(): void {
    this.inputdata = this.data;
    this.selectedCategory=this.inputdata.departmentAdmin;
    this.myform = this.buildr.group({
      departmentName: [this.inputdata.departmentName, [Validators.required]],
      adminId:[this.inputdata.departmentAdmin, Validators.compose([Validators.required])]
    });
    this.departmentservice.getUsersdepartment(this.inputdata.code).subscribe(
      (data) => {
        console.log(data);
        this.Adminoptions = data.map((item: { id: Number; fullName: String; }) => ({ value: item.id, label: item.fullName }));;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );

  }

  setpopupdata(code: any) {
    const departmentName = this.myform.get('departmentName')?.value;
    this.departmentservice.updateDempartment(code,departmentName).subscribe(item => {
      this.editdata = item;
      this.myform.setValue({name:this.editdata.departmentName})
    });
  }

  Cancel() {
    this.ref.close();
  }

  Savedeparment() {
    console.log(this.myform.value)

      console.log(this.myform.value)
    this.departmentservice.updateDempartment(this.data.code,this.myform.value).pipe(
      catchError(err => {
       if(err.status===500){
        console.log(err)
        this.snackBar.open(err.error.message, '', {
          duration: 3000,
          panelClass: ['panelErrorClass']
        });}
        return throwError(err);
      })
    ).subscribe(result => {
      if(result.status==201){
      console.log(result)

      this.snackBar.open(result.body.msg, '', {
        duration: 3000,
        panelClass: ['panelClass']
      });}
      this.Cancel();
    });
  }
  }
