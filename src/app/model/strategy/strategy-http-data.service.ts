import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Strategy} from './strategy.model';
import {StrategyDataService} from './strategy-data.service';
import {AuthenticationService, RestApiUrlService} from '../../shared';
// Don't forget this else you get runtime error:
// zone.js:355 Unhandled Promise rejection: this.http.get(...).toPromise is not a function
import 'rxjs/add/operator/toPromise';

/**
 * HTTP implementation of the Strategy Data Service.
 *
 * @author gazbert
 */
@Injectable()
export class StrategyHttpDataService implements StrategyDataService {

    private static ENDPOINT_PATH = '/strategies';

    constructor(private http: HttpClient) {
    }

    private static handleError(error: any): Promise<any> {
        console.error('An error occurred!', error);
        return Promise.reject(error.message || error);
    }

    private static extractData(res: Response) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }
        return true;
    }

    getAllStrategiesForBotId(botId: string): Promise<Strategy[]> {

        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + AuthenticationService.getToken()
        });

        const url = RestApiUrlService.buildGetConfigEndpointUrl(botId, StrategyHttpDataService.ENDPOINT_PATH);
        return this.http.get(url, {headers: headers})
            .toPromise()
            .then(response => response as Strategy[])
            .catch(StrategyHttpDataService.handleError);
    }

    updateStrategy(botId: string, strategy: Strategy): Promise<Strategy> {

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AuthenticationService.getToken()
        });

        const url = RestApiUrlService.buildUpdateConfigEndpointUrl(botId, strategy.id, StrategyHttpDataService.ENDPOINT_PATH);
        return this.http
            .put(url, strategy, {headers: headers})
            .toPromise()
            .then(response => response as Strategy)
            .catch(StrategyHttpDataService.handleError);
    }

    deleteStrategyById(botId: string, strategyId: string): Promise<boolean> {

        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + AuthenticationService.getToken()
        });

        const url = RestApiUrlService.buildUpdateConfigEndpointUrl(botId, strategyId, StrategyHttpDataService.ENDPOINT_PATH);
        return this.http.delete(url, {headers: headers})
            .toPromise()
            .then(() => Promise.resolve(true))
            .catch(StrategyHttpDataService.handleError);
    }
}
