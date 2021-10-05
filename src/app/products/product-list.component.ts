import { ProductCategoryService } from './../product-categories/product-category.service';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BehaviorSubject, combineLatest, EMPTY, Subject } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';

import { ProductService } from './product.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
  pageTitle = 'Product List';

  private errorMessageSubject = new Subject<string>();
  errorMessageAction$ = this.errorMessageSubject.asObservable();

  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  categories$ = this.productCategoryService.productCategories$.pipe(
    catchError((err) => {
      this.errorMessageSubject.next(err);
      return EMPTY;
    })
  );

  productsWithCategory$ = combineLatest([this.productService.productsWithAdd$, this.categorySelectedAction$]).pipe(
    map(([products, categorySelectdId])=> products.filter(product => categorySelectdId ? product.categoryId === categorySelectdId : true)),
    catchError((err) => {
      this.errorMessageSubject.next(err);
      return EMPTY;
    })
  );


  constructor(
    private productCategoryService: ProductCategoryService,
    private productService: ProductService
  ) {}

  onAdd(): void {
    this.productService.onAddproduct()
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }
}
