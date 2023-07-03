/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from "@playwright/test";

import { BasePage } from "./base.page";
import { MetamaskPage } from "./metamask.page";
import { Routes } from "../data/data";
import { Helper } from "../helpers/helper";
import { config } from "../support/config";

import type { ICustomWorld } from "../support/custom-world";

let metamaskPage: any;
let result: any;

export class MainPage extends BasePage {
  constructor(world: ICustomWorld) {
    super(world);
  }

  get amountInputField() {
    return "//*[@class='amount-input-field-container']//input";
  }

  get totalIntBalance() {
    return ".total-int";
  }

  get totalDecBalance() {
    return ".total-dec";
  }

  get tokenDropDown() {
    return "token-dropDown";
  }

  get selectedNetwork() {
    return ".network-item-label";
  }

  get getFirstToken() {
    return "//button[@l1address]";
  }

  get emptyBalancesWarning() {
    return `${this.byTestId}no-balances-warning`;
  }

  async selectTransaction(transactionType: string) {
    try {
      let route: string;
      if (transactionType === "Withdraw") {
        route = Routes.withdraw;
        await this.world.page?.goto(config.BASE_URL + route + config.DAPP_NETWORK);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async chooseToken(tokenName: string) {
    await this.click(this.tokenDropDown, true);
    await this.clickBy("placeholder", "Symbol or address");
    await this.fill(".small-input-field", `${tokenName}`);
    await this.click(this.getFirstToken);
  }

  async insertAmount(amount: string) {
    await this.fill(this.amountInputField, amount);
  }

  async makeTransaction(actionType: string, transactionType: string) {
    metamaskPage = await new MetamaskPage(this.world);
    result = await this.getTransactionSelector(transactionType);

    await metamaskPage.operateTransaction(result);
  }

  async getTransactionSelector(transactionType: string) {
    result = transactionType;
    return result;
  }

  async monitorBalance(walletAddress: string, layer: string) {
    const helper = await new Helper(this.world);
    const balanceETH = await helper.getBalanceETH(walletAddress, layer);
    await helper.notifyQAIfLowBalance(layer, walletAddress, balanceETH);
    console.log("======== " + layer + " balance: " + balanceETH + " ETH | " + walletAddress);
    await expect(balanceETH).toBeGreaterThan(config.thresholdBalance);
  }

  async getTotalBalance() {
    const helper = new Helper(this.world);

    const totalInt = await helper.getTextFromLocator(this.totalIntBalance);
    const totalDec = await helper.getTextFromLocator(this.totalDecBalance);

    result = await helper.getNumberFromString(totalInt + totalDec);
    const extractedNumber = result.replace(/[^\d.-]/g, "");
    result = parseFloat(extractedNumber);

    return result;
  }
}