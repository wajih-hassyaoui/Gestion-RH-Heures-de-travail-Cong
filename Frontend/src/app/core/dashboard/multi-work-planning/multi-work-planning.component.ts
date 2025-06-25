import { Component, OnInit, ViewChild } from '@angular/core';
import { ChangeEventArgs } from '@syncfusion/ej2-angular-calendars';
import { ActionEventArgs, EventSettingsModel, ExportFieldInfo, ExportOptions, GroupModel, PopupOpenEventArgs, ScheduleComponent, ToolbarActionArgs, WorkWeek } from '@syncfusion/ej2-angular-schedule';
import { isNullOrUndefined ,L10n } from '@syncfusion/ej2-base';
import {ItemModel} from '@syncfusion/ej2-angular-navigations'
import { TokenService } from 'src/app/authentification/AuthServices/token.service';
import { ProfileService } from '../../profile/profile-Service/profile.service';
import { catchError } from 'rxjs/operators';
import { DashboardService } from '../dashboadService/dashboard.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
interface Users {
  fullName: any;
  id: any;
  poste: any;
  imageUrl: any;
  status:any;
}

L10n.load({
  'en-US': {
    'schedule' :{
      'saveButton':'Save',
      'cancelButton':'close',
      'deleteButton':'Remove',
      'newEvent':'Planning',
      'editEvent':'Edit planning'
    }
  }
})

@Component({
  selector: 'app-multi-work-planning',
  templateUrl: './multi-work-planning.component.html',
  styleUrls: ['./multi-work-planning.component.scss']
})
export class MultiWorkPlanningComponent implements OnInit {
  constructor(private localStorage:TokenService,private profileService:ProfileService,private planService:DashboardService,private snackBar: MatSnackBar) {
    setInterval(() => {
      this.currentDateTime = new Date();
    }, 1000);
}
apiURL = environment.apiUrl;
isshowendTime:boolean=false
fullName:any
gender:any;

  isshowcofrmation:boolean=true
  currentDateTime: Date = new Date();
  @ViewChild('schedule') public schedulerObj?: ScheduleComponent;
  public selectedDate: Date = new Date();
  public views: Array<string> = ['Month'];
  public startDate!: Date;
  public endDate!: Date;
  public showQuickInfo: Boolean = false;
  public searchText: string = ''; // Variable to store the search text
  public filteredDoctors: Users[] = []; // Array to store filtered doctors
  public eventSettings: EventSettingsModel = {};
  public group: GroupModel = {
    resources: ['Doctors']
  };
  public allowMultipleDoctors: Boolean = true;
  public doctorDataSource: Users[] = [];
  public statusData: Object[] = ['on site work', 'remote work'];

