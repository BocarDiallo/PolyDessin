import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { STAMPS } from '@app/classes/stamps';
import { StampService } from '@app/services/tools/stamp.service';
import { Subject } from 'rxjs';
import { StampAttributesComponent } from './stamp-attributes.component';
// tslint:disable: no-magic-numbers
describe('StampAttributesComponent', () => {
    let component: StampAttributesComponent;
    let fixture: ComponentFixture<StampAttributesComponent>;
    let stampServiceSpy: jasmine.SpyObj<StampService>;
    let obsAngle: Subject<number>;

    beforeEach(async(() => {
        obsAngle = new Subject<number>();
        stampServiceSpy = jasmine.createSpyObj('StampService', ['getAngle', 'setSize', 'setCurrentStamp', 'setAngle', 'getSize']);
        stampServiceSpy.getAngle.and.returnValue(obsAngle.asObservable());
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [StampAttributesComponent],
            providers: [{ provide: StampService, useValue: stampServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StampAttributesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change angle when subject is trigger', () => {
        obsAngle.next(5);
        expect(component.angle).toEqual(5);
    });

    it('changeSize should change toolSize and stampSize', () => {
        component.changeSize(10);
        expect(component.toolSize).toEqual(10);
        expect(stampServiceSpy.setSize).toHaveBeenCalled();
    });

    it('changeStamp should change currentStamp', () => {
        const stampData = STAMPS.ANGULAR;
        component.changeStamp(stampData);
        expect(stampServiceSpy.setCurrentStamp).toHaveBeenCalledWith(stampData);
    });

    it('changeAngle should change angle and stampService angle', () => {
        component.changeAngle(30);
        expect(stampServiceSpy.setAngle).toHaveBeenCalled();
        expect(component.angle).toEqual(30);
    });
});
