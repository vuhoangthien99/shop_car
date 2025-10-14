import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestDrive } from './test-drive';

describe('TestDrive', () => {
  let component: TestDrive;
  let fixture: ComponentFixture<TestDrive>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestDrive]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestDrive);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
