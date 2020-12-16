import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FILL_STYLES } from '@app/ressources/global-variables/fill-styles';
import { CircleService } from '@app/services/tools/circle.service';
import { CircleAttributesComponent } from './circle-attributes.component';

// tslint:disable: no-string-literal

describe('CircleAttributesComponent', () => {
    let component: CircleAttributesComponent;
    let fixture: ComponentFixture<CircleAttributesComponent>;
    let circleServiceSpy: jasmine.SpyObj<CircleService>;
    const initialToolWidth = 1;
    const finalToolWidth = 5;

    beforeEach(async(() => {
        circleServiceSpy = jasmine.createSpyObj('CircleService', ['changeWidth', 'changeFillStyle', 'getFillStyle', 'setFillStyle', 'getLineWidth']);
        circleServiceSpy['ellipseData'] = {
            type: 'ellipse',
            primaryColor: 'red',
            secondaryColor: 'blue',
            center: { x: 0, y: 0 },
            radius: { x: 0, y: 0 },
            fillStyle: FILL_STYLES.FILL_AND_BORDER,
            isShiftDown: false,
            lineWidth: 1,
            firstPoint: { x: 0, y: 0 },
            lastPoint: { x: 0, y: 0 },
        };

        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [CircleAttributesComponent],
            providers: [{ provide: CircleService, useValue: circleServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CircleAttributesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call changeWidth of circleService', () => {
        component.changeBorderWidth(finalToolWidth);
        expect(component.circleService.changeWidth).toHaveBeenCalled();
    });

    it('should change toolWidth', () => {
        component.toolWidth = initialToolWidth;
        component.changeBorderWidth(finalToolWidth);
        expect(component.toolWidth).toBe(finalToolWidth);
    });

    it('should call changeFillStyle of circleService', () => {
        component.changeFillStyle(finalToolWidth);
        expect(component.circleService.setFillStyle).toHaveBeenCalled();
    });
});
