import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Subject, tap } from 'rxjs';
import * as PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { ITemplateObject } from '../interfaces/template-object';
const expressionParser = require("docxtemplater/expressions.js");

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private photo: File | undefined;
  private documentSubject = new Subject<Blob>()
  private templateArrayBuffer: ArrayBuffer | undefined;
  private mappingValues: ITemplateObject = {
    firstname: '',
    lastname: '',
    role: '',
    birthdate: '',
    city: '',
    phone: '',
    mail: '',
    linkedin: '',
    motivation: '',
    emailManager: '',
    phoneManager: '',
    hobbyDescription: '',
    methods: [],
    tools: [],
    certificates: [],
    languages: [],
    experiences: [],
    educations: []
  };
  public documentObservable = this.documentSubject.asObservable();

  constructor(private httpClient: HttpClient) {
  }

  public updateMappings(mappings: ITemplateObject): void {
    this.mappingValues = mappings;
    this.createAndNextDocument();
  }

  public updatePhoto(photo: File): void {
    this.photo = photo;
    this.createAndNextDocument();
  }

  public updateTemplate(templateArrayBuffer: ArrayBuffer): void {
    this.templateArrayBuffer = templateArrayBuffer;
    this.createAndNextDocument();
  }

  private async setDefaultTemplate(): Promise<void> {
    await firstValueFrom(this.httpClient.get('assets/InnSpire-cv-template.docx', {
      responseType: 'arraybuffer'
    }).pipe(
      tap((arrayBuffer) => {
        this.templateArrayBuffer = arrayBuffer;
      })
    ));
    return;
  }

  private async createAndNextDocument(): Promise<void> {
    if (!this.templateArrayBuffer) {
      await this.setDefaultTemplate();
      this.createAndNextDocument();
      return;
    }
    const zip = new PizZip(this.templateArrayBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      parser: expressionParser
    });

    const newForm = {
      ...this.mappingValues,
      experiences: [...this.mappingValues.experiences].reverse(),
      educations: [...this.mappingValues.educations].reverse()
    }

    doc.render(newForm);
    const docZip = doc.getZip();
    if (this.photo) {
      const mediaFolder = docZip.folder('word').folder('media');
      mediaFolder.file('image1.png', await this.photo.arrayBuffer());
    }
    const uInt8Array: Uint8Array = docZip.generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    this.documentSubject.next(new Blob([uInt8Array]));
  }
}
