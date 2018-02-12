/**
 * Tooltip Render Component
 */

import {Component, Input} from "@angular/core";
import {DataSource} from "@angular/cdk/collections";
import {Observable} from "rxjs/Observable";

export interface AttributeRow {
  name: string,
  description: string,
  id: string,
  value: number | string
}

@Component({
  selector: 'tooltip-render',
  templateUrl: './tooltip-render.html',
  styleUrls: ['./tooltip-render.scss']
})
export class TooltipRenderComponent {
  private _data;
  dataArray: AttributeRow[];

  attributesSource: AttributesDataSource;
  headerRows = ['name', 'value'];

  @Input() get data() {
    return this._data;
  }
  set data(data) {
    this._data = data;
    this.dataArray = Object.keys(this.data).map(dataKey => this.data[dataKey]);
    this.attributesSource = new AttributesDataSource(this.dataArray);
  }

  formatValue(value: string | number): string | number {
    if (typeof value === 'string') return value;
    return value.toPrecision(4);
  }
}

export class AttributesDataSource extends DataSource<any> {

  data: AttributeRow[];

  constructor(data) {
    super();
    this.data = data;
  }
  connect(): Observable<AttributeRow[]> {
    return Observable.of(this.data);
  }

  disconnect() {}
}
