import { ProductCategoryService } from './../product-categories/product-category.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, combineLatest, from, merge, Observable, Subject, throwError } from 'rxjs';
import { catchError, filter, map, mergeMap, scan, shareReplay, switchMap, tap, toArray } from 'rxjs/operators';

import { Product } from './product';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;

  products$ = this.http.get<Product[]>(this.productsUrl).pipe(
    tap((data) => console.log('Products: ', JSON.stringify(data))),
    catchError(this.handleError)
  );

  productWithCategory$ = combineLatest([
    this.products$,
    this.productCategoryService.productCategories$,
  ]).pipe(
    map(([products, categories]) =>
      products.map(
        (product) =>
          ({
            ...product,
            price: product.price * 1.5,
            searchKey: [product.productName],
            category: categories.find(
              (category) => category.id === product.categoryId
            ).name,
          } as Product)
      )
    ),
    shareReplay(1)
  );

  private productSelectedSubject = new BehaviorSubject<number>(0);
  productSelectedAction$ = this.productSelectedSubject.asObservable();

  selectedProduct$ = combineLatest([
    this.productWithCategory$,
    this.productSelectedAction$,
  ]).pipe(
    map(([products, productSelectedId]) =>
      products.find((product) => product.id === productSelectedId)
    ),
    tap((product) => console.log("Selected product: ",  product)),
    shareReplay(1)
  );

  private productInsertedSubject = new Subject<Product>();
  productInsertedAction$ = this.productInsertedSubject.asObservable();

  productsWithAdd$ = merge(
    this.productWithCategory$,
    this.productInsertedAction$
  ).pipe(scan((acc: Product[], product: Product) => [...acc, product]));

  /*selectedProductSupplies$ = combineLatest([
    this.selectedProduct$,
    this.supplierService.suppliers$
  ]).pipe(
    tap(product => console.log("supplis ....",product)),
    map(([product, supplies]) => supplies.filter(supplier => product.supplierIds.includes(supplier.id))),
    tap((supplies) => console.log("Product supplies: " , supplies)),
    shareReplay(1)
  );*/

  selectedProductSupplies$ = this.selectedProduct$.pipe(
    filter(selectedProduct => Boolean(selectedProduct)),
    switchMap((product) => from(product.supplierIds).pipe(
      mergeMap((supplierId) => this.http.get<Supplier>(`${this.suppliersUrl}/${supplierId}`)),
      toArray(),
      tap(supplies => console.log("Switched Map supplies", supplies))
    ))
  )


  constructor(
    private productCategoryService: ProductCategoryService,
    private http: HttpClient,
    private supplierService: SupplierService
  ) {}

  onAddproduct(newProduct?: Product) : void{
      newProduct = newProduct || this.fakeProduct();
      this.productInsertedSubject.next(newProduct);
  }

  private fakeProduct(): Product {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      category: 'Toolbox',
      quantityInStock: 30,
    };
  }

  public handleError(err: any): Observable<never> {
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

  onProductSelected(productSelectedId: number): void {
    this.productSelectedSubject.next(productSelectedId);
  }
}
