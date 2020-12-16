import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { CarouselComponent } from '@app/components/carousel/carousel.component';
import { MainPageComponent } from '@app/components/main-page/main-page.component';
import { ContinueDrawingService } from '@app/services/continue-drawing/continue-drawing.service';

import SpyObj = jasmine.SpyObj;

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let matDialogSpy: SpyObj<MatDialog>;
    let continueDrawingSpy: SpyObj<ContinueDrawingService>;

    beforeEach(async(() => {
        matDialogSpy = jasmine.createSpyObj('dialog', ['open']);
        continueDrawingSpy = jasmine.createSpyObj('ContinueDrawingService', ['loadOldDrawing', 'unlockContinueDrawing']);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule],
            declarations: [MainPageComponent],
            providers: [
                { provide: MatDialog, useValue: matDialogSpy },
                { provide: ContinueDrawingService, useValue: continueDrawingSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("should have as title 'PolyDessin'", () => {
        expect(component.title).toEqual('PolyDessin');
    });

    it('should call open of MatDialog', () => {
        component.openUserguide();
        expect(matDialogSpy.open).toHaveBeenCalled();
    });

    it('should open carousel component on call', () => {
        component.openCarousel();
        expect(matDialogSpy.open).toHaveBeenCalledWith(CarouselComponent);
    });

    it('should load old drawing', () => {
        component.loadOldDrawing();
        expect(continueDrawingSpy.loadOldDrawing).toHaveBeenCalled();
    });

    it('should continueDrawing', () => {
        component.unlockContinueDrawing();
        expect(continueDrawingSpy.unlockContinueDrawing).toHaveBeenCalled();
    });

    it('should return print button true if local storage has key', () => {
        const keySpy = spyOn(localStorage, 'getItem').and.returnValue('yes');
        component.isContinueDrawingEnable();
        expect(component.isContinueDrawingEnable()).toBeTruthy();
        expect(keySpy).toHaveBeenCalled();
    });

    it('should return print button false if local storage hasnt the key', () => {
        const keySpy = spyOn(localStorage, 'getItem').and.returnValue(null);
        component.isContinueDrawingEnable();
        expect(component.isContinueDrawingEnable()).toBeFalsy();
        expect(keySpy).toHaveBeenCalled();
    });
});
