import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemoMaterialModule } from '../demo-material-module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CoreRoutingModule } from './core-routing.module';
 import { SharedModule } from '../shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatFormFieldModule} from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
 import { PosteComponent } from './poste/postes-liste/poste.component';
 import {MatIconModule} from '@angular/material/icon';
import { EditPosteComponent } from './poste/edit-poste/edit-poste.component';
import { AddPosteComponent } from './poste/add-poste/add-poste.component'
import {FormsModule,ReactiveFormsModule} from '@angular/forms';
import { AddCampagneComponent } from './campagne/add-campagne/add-campagne.component';
import { CampagneComponent } from './campagne/campagne-liste/campagne.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {MatDialogModule} from '@angular/material/dialog';
import { UserComponent } from './user/user-liste/user.component';
import { DeparmentComponent } from './Department/Liste-Department/Department.component';
import { AddDeparmentComponent } from './Department/add-Department/add-Department.component';
import { EditDeparmentComponent } from './Department/edit-Department/edit-Department.component';
import { EditUserComponent } from './user/edit-user/edit-user.component';
import { AddUserComponent } from './user/add-user/add-user.component';
import { DataService } from '../services/data.service';
import {MatCardModule} from '@angular/material/card';
import{Ng2SearchPipeModule} from 'ng2-search-filter';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CustomCalendarHeaderComponentComponent } from './campagne/add-campagne/CustomCalendarHeaderComponent/custom-calendar-header-component/custom-calendar-header-component.component';
import { TeamListeComponent } from './team/team-liste/team-liste.component';
import { AddTeamComponent } from './team/add-team/add-team.component';
import { EditTeamComponent } from './team/edit-team/edit-team.component';
import { ProfileDetailsComponent } from './profile/profile-details/profile-details.component';
import { SecurityProfileComponent } from './profile/profile-security/security-profile.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WorkPlanningComponent } from './dashboard/work-planning/work-planning.component';
import { MultiWorkPlanningComponent } from './dashboard/multi-work-planning/multi-work-planning.component';
import { RecurrenceEditorModule, ScheduleModule,DayService,WeekService,WorkWeekService,MonthService,AgendaService, ResizeService,TimelineViewsService,TimelineMonthService ,ExcelExportService} from '@syncfusion/ej2-angular-schedule';
import{DropDownListModule} from '@syncfusion/ej2-angular-dropdowns';
import{DateTimePickerModule} from '@syncfusion/ej2-angular-calendars';
import { ButtonModule, CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { registerLicense } from '@syncfusion/ej2-base';
import { ConfirmLeaveComponent } from './confirm-leave/confirm-leave.component';
import { RejectedLeaveComponent } from './confirm-leave/rejected-leave/rejected-leave.component';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
registerLicense('Ngo9BigBOggjHTQxAR8/V1NBaF5cXmZCe0x0Qnxbf1x0ZFRHal1TTnVfUiweQnxTdEFjXX1ZcXVXQ2BcUEV3Vw==');
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

   @NgModule({
  declarations: [
    PosteComponent,
    EditPosteComponent,
    AddPosteComponent,
    AddUserComponent,
    UserComponent,
    EditUserComponent,
    CampagneComponent,
    DeparmentComponent,
    AddDeparmentComponent,
    EditDeparmentComponent,
    AddCampagneComponent,
    CustomCalendarHeaderComponentComponent,
    TeamListeComponent,
    AddTeamComponent,
    EditTeamComponent,
    ProfileDetailsComponent,
    SecurityProfileComponent,
    DashboardComponent,
    WorkPlanningComponent,
    MultiWorkPlanningComponent,
    ConfirmLeaveComponent,

    RejectedLeaveComponent,

  ],
  imports: [RouterModule,RecurrenceEditorModule, ScheduleModule,
    SharedModule,MatPaginatorModule,
    MatTableModule,Ng2SearchPipeModule,
    CommonModule,
    CoreRoutingModule,
    FlexLayoutModule,MatDialogModule,MatCardModule,
    DemoMaterialModule,ReactiveFormsModule,FormsModule,
    NgxDatatableModule ,MatSortModule,MatFormFieldModule,MatIconModule, MatInputModule,
    MatAutocompleteModule,MatSnackBarModule,DateTimePickerModule,DropDownListModule,ButtonModule,CheckBoxModule,  TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      }
  }),

   ],
   providers: [DataService,DayService,WeekService,WorkWeekService,MonthService,AgendaService,ResizeService,TimelineViewsService,TimelineMonthService,ExcelExportService]

})
export class CoreModule { }
