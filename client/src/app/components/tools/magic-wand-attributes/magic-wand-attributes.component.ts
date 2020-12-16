import { Component } from '@angular/core';
import { MagicWandService } from '@app/services/tools/selection-services/magic-wand.service';

@Component({
    selector: 'app-magic-wand-attributes',
    templateUrl: './magic-wand-attributes.component.html',
    styleUrls: ['./magic-wand-attributes.component.scss'],
})
export class MagicWandAttributesComponent {
    constructor(public magicWandService: MagicWandService) {}
}
