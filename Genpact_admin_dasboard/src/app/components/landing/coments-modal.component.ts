import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-comments',
    template: `
        <div class="mandate-main modal-header">
            <h5 class="h5-heading">COMMENTS</h5>
            <button type="button" class="close pull-right cst-cls1" aria-label="Close" (click)="modalRef.hide()">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <textarea #commentId rows="3" style="width:100%" [(ngModel)]="comment" name="comment"></textarea>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn cancel-btn"
                (click)="modalRef.hide()">Cancel</button>
            <button type="button" [disabled]="!commentId.value" class="btn proceed-btn" (click)="proceedToReject()">Reject</button>
        </div>
    `
})

export class CommentsModalComponent implements OnInit {
    @Output() action = new EventEmitter();
    comment: any;

    constructor(public modalRef: BsModalRef) { }

    ngOnInit() { }

    proceedToReject() {
        this.action.emit(this.comment);
        this.modalRef.hide();
    }
}
