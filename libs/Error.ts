/**
 * @fileOverview ResponseCodeを入れたいのでstatusを設定
 */
///<reference path="../typings/node/node.d.ts"/>

interface ApplicationError extends Error {
  status?: number
}

export = ApplicationError;
