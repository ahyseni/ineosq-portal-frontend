import { TestBed } from '@angular/core/testing';

import { IneosShopFormService } from './ineos-shop-form.service';

describe('IneosShopFormService', () => {
  let service: IneosShopFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IneosShopFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
