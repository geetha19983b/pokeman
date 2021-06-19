import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  constructor(  private http: HttpClient) { }

  getPokemonNames(){
    return this.http.get('https://pokeapi.co/api/v2/pokemon/?limit=50')
  }

  getPokemonStats(id: string){
    return this.http.get('https://pokeapi.co/api/v2/pokemon/' + id)
  }
}
