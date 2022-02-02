import type { HTTPResponse } from '../types/http';
import type { RefreshableStrategy } from '../types/strategy';
import type { Auth } from '../auth';

export class RefreshController {
    public auth: Auth;
    private _refreshPromise: Promise<HTTPResponse | void> = null;

    constructor(private strategy: RefreshableStrategy) {
        this.auth = strategy.auth;
    }

    handleRefresh(): Promise<HTTPResponse | void> {
        if (this._refreshPromise) {
            return this._refreshPromise;
        }

        return this._doRefresh();
    }

    private _doRefresh(): Promise<HTTPResponse | void> {
        this._refreshPromise = new Promise((resolve, reject) => {
            this.strategy
                .refreshTokens()
                .then((response) => {
                    this._refreshPromise = null;
                    resolve(response);
                })
                .catch((error) => {
                    this._refreshPromise = null;
                    reject(error);
                });
        });

        return this._refreshPromise;
    }
}
