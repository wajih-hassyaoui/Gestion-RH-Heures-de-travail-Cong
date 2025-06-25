import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  apiURL = environment.apiUrl;
  baseUri = this.apiURL+'/congee';

  constructor(private http:HttpClient) { }
  getAllLeave() {
    return this.http.get(`${this.baseUri}`);
  }
  acceptLeave(userId:any,leaveId:any): Observable<any> {
    let url = `${this.baseUri}/confirm/${leaveId}`;
    return this.http.put(url,{userId});
  }
  rejectedLeave(userId:any,leaveId:any,leaveSubId:any): Observable<any> {
    let url = `${this.baseUri}/reject/${leaveId}`;
    return this.http.put(url,{userId,leaveSubId});
  }
}
