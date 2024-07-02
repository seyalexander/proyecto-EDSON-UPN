import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterLeakComponent } from './water-leak.component';

describe('WaterLeakComponent', () => {
  let component: WaterLeakComponent;
  let fixture: ComponentFixture<WaterLeakComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterLeakComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WaterLeakComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
