import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PokemonStatsRoutingModule } from './pokemon-stats-routing.module';
import { PokemonStatsComponent } from './pokemon-stats.component';
import { PokemonServiceModule } from '../pokemon-service/pokemon-service.module';


@NgModule({
  declarations: [PokemonStatsComponent],
  imports: [
    CommonModule,
    PokemonStatsRoutingModule,
    PokemonServiceModule
  ]
})
export class PokemonStatsModule { }