  public startDateParser(data: string) {
      if (isNullOrUndefined(this.startDate) && !isNullOrUndefined(data)) {
        return new Date(data);
      } else if (!isNullOrUndefined(this.startDate)) {
        return new Date(this.startDate);
      }
      return new Date();
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
    public endDateParser(data: string) {
      if (isNullOrUndefined(this.endDate) && !isNullOrUndefined(data)) {
        return new Date(data);
      } else if (!isNullOrUndefined(this.endDate)) {
        return new Date(this.endDate);
      }
      return new Date();
    }
    public showReason: boolean = false;
    public onDateChange(args: ChangeEventArgs): void {
      if (!isNullOrUndefined(args.event as any)) {
        if (args.element.id === "StartTime") {
          this.startDate = args.value as Date;
        } else if (args.element.id === "EndTime") {
          this.endDate = args.value as Date;
        }
      }
  }
  public OnActionBegin(args:ToolbarActionArgs){
    if(args.requestType === 'toolbarItemRendering'){
      let exportItem :ItemModel = {
        text : 'Excel Export',
        prefixIcon: 'e-icon-schedule-excel-export',
        click:this.onExportClick.bind(this)
      };
      args.items?.push(exportItem);
    }
  }
  public onExportClick(){
    let customFields:ExportFieldInfo[] = [
      {name:'FullName',text:'FullName'},
      {name:'StartTime',text:'Day'},
      {name:'Subject',text:'Plan'},
    ]
    let options: ExportOptions ={
      fields:['FullName','StartTime','Subject'],
      fieldsInfo: customFields,
      fileName:'Work-Plans'
    }
    this.schedulerObj?.exportToExcel(options);
  }
  public onSaveButtonClick(args: PopupOpenEventArgs): void {
    if (args.data) {
      const data: any = {
        Subject: args.data.Subject,
        StartTime: args.data.StartTime,
        EndTime: args.data.EndTime,
        IsAllDay: args.data.IsAllDay,
        UserId:args.data.UserId

      };
      this.planService.updatePlan(data,args.data.UserId).pipe(
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
            this.schedulerObj?.saveEvent(data, 'Save');
          } else {
            data['Id'] = this.schedulerObj?.getEventMaxID();
            this.schedulerObj?.addEvent(data);
          }
          this.getAllPlans()
          this.schedulerObj?.closeEditor();
        }else {
          // Save event in scheduler for error cases (400, 500)
          if (args.target?.classList.contains('e-appointment')) {
            this.getAllPlans()
            this.schedulerObj?.saveEvent(data, 'Save');
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
          this.schedulerObj?.closeEditor();
        });
      }
    }
  }
  onActionBegin(args: ActionEventArgs): void {
    // Vérifiez si scheduleObj et args.data sont définis
    if (this.schedulerObj && args.data) {
      const eventData = args.requestType === 'eventCreate' ? (Array.isArray(args.data) ? args.data[0] : args.data) : args.data as any;
      const eventDate = new Date(eventData.StartTime).toDateString();
      const existingEvent = this.schedulerObj.eventsData.find(event => new Date(event.StartTime).toDateString() === eventDate);

      if (existingEvent) {
        // Ouvrir le popup avec les détails de l'événement existant pour permettre la modification
        this.schedulerObj.openEditor(existingEvent, 'Save');
        existingEvent.Subject = eventData.Subject;
        existingEvent.StartTime = eventData.StartTime;
        existingEvent.EndTime = eventData.EndTime;
        existingEvent.IsAllDay = true;
        args.cancel = true; // Annuler l'ajout de l'événement
      }
    }
  }
  ngOnInit(): void {


    this.showConfermation()
    this.profileDetails()
    this.getAllPlans()

  }
  showConfermation(){
    if(this.localStorage.getRole()=='superadmin'){
      this.isshowcofrmation=false

    }else{
      this.isshowcofrmation=true
    }
  }
  getAllPlans() {
    this.planService.getAllMultiplans().subscribe(
      (data: any) => {
       
        this.eventSettings = {
          dataSource: data.planningDetails
        };
        this.filteredDoctors=data.userDetails
        console.log('hhh',this.eventSettings)
        console.log('fghj',this.doctorDataSource)
        this.doctorDataSource =this.filteredDoctors ;
      },
      (error) => {
        console.error('Error fetching options:', error);
      }
    );

  }

  filterDoctors() {
    if (this.searchText.trim() === '') {
        // If the search text is empty, show all doctors
        this.doctorDataSource =this.filteredDoctors ;
    } else {
        // Filter doctors based on search text
        this.doctorDataSource = this.filteredDoctors.filter((doctor) =>
            doctor.fullName.toLowerCase().includes(this.searchText.toLowerCase())
        );
    }
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
ConfirmPlan(id:any,status:any){
      this.planService.confirmPlan(id).pipe(
      catchError(err => {
       if(err.status===400){
        this.snackBar.open(err.error.msg, '', {
          duration: 3000,
          panelClass: ['panelErrorClass']
        });}
        return throwError(err);
      })
    ).subscribe((result: any) => {
      if (result) {
        this.snackBar.open(result.body.msg, '', {
          duration: 3000,
          panelClass: ['panelClass']
        });

        this.getAllPlans()
      }

    });
  }


}

