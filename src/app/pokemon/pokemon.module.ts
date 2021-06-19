import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PokemonRoutingModule } from './pokemon-routing.module';
import { PokemonComponent } from './pokemon.component'; 

import { MatGridListModule } from '@angular/material/grid-list'
import { PokemonServiceModule } from '../pokemon-service/pokemon-service.module';

@NgModule({
  declarations: [PokemonComponent],
  imports: [
    CommonModule,
    PokemonRoutingModule,
    MatGridListModule,
    PokemonServiceModule
  ],
  providers: []
})
export class PokemonModule { }
