import { Component, OnInit, OnDestroy } from '@angular/core'; 
import { PokemonService } from '../pokemon-service/pokemon.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pokemon',
  templateUrl: './pokemon.component.html',
  styleUrls: ['./pokemon.component.css']
})
export class PokemonComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  pokemons: Array<any>;
  rowHeight: string;
  constructor(private pokemonObj: PokemonService) { }

  ngOnInit(): void {
    this.rowHeight = (window.innerWidth <= 400) ? '200px' : '400px'; 
    this.subscription = this.pokemonObj.getPokemonNames().subscribe(data => {
     this.pokemons = data['results'];
    })
  }

  ngOnDestroy():void {
    this.subscription.unsubscribe();
  }

  onResize(event) {
    this.rowHeight = (event.target.innerWidth <= 400) ? '200px' : '400px';
  }
}
