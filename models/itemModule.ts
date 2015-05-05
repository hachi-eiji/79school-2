///<reference path="../typings/mongoose/mongoose.d.ts"/>
import mongoose = require('mongoose');
module model.item {
  export interface ItemDocument extends mongoose.Document {
    id?: string;
    ownerId: number;
    owner: any;
    title: string;
    body: string;
    likes: number[];
    published: boolean;
    tags: string[];
    searchTags: string[];
    createAt: number;
    updateAt: number;
  }

  export interface ItemModel extends mongoose.Model<ItemDocument> {
    search(condition?:ItemSearchCondition, callback?:(err:any, result:ItemDocument[])=>void):void;
    findItem(id:string, callback?:(err:any, result:ItemDocument)=>void):void;
    getTimeLine(query:Object, sort:Object, offset:number , limit:number, callback?:(err:any, result:ItemDocument[])=>void):void
  }

  export interface ItemSearchCondition {
    query?: Object;
    sort?: Object;
    offset?: number;
    limit?: number;
  }
}

export = model;
