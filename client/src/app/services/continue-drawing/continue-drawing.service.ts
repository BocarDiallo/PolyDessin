import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from '@app/services/database/database.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeDrawingService } from '@app/services/resize-drawing/resize-drawing.service';
import { ServerResponseService } from '@app/services/server-response/server-response.service';
import { DBData } from '@common/communication/drawing-data';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ContinueDrawingService {
    isLastDrawing: boolean = false;
    destroy$: Subject<boolean> = new Subject<boolean>();
    filteredMetadata: DBData[] = [];
    currentRoute: string;
    checkOldDrawing: boolean;
    width: number;
    private isDrawingLoaded: boolean = false;

    constructor(
        public drawingService: DrawingService,
        public resizeDrawingService: ResizeDrawingService,
        public router: Router,
        public serverResponseService: ServerResponseService,
        public databaseService: DatabaseService,
    ) {}

    continueDrawing(): void {
        const sourceDrawingURI = localStorage.getItem('drawingKey') as string;
        const savedCanvasWidth = Number(localStorage.getItem('canvasWidth'));
        const savedCanvasHeight = Number(localStorage.getItem('canvasHeight'));
        this.convertURIToImageData(sourceDrawingURI, savedCanvasWidth, savedCanvasHeight);
    }

    async convertURIToImageData(URI: string, savedCanvasWidth: number, savedCanvasHeight: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (URI == null) return reject();
            const context = this.drawingService.baseCtx;
            const image = new Image();
            image.src = URI;
            image.addEventListener(
                'load',
                () => {
                    if (!this.isDrawingLoaded) {
                        this.resizeDrawingService.resizeCanvasSize(savedCanvasWidth, savedCanvasHeight);
                        context.drawImage(image, 0, 0, savedCanvasWidth, savedCanvasHeight);
                        resolve();
                        this.isDrawingLoaded = true;
                    }
                },
                false,
            );
        });
    }

    loadOldDrawing(): boolean {
        this.isDrawingLoaded = false;
        this.drawingService.isLastDrawing = localStorage.length > 0;
        this.router.navigateByUrl('/editor');
        return this.isLastDrawing;
    }

    setLastDrawing(): void {
        this.drawingService.isLastDrawing = localStorage.length > 0;
    }

    unlockContinueDrawing(): void {
        this.drawingService.isLastDrawing = false;
    }

    clearCanvas(): void {
        this.drawingService.clearCanvas(this.drawingService.baseCtx);
    }
}
