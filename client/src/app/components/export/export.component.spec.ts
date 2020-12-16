import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FILTER_STYLES } from '@app/ressources/global-variables/filter';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EmailService } from '@app/services/email/email.service';
import { ServerResponseService } from '@app/services/server-response/server-response.service';
import { TextService } from '@app/services/tools/text.service';
import { Subject } from 'rxjs';
import { ExportComponent } from './export.component';

import SpyObj = jasmine.SpyObj;
describe('ExportComponent', () => {
    let component: ExportComponent;
    let fixture: ComponentFixture<ExportComponent>;
    let drawingServiceStub: DrawingService;
    let canvasStub: HTMLCanvasElement;
    let filterCanvasStub: HTMLCanvasElement;
    let dialogSpy: SpyObj<MatDialogRef<ExportComponent>>;
    let sendMailObservable: Subject<void>;
    let textServiceSpy: SpyObj<TextService>;
    let emailServiceSpy: SpyObj<EmailService>;
    let serverResponseServiceSpy: SpyObj<ServerResponseService>;
    let matDialogSpy: SpyObj<MatDialog>;
    const WIDTH = 100;
    const HEIGHT = 100;

    beforeEach(async(() => {
        drawingServiceStub = {} as DrawingService;
        sendMailObservable = new Subject<void>();
        emailServiceSpy = jasmine.createSpyObj('EmailService', ['sendMail']);
        serverResponseServiceSpy = jasmine.createSpyObj('ServerResponseService', ['sendMailConfirmSnackBar', 'sendMailErrorSnackBar']);
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['closeAll', 'open']);
        dialogSpy = jasmine.createSpyObj('dialogRef', ['close']);
        textServiceSpy = jasmine.createSpyObj('TextService', ['createText']);
        emailServiceSpy.sendMail.and.returnValue(sendMailObservable.asObservable());
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [ExportComponent],
            providers: [
                { provide: EmailService, useValue: emailServiceSpy },
                { provide: DrawingService, useValue: drawingServiceStub },
                { provide: MatDialogRef, useValue: dialogSpy },
                { provide: TextService, useValue: textServiceSpy },
                { provide: ServerResponseService, useValue: serverResponseServiceSpy },
                { provide: MatDialog, useValue: matDialogSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        canvasStub = canvas;

        const filter = document.createElement('canvas') as HTMLCanvasElement;
        filter.width = WIDTH;
        filter.height = HEIGHT;
        filterCanvasStub = filter;

        // tslint:disable-next-line: no-string-literal
        component['drawingService'].canvas = canvasStub;
        component.filterCanvas = filterCanvasStub;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call createText if is the tool text', () => {
        textServiceSpy.isNewText = true;
        component.ngOnInit();
        expect(textServiceSpy.createText).toHaveBeenCalled();
    });

    it('should change name', () => {
        const name = 'marie';
        component.changeName(name);
        expect(component.name).toEqual(name);
    });

    it('should change filter when changing the value', () => {
        const value = FILTER_STYLES.BLACK_AND_WHITE;
        const target = ({
            value,
        } as unknown) as HTMLInputElement;

        const event = ({
            target,
        } as unknown) as InputEvent;

        const filterName = component.differentFilter[value];
        const canvasWithFilter = component.drawingService.canvas;
        canvasWithFilter.style.filter = filterName;
        const url = canvasWithFilter.toDataURL();

        component.changeFilter(event);
        expect(component.imagesrc).toEqual(url);
    });

    it('should give the url of the filter canvas', () => {
        const value = 0;
        const target = ({
            value,
        } as unknown) as HTMLInputElement;

        const event = ({
            target,
        } as unknown) as InputEvent;

        const typeOfUrl = component.extension[value];
        const urlTest = component.filterCanvas.toDataURL(typeOfUrl);

        component.getImageUrl(event);
        expect(component.urlImage).toEqual(urlTest);
    });

    it('should call the function click and close the modal when the name is correct', () => {
        component.name = 'cercle';
        const clickSpy = spyOn(component.link, 'click');
        component.exportLocally();
        expect(clickSpy).toHaveBeenCalled();
        expect(dialogSpy.close).toHaveBeenCalled();
    });

    it('should not call the function click and close the modal when the name is to long', () => {
        component.name = 'cercle_rouge_2014';
        const clickSpy = spyOn(component.link, 'click');
        component.exportLocally();
        expect(clickSpy).not.toHaveBeenCalled();
        expect(dialogSpy.close).not.toHaveBeenCalled();
    });

    it('should send mail and open success modal on correct call', () => {
        component.sendMail();
        sendMailObservable.next();
        expect(serverResponseServiceSpy.sendMailConfirmSnackBar).toHaveBeenCalled();
    });

    it('should send mail and open error modal on incorrect call', () => {
        component.sendMail();
        sendMailObservable.error('err');
        expect(serverResponseServiceSpy.sendMailErrorSnackBar).toHaveBeenCalled();
    });
});
