import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

import { config } from '../shared/config';

/**
 * Fungible Token services, which accomodated all ERC-20 related methods.
 */
@Injectable()
export default class FtCommitmentService {

 constructor(private http: HttpClient) {

 }

 /**
  * Method to initiate a HTTP request to mint ERC-20 token commitment.
  * @param amount {String} Amount to mint
  * @param ownerPublicKey {String} Public key of Alice
  * @param salt {String} Random Serial number
  */
 mintFTCommitment(amount: string, ownerPublicKey: string) {
  const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  const body = {
    amount,
    ownerPublicKey
  };

  const url = config.apiGateway.root + 'mintFTCommitment';

  return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(`ft-commitment minted `)), catchError(this.handleError('mintFTCommitment', [])));
 }

  /**
   * Method to initiate a HTTP request to fetch ERC-20 token commitments.
   *
   */
  getFTCommitments() {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    const url = config.apiGateway.root + 'getFTCommitments';

    return this.http
      .get(url, httpOptions)
      .pipe(tap(data => console.log(data)), catchError(this.handleError('getFTCommitments', [])));
  }

  /**
   * Method to initiate a HTTP request to burn ERC-20 token commitments.
   *
   * @param amount {String} Amount to burn
   * @param salt {String} Serial number
   * @param commitmentIndex {String} Token commitment index
   * @param commitment {String} Token commitment
   * @param ownerPublicKey {String} Public key of Alice
   */
  burnFTCommitment (
    amount: string,
    salt: string,
    commitmentIndex: string,
    commitment: string,
    ownerPublicKey: string,
    payTo: string
  ) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    const body = {
      amount,
      salt,
      ownerPublicKey,
      commitmentIndex,
      commitment,
      payTo
    };
    const url = config.apiGateway.root + 'burnFTCommitment';
    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(data)), catchError(this.handleError('burnFTCommitment', [])));
  }

  /**
   *
   * Method to initiate a HTTP request to transfer ERC-20 token commitments.
   *
   * @param firstSelectedFTCAmount {String} Amount of selected token1
   * @param secondSelectedFTCAmount {String} Amount of selected token2
   * @param transferredAmount {String} Amount of token to transfer
   * @param changeAmount {String} Amount of token after transfer
   * @param receiverPublicKey {String} Public key of Bob
   * @param saltOfFirstToken {String} Serial number of token1
   * @param saltOfSecondToken {String} Serial number of token2
   * @param firstCommitmentIndex {String} Token1 commitment index
   * @param secondCommitmentIndex {String} Token2 commitment index
   * @param transferredSalt {String} Serial number of token to transfer
   * @param changeSalt {String} Serial number of change token
   * @param commitmentOfFirstToken {String} Token1 commitment
   * @param commitmentOfSecondToken {String} Token2 commitment
   * @param ownerPublicKey {String} Public key of Alice
   * @param receiver {String} Rceiver name
   */
  transferFTCommitment (
    firstSelectedFTCAmount: string,
    secondSelectedFTCAmount: string,
    transferredAmount: string,
    changeAmount: string,
    saltOfFirstToken: string,
    saltOfSecondToken: string,
    firstCommitmentIndex: string,
    secondCommitmentIndex: string,
    commitmentOfFirstToken: string,
    commitmentOfSecondToken: string,
    ownerPublicKey: string,
    receiver) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    const firstToken = {
      amount: firstSelectedFTCAmount,
      salt: saltOfFirstToken,
      commitmentIndex: firstCommitmentIndex,
      commitment: commitmentOfFirstToken
    };
    const secondToken = {
      amount: secondSelectedFTCAmount,
      salt: saltOfSecondToken,
      commitmentIndex: secondCommitmentIndex,
      commitment: commitmentOfSecondToken
    };
    const body = {
      firstToken,
      secondToken,
      transferredAmount,
      changeAmount,
      ownerPublicKey,
      receiver
    };

    const url = config.apiGateway.root + 'transferFTCommitment';
    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(data)));
  }

  /**
   *
   * Method to initiate a HTTP request to transfer ERC-20 token batch commitments.
   *
   * @param amount {String} Amount of selected fungible token
   * @param commitmentIndex {String} Fungible Token commitment index
   * @param commitment {String} fungible token commitment
   * @param salt {String} Public key of Alice
   * @param transferData {Array} Array of value to transfer and receiver name
   */
  transferFTBatchCommitment (
    amount: string,
    salt: string,
    commitment: string,
    commitmentIndex: Number,
    transferData: Object
    ) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    const body = {
      amount,
      salt,
      commitment,
      commitmentIndex,
      transferData
    };

    const url = config.apiGateway.root + 'simpleFTCommitmentBatchTransfer';
    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(data)));
  }

  /**
   * Method for HTTP error handler
   *
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
