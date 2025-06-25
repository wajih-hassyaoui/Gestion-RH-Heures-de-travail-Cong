import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  apiURL = environment.apiUrl;
  baseUri = this.apiURL+'/planning';

  constructor(private http:HttpClient) { }
  getAllMultiplans() {
    return this.http.get(`${this.baseUri}/allPlan`);
  }
  getAllPlans() {
    return this.http.get(`${this.baseUri}/singlePlan`);
  }
  createPlan(data: any): Observable <any> {
    let url = `${this.baseUri}`+"/addPlanning";
 return this.http.post(url,data,{ observe: 'response'});
}
updatePlan(data: any,userId:any): Observable <any> {
  let url = `${this.baseUri}`+"/updateUserPlan/"+userId;
return this.http.put(url,data,{ observe: 'response'});
}
getSubjects(){
  return this.http.get(`${this.baseUri}/subjects`);
}
confirmPlan(userId:any){
  console.log(userId)
  return this.http.get(`${this.baseUri}/confirm/${userId}`,{ observe: 'response'});
}
}
