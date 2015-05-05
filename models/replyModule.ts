///<reference path="../typings/mongoose/mongoose.d.ts"/>
import mongoose = require('mongoose');

module model.reply {
  export interface ReplyDocument extends mongoose.Document {
    itemId: string;
    ownerId: number;
    owner: Object;
    body: string;
    createAt: number;
  }

  export interface ReplyModel extends mongoose.Model<ReplyDocument> {
    list(limit:number, offset:number, query:Object, callback:(err:any, result:ReplyDocument[])=>void):void;
  }
}

export = model;
