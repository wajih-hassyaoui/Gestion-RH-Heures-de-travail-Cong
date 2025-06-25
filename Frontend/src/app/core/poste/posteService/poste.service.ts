import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PosteService {

  apiURL = environment.apiUrl;
  baseUri = this.apiURL+'/poste';
  headers = new HttpHeaders().set('Content-Type', 'application/json');
    optionRequete = {
    headers: new HttpHeaders({
      'Access-Control-Allow-Origin':'*',
      'mon-entete-personnalise':'maValeur',
      'Content-Type': 'application/json',
      ' Access-Control-Allow-Methods':'GET,POST,OPTIONS,DELETE,PUT'
     })
  };

  constructor(private http:HttpClient) { }

createposte(data: any): Observable <any> {
        let url = `${this.baseUri}`+"/createPoste";
     return this.http.post(url,data,{ observe: 'response'});
  }


 errorMgmt(error: HttpErrorResponse) {
  let errorMessage = '';
  if (error.error instanceof ErrorEvent) {

    errorMessage = error.error.message;
  } else {
    errorMessage = 'Error Code: ${error.status}\nMessage: ${error.message}';
  }
  console.log(errorMessage);
  return throwError(() => {
    return errorMessage;
  });
}

 // Get user
   getAllpostes() {
    return this.http.get(`${this.baseUri}`);
  }


    // delete   user
    ActivetOrDisactivetposte(id:any,status:boolean): Observable<any> {
      let url = `${this.baseUri}/delPoste/${id}`;
      return this.http.put(url,{status},{ observe: 'response'});
    }

    // Get employee
    getposte(id:any): Observable<any> {
      let url = `${this.baseUri}/${id}`;
      return this.http.get(url).pipe(map((res) => {

          return res || {};
        }),
        catchError(this.errorMgmt)
      );

    }

      // Update tool
  updateposte(id:any, data:any): Observable<any> {
    let url = `${this.baseUri}/putPoste/${id}`;
    return this.http
      .put(url, data,{ observe: 'response'});

  }

}
