///<reference path="../typings/mongoose/mongoose.d.ts"/>
import mongoose = require('mongoose');
module model.user {
  export interface UserDocument extends mongoose.Document {
    loginId:string;
    accountType: accountType;
    name:string;
    avatarUrl:string;
    createAt:number;
    updateAt:number;
  }

  export interface UserModel extends mongoose.Model<UserDocument> {

  }

  enum accountType{
    github,
    twitter
  }
}
export = model;
