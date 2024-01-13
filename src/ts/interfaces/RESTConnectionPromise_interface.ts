import { Method } from "axios";

export interface RESTConnectionPromise {
  method: Method;
  topLevelPath: string;
  path: string;
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
  data?: any;
}
