# InnspireCvGenerator

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.0.4.
You can generate InnSpire CV's with this application.
The generates file will be a zip, containing a .docx and a .json file.
The .json file can be used to re-import your CV variables into the application, could be useful for changing your CV in the future.


## Development server

Run `npm start` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `npm run test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Deploying

Run `npm i -g firebase-tools` if you don't have the firebase cli already.
Run `firebase login` if you are not logged in already.

Run `npm run build` to build the project.
Run `firebase deploy --only hosting`. You may need permission, contact Jeremy Pietersz for this at `jeremy.pietersz@innspire.nl`.
