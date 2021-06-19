import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AboutRoutingModule } from './about-routing.module';
import { AboutComponent } from './about.component';
import { MaterialModule } from 'src/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChipSearchComponent } from './chipsearch/chip-search.component';
import { ChipHierarchyComponent } from './chiphierarchy/chip-hierachy.component';



@NgModule({
  declarations: [AboutComponent,
    ChipSearchComponent,
    ChipHierarchyComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AboutRoutingModule,
    MaterialModule,
   
  ],
  exports:[
    ChipSearchComponent,
    ChipHierarchyComponent
  ]
})
export class AboutModule { }
