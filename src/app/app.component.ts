import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

export interface IUser {
  firstName? : string;
  lastName? : string;
  email?: string;
  username : string;
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  uploadFileName: string = '';
  CSVUploadForm: FormGroup;
  fileExtension: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  isUploadable: boolean = false;
  isUploadSuccessful: boolean = false;
  successCount: number;
  failureCount: number;
  fileMap: any;
  loading: boolean;
  data: string;
  rows: string[];
  row: string[];
  records: IUser[] = [];
  userActiveTab: string;
  activeTab: string;
  totalRecords: number;
  userType: string = ''

  constructor(public _formBuilder: FormBuilder) {
    this.fileMap = {};
  }

  ngOnInit(): void {

    this.CSVUploadForm = this._formBuilder.group({
      uploadCSV: [null],
    });
  }

  fileSelect(event) {
    this.isUploadSuccessful = false;
    if (event.target.files.length == 0) {
      this.fileMap[0] = "";
    } else {
      let filename = event.target.files[0].name;
      this.uploadFileName = filename;
      this.fileMap[0] = event.target.files[0];
      this.fileExtension = filename.substring(filename.lastIndexOf(".") + 1, filename.length);
      let uploadedFileSize = parseInt(event.target.files[0].size);
      if (this.fileExtension.toLocaleLowerCase() != 'csv') {
        alert('Uploaded File Must Be CSV')
      } else {
        this.readCSV(event.target.files[0]);
      }
    }
  }

  readCSV(selectedFile: any): void {
    let othis = this;
    let readFile = function () {
      var reader = new FileReader();
      reader.readAsText(selectedFile);

      return new Promise(function (resolve, reject) {
        reader.onload = function (e) {
          resolve(reader.result);
        }
      });
    };

    readFile().then(function (result) {
      othis.showCSVPreview(result);
    });
  }

  showCSVPreview(data: any) {
    this.data = data;
    let othis = this;
    this.rows = this.data.split(/\r\n|\n/);
    this.totalRecords = this.getRecordCount(this.rows);
    this.row = this.rows[0].split(',');

    if (this.totalRecords > 1001) {
      alert('Record exceeds limit')
      this.resetSelection();
    } else {
      if (this.row.length > 4 || (this.row[0].trim() != 'firstname' || this.row[1].trim() != 'lastname' || this.row[2].trim() != 'email' || this.row[3].trim() != 'username')) {
        alert('invalid csv');
        this.resetSelection();
      } else {
        this.isUploadable = true;

        let headerLength = this.row.length;

        let iterator: number;
        if (this.rows.length > 11) {
          iterator = 11;
        } else {
          iterator = this.rows.length;
        }

        for (let i = 1; i < iterator; i++) {
          if (this.rows[i] == "") {
            continue;
          }
          let rec = this.rows[i].split(',');
          let data: IUser = { 'firstName': rec[0].trim(), 'lastName': rec[1].trim(), 'email': rec[2].trim(), 'username': rec[3].trim() };
          this.records.push(data);
        }
      }
    }
  }

  getRecordCount(records: any[]): number {
    let lines = 0;
    for (let i = 0; i < records.length; i++) {
      if (records[i] == "") {
        continue;
      } else {
        lines++;
      }
    }
    return lines;
  }

  resetSelection() {
    this.CSVUploadForm.setValue({ uploadCSV :null });
    this.records = [];
    this.rows = [];
    this.row = [];
    this.isUploadable = false;
    this.isUploadSuccessful = false;
    this.uploadFileName = '';
}
}

