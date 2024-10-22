import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import * as PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { ITemplateObject } from '../interfaces/template-object';
const expressionParser = require("docxtemplater/expressions.js");

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private documentSubject = new Subject<Blob>()
  private templateArrayBuffer: ArrayBuffer | undefined;
  public documentObservable = this.documentSubject.asObservable();

  constructor(private httpClient: HttpClient) { }

  public generate(form: ITemplateObject): void {
    if (this.templateArrayBuffer) {
      this.createAndNextDocument(this.templateArrayBuffer, form);
    } else {
      this.httpClient.get('assets/InnSpire-cv-template.docx', {
        responseType: 'arraybuffer'
      }).subscribe((arrayBuffer) => {
        this.templateArrayBuffer = arrayBuffer;
        this.createAndNextDocument(arrayBuffer, form)
      });
    }
  }

  public updateTemplate(templateArrayBuffer: ArrayBuffer, formValue: ITemplateObject): void {
    this.templateArrayBuffer = templateArrayBuffer;
    this.createAndNextDocument(templateArrayBuffer, formValue);
  }

  private createAndNextDocument(templateArrayBuffer: ArrayBuffer, form: ITemplateObject) {
    const zip = new PizZip(templateArrayBuffer);
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        parser: expressionParser
    });

    const newForm = {
      ...form,
      experiences: [...form.experiences].reverse(),
      educations: [...form.educations].reverse()
    }

    doc.render(newForm);
    const uInt8Array: Uint8Array = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
    });

    this.documentSubject.next(new Blob([uInt8Array]));
  }
}
