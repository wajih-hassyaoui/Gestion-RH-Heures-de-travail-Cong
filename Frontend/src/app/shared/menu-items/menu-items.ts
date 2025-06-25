import { Injectable } from '@angular/core';
 import { RoleGuard } from '../../core/role-guard';import { TokenService } from 'src/app/authentification/AuthServices/token.service';
;
export interface BadgeItem {
  type: string;
  value: string;
}
export interface Saperator {
  name: string;
  type?: string;
}
export interface SubChildren {
  state: string;
  name: string;
  type?: string;
}
export interface ChildrenItems {
  state: string;
  name: string;
  type?: string;
  child?: SubChildren[];
}

export interface Menu {
  state: string;
  name: string;
  type: string;
  icon: string;
  badge?: BadgeItem[];
  saperator?: Saperator[];
  children?: ChildrenItems[];
}

const MENUITEMS = [



  {
   state: 'multiWorkPlanning',
   name: 'multiWorkPlan',
   type: 'link',
   icon: 'perm_contact_calendar'
 }
,
  {
   state: 'users',
   name: 'Users',
   type: 'link',
   icon: 'person'
 },
 {
  state: 'campagne',
  name: 'Campagnes',
  type: 'link',
  icon: 'access_time'
},
{canActivate:[RoleGuard],
  state: 'department',
  name: 'Departments',
  type: 'link',
  icon: 'business'

},
{
  state: 'poste',
  name: 'Postes',
  type: 'link',
  icon: 'content_copy'
  },

];
const MENUITEMSAdmin =[
  {
    state: 'dashboard',
    name: 'DashBoard',
    type: 'link',
    icon: 'av_timer'
  },

  {
   state: 'multiWorkPlanning',
   name: 'multiWorkPlan',
   type: 'link',
   icon: 'perm_contact_calendar'
 },
 {
  state: 'confirmation',
  name: 'leave confirmation',
  type: 'link',
  icon: 'check_circle'
},
  {
   state: 'users',
   name: 'Users',
   type: 'link',
   icon: 'person'
 },
{
  state: 'poste',
  name: 'Postes',
  type: 'link',
  icon: 'content_copy'
  }
  ,
  {
  state: 'team',
  name: 'Teams',
  type: 'link',
  icon: 'groups'
  }
];
const MENUITEMSManager =[
  {
    state: 'dashboard',
    name: 'DashBoard',
    type: 'link',
    icon: 'av_timer'
  }
  ,

  {
   state: 'multiWorkPlanning',
   name: 'multiWorkPlan',
   type: 'link',
   icon: 'perm_contact_calendar'
 } ,
 {
  state: 'confirmation',
  name: 'leave confirmation',
  type: 'link',
  icon: 'check_circle'
},

  {
   state: 'users',
   name: 'Users',
   type: 'link',
   icon: 'person'
 }
];
const MENUITEMSCollaborateur =[
  {
    state: 'dashboard',
    name: 'DashBoard',
    type: 'link',
    icon: 'av_timer'
  },


];
@Injectable()
export class MenuItems {
  name:any;
  constructor(private localStorageRole:TokenService){}
  getMenuitem(): Menu[] {
    if(this.localStorageRole.getRole()=='superadmin'){
    return MENUITEMS;
  }else if(this.localStorageRole.getRole()=='admin'){
   this.name="teams"
    return MENUITEMSAdmin;
  }else if(this.localStorageRole.getRole()=='manager'){
    return MENUITEMSManager ;
  }else{
    return MENUITEMSCollaborateur;
  }
  }
}
