import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../user/userService/user.service';
import { TeamService } from '../teamService/team.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-add-team',
  templateUrl: './add-team.component.html',
  styleUrls: ['./add-team.component.scss']
})
export class AddTeamComponent implements OnInit {

  inputdata: any;
  editdata: any;
  AddTeamForm!: FormGroup;
  closemessage = 'closed using directive'
options: any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private ref: MatDialogRef<AddTeamComponent>, private buildr: FormBuilder,
    private teamservice: TeamService,private snackBar: MatSnackBar,private userService:UserService) {

  }
  ngOnInit(): void {
    this.inputdata = this.data;


  }



  Cancel() {
    this.ref.close('Closed using function');
  }

  myform = this.buildr.group({
    teamName: [null, Validators.compose([Validators.required])],
  });

  Saveteam() {
    this.teamservice.createTeam(this.myform.value).pipe(
      catchError(err => {
       if(err.status===400){
        this.snackBar.open(err.error.msg, '', {
          duration: 3000,
          panelClass: ['panelErrorClass']
        });}
        return throwError(err);
      })
    ).subscribe(result => {

      this.snackBar.open(result.body.msg, '', {
        duration: 3000,
        panelClass: ['panelClass']
      });
      this.Cancel();
    });
  }}

