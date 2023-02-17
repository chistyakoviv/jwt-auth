import type { HTTPResponse } from '../types/http';
import type { RefreshableStrategy } from '../types/strategy';
export declare class RefreshController {
    private readonly strategy;
    private readonly auth;
    private refreshPromise;
    constructor(strategy: RefreshableStrategy);
    handleRefresh(): Promise<HTTPResponse | void>;
    private _doRefresh;
}
