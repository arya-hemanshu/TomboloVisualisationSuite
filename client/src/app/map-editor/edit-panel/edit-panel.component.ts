import {ChangeDetectionStrategy, Component, HostBinding, OnInit, DoCheck, ChangeDetectorRef} from '@angular/core';
import * as Debug from 'debug';
import {TomboloMapboxMap} from '../../mapbox/tombolo-mapbox-map';
import {MapService} from '../../services/map-service/map.service';
import {Subscription} from 'rxjs/Subscription';
import {MapRegistry} from '../../mapbox/map-registry.service';
import {ActivatedRoute} from '@angular/router';
import {IPalette} from '../../../../../src/shared/IPalette';
import {IBasemap} from '../../../../../src/shared/IBasemap';
import {IMapLayer} from '../../../../../src/shared/IMapLayer';
import {DialogsService} from '../../dialogs/dialogs.service';
import {DragulaService} from 'ng2-dragula';

const debug = Debug('tombolo:map-edit-panel');

@Component({
  selector: 'map-info',
  templateUrl: './edit-panel.html',
  styleUrls: ['./edit-panel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditPanelComponent implements OnInit, DoCheck {

  @HostBinding('class.sidebar-component') sidebarComponentClass = true;

  constructor(private mapService: MapService,
              private mapRegistry: MapRegistry,
              private dialogsService: DialogsService,
              private dragulaService: DragulaService,
              private cd: ChangeDetectorRef) {}

  _subs: Subscription[] = [];
  map: TomboloMapboxMap;
  layers: IMapLayer[];
  basemaps: IBasemap[];
  palettes: IPalette[];

  dragulaOptions = {
    moves: (el, container, handle) => {

      return handle.closest('.mat-icon.grab-handle') !== null;
    }
  };

  ngOnInit() {

    // Initial setting of map
    this.mapRegistry.getMap<TomboloMapboxMap>('main-map').then(map => {
      debug('initial settting of map', map.mapLoaded);
      if (map.mapLoaded) {
        this.map = map;
        this.cd.markForCheck();
      }
    });

    this.mapService.loadBasemaps().subscribe(basemaps => {
      this.basemaps = basemaps;
    });

    this.mapService.loadPalettes().subscribe(palettes => {
      this.palettes = palettes;
    });

    this._subs.push(this.mapService.mapLoading$().subscribe(() => {
      debug('Map is loading');
      // Clear map so that child components don't try to access map
      // while it is loading
      this.map = null;
    }));

    // Update when map loaded
    this._subs.push(this.mapService.mapLoaded$().subscribe(map => {
      debug('Edit panel got map', map.id);
      this.map = map;
    }));

    this._subs.push(this.dragulaService.drop.subscribe((value) => {
      this.onDropMapLayer(value);
    }));
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe());
  }

  // Custom change detection to detect layer changes on map
  // due to inserts, deletions etc.
  ngDoCheck() {
    if (this.map && this.map.dataLayers !== this.layers) {
      this.layers = this.map.dataLayers;
      this.cd.markForCheck();
    }
  }

  toggleLayerVisibility(layer: IMapLayer) {
    this.map.setDataLayerVisibility(layer.layerId, !layer.visible);
  }

  deleteLayer(layer: IMapLayer) {
    this.dialogsService
      .confirm('Delete Layer', `Are you sure you want to delete the layer?<p><b>${layer.name}</b>`)
      .filter(result => result)
      .subscribe(() => {
        this.map.removeDataLayer(layer.layerId);
      });
  }

  eyeIconForLayer(layer: IMapLayer): string {
    return layer.visible ? 'eye' : 'eye-off';
  }

  typeIconForLayer(layer: IMapLayer): string {
    switch (layer.layerType) {
      case 'fill':
        return 'polygon';
      case 'line':
        return 'line';
      case 'circle':
        return 'point';
      default:
        return 'point';
    }
  }

  onDropMapLayer(dropPayload) {
    const droppedId = dropPayload[1].id;
    const beforeId = dropPayload[4] && dropPayload[4].id;

    const fromIndex = this.map.dataLayers.findIndex(l => l.layerId === droppedId);
    const toIndex = (beforeId)?  this.map.dataLayers.findIndex(l => l.layerId === beforeId) : 0;

    debug(fromIndex, toIndex);


    const basemap = this.basemaps.find(b => b.id === this.map.basemapId);

    this.map.moveDataLayer(fromIndex, toIndex, basemap);
  }

  // Track function for ngFor - optimises insertions and deletions from layers array
  trackLayerById(index, layer: IMapLayer) {
    return layer.layerId;
  }
}
