import userModule = require('../../models/userModule');
import UserDocument = userModule.user.UserDocument;

export interface LoginConfig {
  client_id:string;
  secret: string;
  options:Object;
}

export interface ILogin {
  login(code:string, callback:(err:Error, user:UserDocument) => void):void;
}

export enum LoginType {
  GitHub,
  Twitter
}

