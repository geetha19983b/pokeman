import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PokemonStatsComponent } from './pokemon-stats.component'; 

const routes: Routes = [{ path: '', component: PokemonStatsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PokemonStatsRoutingModule { }
