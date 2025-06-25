import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from './confirm-leaveService/confirm.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

import { RejectedLeaveComponent } from './rejected-leave/rejected-leave.component';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ConfirmDialogModel, ConfirmationDialogComponent } from 'src/app/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-confirm-leave',
  templateUrl: './confirm-leave.component.html',
  styleUrls: ['./confirm-leave.component.scss']
})
export class ConfirmLeaveComponent implements OnInit {
  apiURL = environment.apiUrl+"/";
  @ViewChild(MatSort, { static: false })
  sort!: MatSort; // Keep this single declaration and remove the duplicate
  @ViewChild(MatPaginator, { static: false })
  paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['fullName', 'day', 'leaveType','reason','Action' ];
  constructor(private confirmServce:ConfirmService,private snackBar: MatSnackBar,public dialog: MatDialog,) { }

  ngOnInit(): void {
    this.getAllLeave()
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  filter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  getAllLeave() {
    this.confirmServce.getAllLeave().subscribe((data: any) => {
      console.log('Confirm Leave Data : ', data);
      data.reverse();
      this.dataSource.data = data;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }
  confirmLeave(userId: any, congeeId: any): void {
    console.log("userId",userId)
    console.log("congeeId",congeeId)

  const message = `Are you sure you want to accept this leave?`;


    const dialogData = new ConfirmDialogModel("Confirmation", message);
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '25%',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean)  => {
      if (confirmed ) {
        this.confirmServce.acceptLeave(userId,congeeId).pipe(
          catchError(err => {
           if(err.status===400){
            this.snackBar.open(err.error.msg, '', {
              duration: 3000,
              panelClass: ['panelErrorClass']
            });}
            return throwError(err);
          })
        ).subscribe((data: any) => {
          this.dataSource.data = data;

          this.snackBar.open(data.msg, '', {
            duration: 3000,
            panelClass: ['panelClass']
          });
        });

      }

      this.getAllLeave()
    });

  }

  RejectedLeave(userId:any,congeeId:any){
    this.Openpopup_Edit_Team(userId, 'Reject Leave',congeeId,RejectedLeaveComponent);
  }
  Openpopup_Edit_Team(userId: any, title: any,congeeId:any, component:any ) {
    var _popup = this.dialog.open(component, {
      width: '30%',
      data: {
        title: title,
        userId: userId,
        congeeId:congeeId,

      }
    });
    _popup.afterClosed().subscribe(item => {

      this.getAllLeave()

    })
  }
}
