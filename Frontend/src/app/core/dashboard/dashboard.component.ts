import { Component, OnInit } from '@angular/core';
import { TokenService } from 'src/app/authentification/AuthServices/token.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isshowMultiPlan:boolean=false;
  isshowPlan:boolean=true;

  constructor(private localStorageRole:TokenService) { }

  ngOnInit(): void {
    this.showMultiPlan()
  }
  showMultiPlan(){
    if(this.localStorageRole.getRole()=='superadmin'|| this.localStorageRole.getRole()=='superadmin' ){

      this.isshowMultiPlan=true

    }else{

      this.isshowMultiPlan=false
    }
   }
   showPlan(){
    if(this.localStorageRole.getRole()=='superadmin'){

      this.isshowPlan=false

    }else{

      this.isshowPlan=true
    }
   }
}
