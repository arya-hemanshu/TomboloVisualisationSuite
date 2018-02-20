import {Component, HostBinding, Input, OnDestroy, OnInit} from '@angular/core';
import * as Debug from 'debug';
import {MapService} from '../../map-service/map.service';
import {UploadDialogContext} from './upload-dialog.component';
import {DataSource} from '@angular/cdk/collections';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {OgrAttributeBase} from '../../../../../src/shared/ogrfileinfo-base';

const debug = Debug('tombolo:upload-page2');


export class AttributeDataSource extends DataSource<OgrAttributeBase> {
  constructor(private staticData: OgrAttributeBase[]) {
    super();
  }

  connect(): Observable<OgrAttributeBase[]> {
    return Observable.of(this.staticData);
  }

  disconnect() {}
}

@Component({
  selector: 'upload-page3',
  templateUrl: './upload-page3.html',
  styleUrls: ['./upload-dialog.scss']
})
export class UploadPage3Component implements OnInit, OnDestroy {

  @Input() context: UploadDialogContext;
  @HostBinding('class.wizard-page-component') wizardPageClass = true;

  datasource: AttributeDataSource;

  displayedColumns = ['id', 'type', 'name', 'description', 'unit', 'remove'];

  private _subs: Subscription[] = [];

  constructor(private mapService: MapService) {}

  ngOnInit() {

    this._subs.push(this.context.enter$.subscribe(page => {
      if (page === 2) {
        this.datasource =  new AttributeDataSource(this.context.file.ogrInfo.attributes);
      }
    }));

    setTimeout(() => this.context.setNextEnabled(2), 100);
  }

  ngOnDestroy() {
    debug('Destroying page 2');
    this._subs.forEach(sub => sub.unsubscribe());
  }

}
