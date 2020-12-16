import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MAXIMUM_NUMBER_OF_COLORS, MAX_OPACITY } from '@app/ressources/global-variables/global-variables';
import { MAXIMUM_RGBA_VALUE } from '@app/ressources/global-variables/rgba';
import { ColorSelectionService } from '@app/services/color-selection/color-selection.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { PipetteService } from '@app/services/tools/pipette.service';
@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent implements AfterViewInit {
    @ViewChild('primary', { read: ElementRef }) primaryColorElement: ElementRef;
    @ViewChild('secondary', { read: ElementRef }) secondaryColorElement: ElementRef;
    primaryColor: string = '#000000';
    secondaryColor: string = '#000000';
    colors: string[] = ['#000000'];
    primaryOpacity: number = MAX_OPACITY;
    secondaryOpacity: number = MAX_OPACITY;

    constructor(public colorSelectionService: ColorSelectionService, public hotkeyService: HotkeyService, public pipetteService: PipetteService) {
        this.colorSelectionService.primaryColor = this.hexToRGBA(this.primaryColor, this.primaryOpacity);
        this.colorSelectionService.secondaryColor = this.hexToRGBA(this.secondaryColor, this.secondaryOpacity);
    }

    @HostListener('keyup', ['$event'])
    onInput(e: KeyboardEvent): void {
        e.stopPropagation();
    }

    changePrimaryColor(color: string): void {
        this.primaryColor = color;
        this.colors.unshift(this.primaryColor);
        if (this.colors.length > MAXIMUM_NUMBER_OF_COLORS) {
            this.colors.pop();
        }
        this.colorSelectionService.primaryColor = this.hexToRGBA(color, this.primaryOpacity);
    }

    changeSecondaryColor(color: string): void {
        this.secondaryColor = color;
        this.colors.unshift(this.secondaryColor);
        if (this.colors.length > MAXIMUM_NUMBER_OF_COLORS) {
            this.colors.pop();
        }
        this.colorSelectionService.secondaryColor = this.hexToRGBA(color, this.secondaryOpacity);
    }

    swapColors(): void {
        const temp: string = this.primaryColor;
        this.primaryColor = this.secondaryColor;
        this.secondaryColor = temp;
        this.colorSelectionService.primaryColor = this.hexToRGBA(this.primaryColor, this.primaryOpacity);
        this.colorSelectionService.secondaryColor = this.hexToRGBA(this.secondaryColor, this.secondaryOpacity);
    }

    decrementPrimaryOpacity(): void {
        if (this.primaryOpacity > 0) {
            --this.primaryOpacity;
        }
        this.colorSelectionService.primaryColor = this.hexToRGBA(this.primaryColor, this.primaryOpacity);
    }

    incrementPrimaryOpacity(): void {
        if (this.primaryOpacity < MAX_OPACITY) {
            ++this.primaryOpacity;
        }
        this.colorSelectionService.primaryColor = this.hexToRGBA(this.primaryColor, this.primaryOpacity);
    }

    decrementSecondaryOpacity(): void {
        if (this.secondaryOpacity > 0) {
            --this.secondaryOpacity;
        }
        this.colorSelectionService.secondaryColor = this.hexToRGBA(this.secondaryColor, this.secondaryOpacity);
    }

    incrementSecondaryOpacity(): void {
        if (this.secondaryOpacity < MAX_OPACITY) {
            ++this.secondaryOpacity;
        }
        this.colorSelectionService.secondaryColor = this.hexToRGBA(this.secondaryColor, this.secondaryOpacity);
    }

    changePrimaryOpacity(opacity: number, event: KeyboardEvent): void {
        event.stopPropagation();
        if (isNaN(opacity) || opacity < 0 || opacity > MAX_OPACITY || opacity.toString() === '') {
            this.primaryOpacity = MAX_OPACITY;
            this.colorSelectionService.primaryColor = this.hexToRGBA(this.primaryColor, this.primaryOpacity);
            alert("L'opacité doit être un nombre entre 0 et 100.");
        } else {
            this.primaryOpacity = opacity;
            this.colorSelectionService.primaryColor = this.hexToRGBA(this.primaryColor, this.primaryOpacity);
        }
    }

    changeSecondaryOpacity(opacity: number, event: KeyboardEvent): void {
        event.stopPropagation();
        if (isNaN(opacity) || opacity < 0 || opacity > MAX_OPACITY || opacity.toString() === '') {
            this.secondaryOpacity = MAX_OPACITY;
            alert("L'opacité doit être un nombre entre 0 et 100.");
        } else {
            this.secondaryOpacity = opacity;
        }
        this.colorSelectionService.secondaryColor = this.hexToRGBA(this.secondaryColor, this.secondaryOpacity);
    }

    restorePreviousColor(color: string, isPrimary: boolean): void {
        if (isPrimary) {
            this.primaryColor = color;
            this.colorSelectionService.primaryColor = this.hexToRGBA(color, this.primaryOpacity);
        } else {
            this.secondaryColor = color;
            this.colorSelectionService.secondaryColor = this.hexToRGBA(color, this.secondaryOpacity);
        }
    }

    hexToRGBA(color: string, opacity: number): string {
        const SLICING_END = 16;
        const SLICING_START_R_1 = -6;
        const SLICING_START_R_2 = -4;
        const SLICING_START_G_1 = -4;
        const SLICING_START_G_2 = -2;
        const SLICING_START_B = -2;
        const r: number = parseInt(color.slice(SLICING_START_R_1, SLICING_START_R_2), SLICING_END);
        const g: number = parseInt(color.slice(SLICING_START_G_1, SLICING_START_G_2), SLICING_END);
        const b: number = parseInt(color.slice(SLICING_START_B), SLICING_END);
        const rgba: string = 'rgba(' + r + ',' + g + ',' + b + ',' + (opacity / MAX_OPACITY).toString() + ')';
        return rgba;
    }

    ngAfterViewInit(): void {
        this.pipetteService.primaryColor.subscribe((data: string[]) => {
            this.changePrimaryColor(data[0]);
            this.primaryOpacity = Math.round((Number(data[1]) / MAXIMUM_RGBA_VALUE) * MAX_OPACITY);
            const primary = this.primaryColorElement.nativeElement;
            primary.value = data[0];
        });
        this.pipetteService.secondaryColor.subscribe((data: string[]) => {
            this.changeSecondaryColor(data[0]);
            this.secondaryOpacity = Math.round((Number(data[1]) / MAXIMUM_RGBA_VALUE) * MAX_OPACITY);
            const secondary = this.secondaryColorElement.nativeElement;
            secondary.value = data[0];
        });
    }

    onFocus(): void {
        this.hotkeyService.isHotkeyEnabled = false;
    }

    onFocusOut(): void {
        this.hotkeyService.isHotkeyEnabled = true;
    }
}
