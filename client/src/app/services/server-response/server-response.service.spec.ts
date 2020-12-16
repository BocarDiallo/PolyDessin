/* tslint:disable:no-unused-variable */

import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServerResponseService } from './server-response.service';
import SpyObj = jasmine.SpyObj;

describe('Service: ServerResponse', () => {
    let snackBarSpy: SpyObj<MatSnackBar>;
    let service: ServerResponseService;

    beforeEach(() => {
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        TestBed.configureTestingModule({
            providers: [{ provide: MatSnackBar, useValue: snackBarSpy }],
        });
        service = TestBed.inject(ServerResponseService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should open loadError snackBar', () => {
        service.loadErrorSnackBar();
        expect(snackBarSpy.open).toHaveBeenCalled();
    });

    it('should open saveErrorSnackBar snackBar', () => {
        service.saveErrorSnackBar();
        expect(snackBarSpy.open).toHaveBeenCalled();
    });

    it('should open deleteErrorSnackBar snackBar', () => {
        service.deleteErrorSnackBar();
        expect(snackBarSpy.open).toHaveBeenCalled();
    });

    it('should open saveConfirmSnackBar snackBar', () => {
        service.saveConfirmSnackBar();
        expect(snackBarSpy.open).toHaveBeenCalled();
    });

    it('should open sendMailConfirmSnackBar', () => {
        service.sendMailConfirmSnackBar();
        expect(snackBarSpy.open).toHaveBeenCalled();
    });

    it('should open sendMailErrorSnackBar', () => {
        service.sendMailErrorSnackBar();
        expect(snackBarSpy.open).toHaveBeenCalled();
    });
});
