import type { HTTPResponse } from '../types/http';
import type { RefreshableStrategy } from '../types/strategy';
import type { Auth } from '../auth';

export class RefreshController {
    public auth: Auth;
    private refreshPromise: Promise<HTTPResponse | void> | null = null;

    constructor(private strategy: RefreshableStrategy) {
        this.auth = strategy.auth;
    }

    handleRefresh(): Promise<HTTPResponse | void> {
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        return this._doRefresh();
    }

    private _doRefresh(): Promise<HTTPResponse | void> {
        this.refreshPromise = new Promise((resolve, reject) => {
            this.strategy
                .refreshTokens()
                .then((response) => {
                    this.refreshPromise = null;
                    resolve(response);
                })
                .catch((error) => {
                    this.refreshPromise = null;
                    reject(error);
                });
        });

        return this.refreshPromise;
    }
}
