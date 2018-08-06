import { IRead } from './interfaces/iread.repository';
import { ModelFactory } from '../models/model.factory';
import { FireflyRemoteProvider } from '../providers/firefly-remote/firefly-remote';
import { Storage } from '@ionic/storage';
import { Inject } from "@angular/core";

export class BaseRepository<T> implements IRead<T>
{
    protected endpoint: string = '';
    protected model: any;
    protected _rawData: any = null;

    constructor(@Inject(FireflyRemoteProvider) private fireflyService, @Inject(Storage) private storage){
        
    }

    getAll(recursive:boolean = false, refresh: boolean = false): Promise<T[]> {
        return new Promise((resolve, reject) => {

            // instantiate collection just in case.
            var collection = [];

            // Check for cached data before making a call to the web service.
            if(!refresh && this._rawData !== null){
                resolve(this._rawData);
            }else if(!refresh || !this.fireflyService.isConnected){
                this.getEntitiesFromStorage().then(d => {
                    if(d !== null)
                        collection = d;
                    resolve(collection);
                });
            }else{
                this.fireflyService.getEntities(this.endpoint, recursive).then(d => {
                    collection = this.processData(d);
                    this.saveEntitiesToStorage();
                    resolve(collection);
                });
            }
        });
    }

    find(): Promise<T[]> {
        throw new Error("Method not implemented");
    }

    findOne(): Promise<T> {
        throw new Error("Method not implemented");
    }

    private saveEntitiesToStorage(): Promise<T>{
        return this.storage.set(this.endpoint, this._rawData);
    }

    private getEntitiesFromStorage(): Promise<T[]>{
        return this.storage.get(this.endpoint);
    }

    private processData(data: any): T[]{

        var collection = [];        

        if(data !== null && data.length > 0){
            
            for(var i = 0; i < data.length; i++){
                collection[i] = ModelFactory.create(this.model);
                collection[i].hydrate(data[i]);
            }

            this._rawData = collection;
        }

        return collection;
    }

}