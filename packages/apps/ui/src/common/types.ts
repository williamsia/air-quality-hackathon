// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

type ConsentCookie = {
  advertising: boolean;
  essential: boolean;
  functional: boolean;
  performance: boolean;
};

export interface CookieConsent {
  checkForCookieConsent: () => void;
  getConsentCookie: () => ConsentCookie;
}
export type NonCancelableCustomEvent<DetailType> = Omit<CustomEvent<DetailType>, 'preventDefault'>;
export type NonCancelableEventHandler<Detail = {}> = (event: NonCancelableCustomEvent<Detail>) => void;
export type CancelableEventHandler<Detail = {}> = (event: CustomEvent<Detail>) => void;
