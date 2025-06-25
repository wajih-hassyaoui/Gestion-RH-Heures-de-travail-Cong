import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { isNullOrUndefined, L10n } from '@syncfusion/ej2-base';
import { ActionEventArgs, EventFieldsMapping, EventSettingsModel, PopupOpenEventArgs, ScheduleComponent } from '@syncfusion/ej2-angular-schedule';
import { ChangeEventArgs } from '@syncfusion/ej2-angular-calendars';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { DashboardService } from '../dashboadService/dashboard.service';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { throwError } from 'rxjs';
import {DataManager,WebApiAdaptor,Query} from '@syncfusion/ej2-data';
import { TokenService } from 'src/app/authentification/AuthServices/token.service';
import { ProfileService } from '../../profile/profile-Service/profile.service';
@Component({
  selector: 'app-work-planning',
  templateUrl: './work-planning.component.html',
  styleUrls: ['./work-planning.component.scss']
})
export class WorkPlanningComponent implements OnInit {

  constructor( private planService:DashboardService,private snackBar: MatSnackBar,private localStorage:TokenService,private profileService:ProfileService) {
    setInterval(() => {
      this.currentDateTime = new Date();
    }, 1000);
  }
  fullName:any
  gender:any;
  public plans: any[] = [];
 public allowEditing:boolean = true;
  currentDateTime: Date = new Date();
  @ViewChild('schedule') public scheduleObj?: ScheduleComponent;
  public selectedDate: Date = new Date();
  public views: Array<string> = [ 'Month'];
  public showQuickInfo: Boolean = false;
  public startDate!: Date;
  public endDate!: Date;


  public eventSettings: EventSettingsModel = {};

  public statusData: {  subject: string }[] = [ ];
  public leaveData: Object[] = [];
  public showReason: boolean = false;

  public startDateParser(data: string) {
      if (isNullOrUndefined(this.startDate) && !isNullOrUndefined(data)) {
        return new Date(data);
      } else if (!isNullOrUndefined(this.startDate)) {
        return new Date(this.startDate);
      }
      return new Date();
  }

  public endDateParser(data: string) {
      if (isNullOrUndefined(this.endDate) && !isNullOrUndefined(data)) {
        return new Date(data);
      } else if (!isNullOrUndefined(this.endDate)) {
        return new Date(this.endDate);
      }
      return new Date();
  }

  public isshowReason(leave: string): void {
      this.showReason = leave === 'sick leave' || leave === 'leave' || leave === 'compensation leave';
  }

  public onDateChange(args: ChangeEventArgs): void {
      if (!isNullOrUndefined(args.event as any)) {
        if (args.element.id === "StartTime") {
          this.startDate = args.value as Date;
        } else if (args.element.id === "EndTime") {
          this.endDate = args.value as Date;
        }
      }
  }
  onActionBegin(args: ActionEventArgs): void {
    // Vérifiez si scheduleObj et args.data sont définis
    if (this.scheduleObj && args.data) {
      const eventData = args.requestType === 'eventCreate' ? (Array.isArray(args.data) ? args.data[0] : args.data) : args.data as any;
      const eventDate = new Date(eventData.StartTime).toDateString();
      const existingEvent = this.scheduleObj.eventsData.find(event => new Date(event.StartTime).toDateString() === eventDate);

      if (existingEvent) {
        // Ouvrir le popup avec les détails de l'événement existant pour permettre la modification
        this.scheduleObj.openEditor(existingEvent, 'Save');
        existingEvent.Subject = eventData.Subject;
        existingEvent.StartTime = eventData.StartTime;
        existingEvent.EndTime = eventData.EndTime;
        existingEvent.IsAllDay = true;
        args.cancel = true; // Annuler l'ajout de l'événement
      }
    }
  }

  public onSaveButtonClick(args: PopupOpenEventArgs): void {
  if (args.data) {
    const data: any = {
      Subject: args.data.Subject,
      StartTime: args.data.StartTime,
      EndTime: args.data.EndTime,
      IsAllDay: args.data.IsAllDay,


    };


    // Add Description if applicable
    if (args.data.Description) {
      data.Description = args.data.Description;
    }

    this.planService.createPlan(data).pipe(
      catchError(err => {
        if (err.status === 400) {
          console.log(err.error.msg)
          this.snackBar.open(err.error.msg, '', {
            duration: 3000,
            panelClass: ['panelErrorClass']
          });
        }else {
          this.snackBar.open(err.error.message, '', {
            duration: 3000,
            panelClass: ['panelErrorClass']
          });
        }
        return throwError(err);
      })
    ).subscribe(result => {
      console.log(result )
      this.snackBar.open(result.body.msg, '', {
        duration: 3000,
        panelClass: ['panelClass']
      });

      if (result.status === 201) {
        if (args.target?.classList.contains('e-appointment')) {
          this.scheduleObj?.saveEvent(data, 'Save');
        } else {
          data['Id'] = this.scheduleObj?.getEventMaxID();
          this.scheduleObj?.addEvent(data);
        }
        this.getAllPlans();
        this.scheduleObj?.closeEditor();
      }else {
        // Save event in scheduler for error cases (400, 500)
        if (args.target?.classList.contains('e-appointment')) {
          this.scheduleObj?.saveEvent(data, 'Save');
        }
      }
    });
  }
}



 public onPopupOpen(args: PopupOpenEventArgs): void {

  if (args.type === 'Editor') {
    const saveButton: HTMLElement | null = args.element.querySelector('#Save');
    const cancelButton: HTMLElement | null = args.element.querySelector('#Cancel');

    if (saveButton) {
      saveButton.addEventListener('click', () => {
        this.onSaveButtonClick(args);
      });
    }

    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        this.scheduleObj?.closeEditor();
      });
    }
  }
}

getBackgroundColor(subject: string): string {
  switch (subject) {
    case 'remote work':
      return '#FF0000';
    case 'on site work':
      return '#4cd964';
    default:
      return '#ef9c28'; // Default color
  }
}

  public cancel(): void {
    this.scheduleObj?.closeEditor();
  }

  ngOnInit(): void {

    this.profileDetails()
    this.planService.getSubjects().subscribe(
      (data: any) => {
        this.statusData= data.map((item: { subject: String; }) => ({  subject: item.subject }));;
        console.log(this.statusData)
      },
      (error) => {
        console.error('Error fetching options:', error);
      }
    );
  this.getAllPlans();
  }
  getAllPlans() {
    this.planService.getAllPlans().subscribe(
      (data: any) => {

        this.eventSettings = {
          dataSource: data
        };
        console.log(data)
      },
      (error) => {
        console.error('Error fetching options:', error);
      }
    );

  }
  profileDetails(){
    this.profileService.getProfileDetails().subscribe((data: any) => {

        this.fullName=data.firstName
        if(data.gender=='M'){
          this.gender='Mr'
          }
          else{
          this.gender='Miss'
          }
      console.log('team member details : ', data);


    });
  }
}
