import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as LineageFactory from '@medic/lineage';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { combineLatest, Subscription } from 'rxjs';

import { DbService } from '@mm-services/db.service';
import { MmModalAbstract } from '@mm-modals/mm-modal/mm-modal';
import { GlobalActions } from '@mm-actions/global';
import { Selectors } from '@mm-selectors/index';

@Component({
  selector: 'delete-doc-confirm',
  templateUrl: './delete-doc-confirm.component.html'
})
export class DeleteDocConfirmComponent extends MmModalAbstract implements OnInit, OnDestroy {
  private globalActions: GlobalActions;
  subscriptions: Subscription = new Subscription();
  selectMode;
  lineageLib;
  model = { doc: null }; // Automatically assigned by BsModalRef

  constructor(
    private store: Store,
    private translateService: TranslateService,
    private bsModalRef: BsModalRef,
    private dbService: DbService,
    private router: Router
  ) {
    super();
    this.globalActions = new GlobalActions(this.store);
    this.lineageLib = LineageFactory(Promise, this.dbService.get());
  }

  ngOnInit(): void {
    const subscription = combineLatest(
      this.store.select(Selectors.getSelectMode),
    )
    .subscribe(([
      selectMode,
    ]) => {
      this.selectMode = selectMode;
    });
    this.subscriptions.add(subscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  close() {
    this.bsModalRef.hide();
  }

  private getRouteName(url = '') {
    const contacts = 'contacts';
    const reports = 'reports';

    if (url.includes(contacts)) {
      return contacts;
    }

    if (url.includes(reports)) {
      return reports;
    }
  }

  submit() {
    const doc = { ...this.model.doc };
    doc._deleted = true;

    this.lineageLib.minify(doc);

    this.dbService
      .get()
      .put(doc)
      .then(() => {
        const text = this.translateService.instant('document.deleted');
        const routeName = this.getRouteName(this.router.url);
        this.globalActions.setSnackbarContent(text);
        this.close();

        if (!this.selectMode && routeName) {
          this.router.navigate([routeName, '']);
        }
      })
      .catch((err) => this.setError(err, 'Error deleting document'));
  }

}