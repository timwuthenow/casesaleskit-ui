import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonPipe } from '@angular/common';
import { CookieModule } from 'ngx-cookie';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { HighlightModule, HIGHLIGHT_OPTIONS,HighlightOptions } from 'ngx-highlightjs';

import { MainComponentComponent } from 'src/app/component/main-component/main-component.component';
import { KieSettingsComponent } from 'src/app/component/Modals/KieSettings/KieSettings.component';
import { ConfigureComponent } from 'src/app/component/Configure/Configure.component';
import { AddStepComponent } from 'src/app/component/Modals/AddStep/AddStep.component';
import { ApprovalTaskComponent } from 'src/app/component/Modals/ApprovalTask/ApprovalTask.component';
import { ApplicantComponent } from 'src/app/component/Applicant/Applicant.component';
import { CaseAdministrationComponent } from 'src/app/component/CaseAdministration/CaseAdministration.component';
import { TaskApproverComponent } from 'src/app/component/TaskApprover/TaskApprover.component';
import { CompletedProcessInstanceComponent } from 'src/app/component/Modals/completed-process-instance/completed-process-instance.component';
import { UpdateDueDateComponent } from 'src/app/component/Modals/UpdateDueDate/UpdateDueDate.component';
 
@NgModule({
  declarations: [
    AppComponent,
    MainComponentComponent,
    ApplicantComponent,
    KieSettingsComponent,
    ConfigureComponent,
    AddStepComponent,
    CaseAdministrationComponent,
    TaskApproverComponent,
    ApprovalTaskComponent,
    CompletedProcessInstanceComponent,
    UpdateDueDateComponent
  ],
  imports: [
    BrowserModule,
    HighlightModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    NgbModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    CookieModule.forRoot()
  ],
  providers: [JsonPipe,{
    provide: HIGHLIGHT_OPTIONS,
    useValue: {
      coreLibraryLoader: () => import('highlight.js/lib/core'),
      languages: {
        xml: () => import('highlight.js/lib/languages/xml'),
        typescript: () => import('highlight.js/lib/languages/typescript'),
        scss: () => import('highlight.js/lib/languages/scss'),
        json: () => import('highlight.js/lib/languages/json'),
        css: () => import('highlight.js/lib/languages/css')
      }
    }
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
