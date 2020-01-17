import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

import { config } from '../shared/config';


/**
 * Token API services, which accomodated all ERC-721 related methods.
 */
@Injectable()
export default class NftCommitmentService {

  assetHash: string;

  constructor(private http: HttpClient) {}

  /**
   *
   * Method to initiate a HTTP request to mint ERC-721 token commitment.
   *
   * @param token {String} Amount to mint
   */
  mintNFTCommitment(token: any) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    
    const body = {
      outputCommitments: [{
        tokenURI: token.token_uri,
        tokenId: token.token_id,
        shieldContractAddress: token.shield_contract_address
      }],
    };
    const url = config.apiGateway.root + 'mintNFTCommitment';

    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(`Token minted `)), catchError(this.handleError('mintToken', [])));
  }


/**
 * Method to initiate a HTTP request to transfer ERC-721 token commitments.
 *
 * @param tokenId {String} Token Id
 * @param tokenURI {String} Token name
 * @param salt {String} Serial number of token
 * @param commitment {String} Token2 commitment
 * @param name {String} Rceiver name
 * @param commitmentIndex {String} Token commitment index
 */
  transferNFTCommitment(tokenId: string, tokenURI: string, shieldContractAddress: string, salt: string, commitment: string, name: string, commitmentIndex: number) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    const body = {
      inputCommitments: [{      
        tokenId,
        tokenURI,
        shieldContractAddress,
        salt,
        commitment,
        commitmentIndex
      }],
      receiver:{
        name,
      },
    };
    const url = config.apiGateway.root + 'transferNFTCommitment';

    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(data)), catchError(this.handleError('spendToken', [])));
  }

  /**
   * Method to initiate a HTTP request to burn ERC-721 token commitments.
   *
   * @param tokenId {String} Token Id
   * @param tokenURI {String} Token name
   * @param salt {String} Serial number of token
   * @param commitment {String} Token commitment
   * @param commitmentIndex {String} Token commitment index
   * @param receiver {String} Token reciever name
   */
  burnNFTCommitment(tokenId: string, tokenURI: string, shieldContractAddress: string, salt: string, commitment: string, commitmentIndex: number, name: string) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    const body = {
      inputCommitments:[{
        tokenId,
        tokenURI,
        shieldContractAddress,
        salt,
        commitment,
        commitmentIndex,
      }],
      receiver:{
        name,
      }
    };
    const url = config.apiGateway.root + 'burnNFTCommitment';
    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(data)), catchError(this.handleError('burnToken', [])));
  }

/**
 * Fetch ERC-721 token commitmnets
 *
 * @param pageNo {Number} Page number
 * @param limit {Number} Page limit
 */
  getNFTCommitments(pageNo: number, limit: number) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    let url = config.apiGateway.root + 'getNFTCommitments?';

    if (pageNo) {
      url += 'pageNo=' + pageNo + '&';
    }

    if (limit) {
      url += 'limit=' + limit + '&';
    }

    return this.http
      .get(url, httpOptions)
      .pipe(tap(data => console.log(data)), catchError(this.handleError('getTokens', [])));
  }

  /**
   * Method to handle error on HTTp request.
   * @param operation {String}
   * @param result {Object}
   */
 private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return error;
    };
  }
}
