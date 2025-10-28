import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchProjects } from './search-projects';

describe('SearchProjects', () => {
  let component: SearchProjects;
  let fixture: ComponentFixture<SearchProjects>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchProjects]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchProjects);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
