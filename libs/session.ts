/**
 * @fileOverview  SessionのInterface. sessionの中にuserを入れるので定義している
 */

///<reference path="../typings/express-session/express-session.d.ts"/>
module session {
  export interface ApplicationSession extends Express.Session {
    user?: User
  }
  export interface User {
    id:           number;
    loginId:      string;
    accountType:  string;
    name:         string;
    avatarUrl:    string;
    createAt:     number;
    updateAt:     number
  }
}
export = session;
