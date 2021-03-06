import { Injectable } from '@angular/core';
import { MAXIMUM_RGBA_VALUE, Rgba, RGBA_INDEXER } from '@app/ressources/global-variables/rgba';

@Injectable({
    providedIn: 'root',
})
export class ColorSelectionService {
    primaryColor: string;
    secondaryColor: string;

    getRgbaPrimaryColor(): Rgba {
        const slicingIndex = this.primaryColor.indexOf('(') + 1;
        const primaryColor: string = this.primaryColor.slice(slicingIndex);

        const subStrings = primaryColor.split(',');
        const rgba: Rgba = {
            RED: parseInt(subStrings[RGBA_INDEXER.RED], 10),
            GREEN: parseInt(subStrings[RGBA_INDEXER.GREEN], 10),
            BLUE: parseInt(subStrings[RGBA_INDEXER.BLUE], 10),
            ALPHA: parseFloat(subStrings[RGBA_INDEXER.ALPHA]) * MAXIMUM_RGBA_VALUE,
        };

        return rgba;
    }
}
