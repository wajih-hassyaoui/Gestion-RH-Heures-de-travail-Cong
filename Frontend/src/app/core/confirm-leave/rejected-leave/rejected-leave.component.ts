import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmService } from '../confirm-leaveService/confirm.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-rejected-leave',
  templateUrl: './rejected-leave.component.html',
  styleUrls: ['./rejected-leave.component.scss']
})
export class RejectedLeaveComponent implements OnInit {
  inputdata: any;
  myform!: FormGroup;
  workmode: { value: number, label: string }[] = [{value: 1, label: "remote work"},{value:2,label:"on site work"}];
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private ref: MatDialogRef<RejectedLeaveComponent>, private Formbuilder: FormBuilder,
  private confirmService: ConfirmService,private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.inputdata = this.data;
    this.myform = this.Formbuilder.group({
      leaveSubId: ["", [Validators.required]],
    });
  }

  Cancel() {
    this.ref.close(true);
  }
  SaveRejectedLeave() {
    const leaveSubId=this.myform.get("leaveSubId")?.value
    console.log(this.inputdata.userId,this.inputdata.congeeId,leaveSubId)
    this.confirmService.rejectedLeave(this.inputdata.userId,this.inputdata.congeeId,leaveSubId).pipe(
      catchError(err => {
       if(err.status===400){
        this.snackBar.open(err.error.msg, '', {
          duration: 3000,
          panelClass: ['panelErrorClass']
        });}
        return throwError(err);
      })
    ).subscribe(result => {
      console.log(result)

      this.snackBar.open(result.msg, '', {
        duration: 3000,
        panelClass: ['panelClass']
      });
      this.Cancel();
    });
  }

}
