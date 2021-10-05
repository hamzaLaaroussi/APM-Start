import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, EMPTY, Subject } from 'rxjs';
import { catchError, map, tap, filter } from 'rxjs/operators';

import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent {
  private errorMessageSubject = new Subject<string>();
  errorMessageAction$ = this.errorMessageSubject.asObservable();

  selectedProduct$ = this.productService.selectedProduct$.pipe(
    catchError((err) => {
      this.errorMessageSubject.next(err);
      return EMPTY;
    })
  );

  pageTitle$ = this.selectedProduct$.pipe(
    map((product) =>
      product ? `Product Detail for ${product.productName}` : null
    )
  );
  productWithSuppliers$ = this.productService.selectedProductSupplies$.pipe(
    catchError((err) => {
      this.errorMessageSubject.next(err);
      return EMPTY;
    })
  );

  vm$ = combineLatest([
    this.selectedProduct$,
    this.pageTitle$,
    this.productWithSuppliers$,
  ]).pipe(
    filter((product) => Boolean(product)),
    map(([product, pageTitle, productwithSuppliers]) => ({
      product,
      pageTitle,
      productwithSuppliers,
    }))
  );

  constructor(private productService: ProductService) {}
}
