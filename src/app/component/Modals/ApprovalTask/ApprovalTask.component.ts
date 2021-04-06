import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PAMServices } from 'src/app/service/PAMServices';
import { KieSettings } from 'src/app/Models/KieSettings/KieSettings';
import { ServiceRequest, ServiceResponse, Part, Applicant, Loan, TaskInstance, Comment } from 'src/app/Models/Requests/Request';
import { CityLocation, Credentials, UserRole } from 'src/app/Models/UserRole';
import { faStar, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-ApprovalTask',
  templateUrl: './ApprovalTask.component.html',
  styleUrls: ['./ApprovalTask.component.css']
})
export class ApprovalTaskComponent implements OnInit {

  taskid: number;
  readonly: boolean = false;
  @Input() currentUser: UserRole;
  cred: Credentials;
  approved: boolean = false;
  message: string;
  commentList: Comment[] = new Array();



  applicant: Applicant;
  loan: Loan;

  kieSettings: KieSettings;
  service: PAMServices;
  faTimesCircle = faTimesCircle;
  faStar = faStar;
  @Input() taskResponse: any;
  @Input() taskInstance: TaskInstance;
  taskName: string;

  caseId: string;

  constructor(public activeModal: NgbActiveModal, pamService: PAMServices) {
    this.service = pamService;
    this.kieSettings = pamService.getCurrentKieSettings();


  }


  ngOnInit(): void {

    this.caseId = this.taskInstance.caseId;
    this.taskid = this.taskResponse["task-id"];
    this.cred = {
      userid: this.currentUser.userid,
      password: this.currentUser.password
    }
    this.taskName = this.taskResponse["task-name"];
    this.applicant = this.taskResponse["task-input-data"].applicant;
    this.loan = this.taskResponse["task-input-data"].loan;
    this.getComments();


  }


  private getComments() {
    this.commentList = new Array();
    
    this.service.getCaseComments(this.caseId).subscribe((res: any) => {
      if (res.comments && res.comments instanceof Array) {
        res.comments.forEach(element => {
          let comment: Comment = {
            commentedDate: element["added-at"]["java.util.Date"],
            message: element.text
          }
          this.commentList.push(comment);
        });

      }
    });
  }


  dismiss() {
    this.activeModal.dismiss();
  }

  onClaimStart() {
    //  this.readonly = false;
    try {
      this.service.updateTaskStatus(this.taskid, "started", this.cred).subscribe(res => {
        this.updateCase();
      }, err => { this.readonly = false })
    } catch (e) {
      this.readonly = true;
      console.error(e);
    }

  }

  updateCase() {
    let postData: object = {}
    if (this.taskName == "Application Review")
      postData = { "stage1_status": "completed" };
    if (this.taskName == "Credit Approval")
      postData = { "stage2_status": "completed" };
    if (this.taskName == "Collect Proof of Income")
      postData = { "stage3_status": "completed" };
    if (this.taskName == "Loan Officer Task")
      postData = { "stage4_status": "completed" };
    if (this.taskName == "Final Approval")
      postData = { "stage5_status": "completed" };
    if (this.taskName == "Precoverage Letter Approval")
      postData = { "stage6_status": "completed" };
    if (this.taskName == "Appraisal Task")
      postData = { "stage7_status": "completed" };
    if (this.taskName == "Title Closing")
      postData = { "stage8_status": "completed" };

    this.service.updateCaseVariables(this.caseId, postData).subscribe((data: any) => {
      console.log("Updated Case File" + JSON.stringify(postData));
      this.service.updateVariables(this.taskid, { "approved": "true" }, this.cred).subscribe((res: any) => {
        this.service.completeTaskAutoProgress(this.taskid, "completed", this.cred).subscribe(res => {
          this.activeModal.close();
        }, err => { this.readonly = false });
      });
    });
  }

  updateStatusAndComplete() {
    this.service.updateVariables(this.taskid, { "taskCompleted": "completed" }, this.cred).subscribe((res: any) => {
      this.onComplete();
    });
  }

  onComplete() {
    this.updateCase();
  }

  addComment() {
    this.service.addCaseComment(this.caseId, this.message).subscribe((res: any) => {
      console.log(res);
      this.getComments();
    });
  }

}
