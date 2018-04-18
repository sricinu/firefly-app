import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { AccountsPage } from '../accounts/accounts';
import { TransactionsPage } from '../transactions/transactions';
import { AccountListModel } from '../../models/accountlist.model';
import { TransactionListModel } from '../../models/transactionlist.model';
import { BillListModel } from '../../models/billlist.model';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  accountMeta: any;
  recentTransactions: any;
  upcomingBills: any;
  cashTotal = 0;
  creditTotal = 0;
  loader: any;

  constructor(
    public navCtrl: NavController, 
    private transactionList: TransactionListModel,
    private loadingCtrl: LoadingController, 
    private accountList: AccountListModel,
    private billList: BillListModel) 
  {
      this.loader = this.loadingCtrl.create({
        content: "Loading..."
      });

      // Disable loader on home screen or you can't get to settings
      //this.loader.present();

      Promise.all([this.getAccounts(), this.getRecentTransactions(), this.getUpcomingBills()]).then( () => {
        this.loader.dismiss();
      });
  }

  getAccounts(refresh: boolean = false) {
    return this.accountList.getAccounts(refresh).then((data) => {
      this.creditTotal = this.accountList.getSubgroupTotal("ccAsset");
      this.cashTotal = this.accountList.getSubgroupTotal("savingAsset") + this.accountList.getSubgroupTotal("defaultAsset");
    });
  }

  getRecentTransactions(){
    return this.transactionList.getTransactions().then((t) => {
      this.recentTransactions = this.transactionList.transactions.slice(0,5);
    });
  }

  getUpcomingBills(){
    return this.billList.getBills(0).then((t) => {
      this.upcomingBills = this.billList.bills.slice(0,5);
    });
  }

  navToAccounts(){
    this.navCtrl.push(AccountsPage);
  }

  navToTransactions(){
    this.navCtrl.push(TransactionsPage);
  }

  doRefresh(refresher){
    Promise.all([this.getAccounts(true), this.getRecentTransactions()]).then( () => {
      refresher.complete();
    });
  }
}
