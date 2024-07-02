import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseaguaComponent } from './baseagua.component';

describe('BaseaguaComponent', () => {
  let component: BaseaguaComponent;
  let fixture: ComponentFixture<BaseaguaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseaguaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BaseaguaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
