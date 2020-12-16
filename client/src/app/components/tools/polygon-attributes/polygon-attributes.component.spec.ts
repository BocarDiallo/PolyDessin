import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FILL_STYLES } from '@app/ressources/global-variables/fill-styles';
import { PolygonService } from '@app/services/tools/polygon.service';
import { PolygonAttributesComponent } from './polygon-attributes.component';

// tslint:disable: no-string-literal

describe('PolygonAttributesComponent', () => {
    let component: PolygonAttributesComponent;
    let fixture: ComponentFixture<PolygonAttributesComponent>;
    let polygonServiceSpy: jasmine.SpyObj<PolygonService>;
    const initialToolWidth = 1;
    const finalToolWidth = 5;
    const initialsides = 5;
    const finalsides = 10;

    beforeEach(async(() => {
        polygonServiceSpy = jasmine.createSpyObj('PolygonService', [
            'changeFillStyle',
            'changeWidth',
            'setSides',
            'getWidth',
            'getFillStyle',
            'getSides',
        ]);
        polygonServiceSpy['polygonData'] = {
            type: 'polygon',
            primaryColor: 'blue',
            secondaryColor: 'red',
            fillStyle: FILL_STYLES.FILL_AND_BORDER,
            lineWidth: 1,
            circleHeight: 0,
            circleWidth: 0,
            firstPoint: { x: 0, y: 0 },
            lastPoint: { x: 0, y: 0 },
            sides: 3,
        };

        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [PolygonAttributesComponent],
            providers: [{ provide: PolygonService, useValue: polygonServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PolygonAttributesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call changeWidth of circleService', () => {
        component.changeBorderWidth(finalToolWidth);
        expect(polygonServiceSpy.changeWidth).toHaveBeenCalled();
    });

    it('should change toolWidth', () => {
        component.toolWidth = initialToolWidth;
        component.changeBorderWidth(finalToolWidth);
        expect(component.toolWidth).toBe(finalToolWidth);
    });

    it('should call changeFillStyle of polygonService', () => {
        component.changeFillStyle(finalToolWidth);
        expect(polygonServiceSpy.changeFillStyle).toHaveBeenCalled();
    });

    it('should call changeSides and change the sides', () => {
        component.numberOfSides = initialsides;
        component.changeNumberOfSides(finalsides);
        expect(component.numberOfSides).toBe(finalsides);
    });
});
