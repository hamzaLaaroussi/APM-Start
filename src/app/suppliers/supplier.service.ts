import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { throwError, Observable, of } from 'rxjs';
import { Supplier } from './supplier';
import { catchError, concatMap, mergeMap, shareReplay, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  suppliersUrl = 'api/suppliers';

  suppliers$ = this.http.get<Supplier[]>(this.suppliersUrl).pipe(
    tap((data) => console.log('Supplies: ', JSON.stringify(data))),
    shareReplay(1),
    catchError(this.handleError)

  );


  supplierDetailsWithContactMap$ = of(1,5,8).pipe(
    tap(id => console.log("ConcatMap source  "+id)),
    concatMap(id => this.http.get<Supplier>(this.suppliersUrl+"/"+id)
  ));

  supplierDetailsWithMergeMap$ = of(1,5,8).pipe(
    tap(id => console.log("MergeMap source  "+id)),
    mergeMap(id => this.http.get<Supplier>(this.suppliersUrl+"/"+id)
  ));

  supplierDetailsWithSwitchMap$ = of(1,5,8).pipe(
    tap(id => console.log("SwitchMap source  "+id)),
    switchMap(id => this.http.get<Supplier>(this.suppliersUrl+"/"+id)
  ));

  constructor(private http: HttpClient) {
    //this.supplierDetailsWithContactMap$.subscribe(supplier => console.log("ConcatMap result",supplier));
    //this.supplierDetailsWithMergeMap$.subscribe(supplier => console.log("MergeMap result",supplier));
    //this.supplierDetailsWithSwitchMap$.subscribe(supplier => console.log("SwitchMap result",supplier));

  }

  private handleError(err: any): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }

}
