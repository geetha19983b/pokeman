import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from "@angular/router"; 
import { PokemonService } from '../pokemon-service/pokemon.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-pokemon-stats',
  templateUrl: './pokemon-stats.component.html',
  styleUrls: ['./pokemon-stats.component.css']
})
export class PokemonStatsComponent implements OnInit {

  pokemonName: string;
  pokemonStats: Array<any>;
  pokemonId: string;
  statsLoaded: boolean;
  subscription: Subscription;

  constructor(    
    private route: ActivatedRoute,
    private pokemonObj: PokemonService
  ) {} 

  ngOnInit(): void {
    this.pokemonId = this.route.snapshot.paramMap.get("id");
    this.subscription = this.pokemonObj.getPokemonStats(this.pokemonId).subscribe(data => { 
        this.pokemonName = data['forms'][0].name;
        this.pokemonStats = data['stats'];
        this.statsLoaded = true;
     })
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

}
