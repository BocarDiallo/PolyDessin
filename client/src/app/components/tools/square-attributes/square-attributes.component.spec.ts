import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FILL_STYLES } from '@app/ressources/global-variables/fill-styles';
import { SquareService } from '@app/services/tools/square.service';
import { SquareAttributesComponent } from './square-attributes.component';

describe('SquareAttributesComponent', () => {
    let component: SquareAttributesComponent;
    let fixture: ComponentFixture<SquareAttributesComponent>;
    let squareServiceSpy: jasmine.SpyObj<SquareService>;
    const initialToolWidth = 1;
    const finalToolWidth = 5;

    beforeEach(async(() => {
        squareServiceSpy = jasmine.createSpyObj('SquareService', ['changeWidth', 'setFillStyle']);
        squareServiceSpy.rectangleData = {
            type: 'rectangle',
            primaryColor: 'red',
            secondaryColor: 'blue',
            height: 0,
            width: 0,
            topLeftPoint: { x: 0, y: 0 },
            fillStyle: FILL_STYLES.FILL_AND_BORDER,
            isShiftDown: false,
            lineWidth: 1,
        };

        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [SquareAttributesComponent],
            providers: [{ provide: SquareService, useValue: squareServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SquareAttributesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call changeWidth of circleService', () => {
        component.changeBorderWidth(finalToolWidth);
        expect(component.squareService.changeWidth).toHaveBeenCalled();
    });

    it('should change toolWidth', () => {
        component.toolWidth = initialToolWidth;
        component.changeBorderWidth(finalToolWidth);
        expect(component.toolWidth).toBe(finalToolWidth);
    });

    it('should call changeFillStyle of circleService', () => {
        component.changeFillStyle(finalToolWidth);
        expect(component.squareService.setFillStyle).toHaveBeenCalled();
    });
});
