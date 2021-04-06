import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ProcessInstanceList, TaskInstanceList, TaskInstance, Template, Step } from '../../Models/Requests/Request';
import { UserRole } from 'src/app/Models/UserRole';
import { PAMServices } from 'src/app/service/PAMServices';
import { faCheckCircle, faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import { UpdateDueDateComponent } from '../Modals/UpdateDueDate/UpdateDueDate.component';

@Component({
  selector: 'app-CaseAdministration',
  templateUrl: './CaseAdministration.component.html',
  styleUrls: ['./CaseAdministration.component.css']
})
export class CaseAdministrationComponent implements OnInit {

  closeResult: string;
  name: string;
  @ViewChild("svgContent") svgContentElement: ElementRef;
  @ViewChild("svgContentClosed") svgContentElementClosed: ElementRef;
  @Input() user: UserRole;
  activeProcessInstances: ProcessInstanceList[] = new Array();
  closedProcessInstances: ProcessInstanceList[] = new Array();
  activeManagerTasks: TaskInstanceList = {
    instanceList: new Array()
  };
  svgContent: string;
  allowSvgContent: boolean = false;
  allowShowStep: boolean = false;
  service: PAMServices;
  templates: Template[];
  currentTemplate: Template;
  stageMap: Map<string, Step>;

  faCheckCircle = faCheckCircle;
  faHourglass = faChalkboardTeacher;



  constructor(private modalService: NgbModal, service: PAMServices) {
    this.service = service;
    this.getCaseList();
  }

  ngOnInit() {
    this.templates = this.service.getTemplates();
    this.stageMap = this.service.getStageMap();
  }

  getCaseList() {
    this.activeProcessInstances = new Array();
    this.activeManagerTasks.instanceList = new Array();
    this.service.getCaseInstances("Active").subscribe((res: any) => {
      this.buildCaseList(res, this.activeProcessInstances, "Active");
    }, err => { console.log(err) });
  }


  private buildCaseList(response: any, caseList: ProcessInstanceList[], type: string) {
    let currentStatus = "Active";
    if (type != "Active")
      currentStatus = "Completed";

    if (response["instances"] && response["instances"] instanceof Array) {
      response["instances"].forEach((instance: any) => {

     
  

        let processInstance: ProcessInstanceList = {
          caseId: instance["case-id"],
          status: currentStatus,
          startedDate: instance["case-started-at"],
          dueDate: instance["case-sla-due-date"]
        }
        this.service.getProcessInstanceForCase(processInstance.caseId, null).subscribe((data: any) => {
          if (data["process-instance"] instanceof Array) {
            let instanceID = data["process-instance"][0]["process-instance-id"]
            processInstance.processInstanceId = instanceID;
          }
        })
        if (instance["case-definition-id"] == this.service.getCurrentKieSettings().processId)
            caseList.push(processInstance);
      });
      caseList = caseList.sort((a: ProcessInstanceList, b: ProcessInstanceList) => {
        if (a.processInstanceId >= b.processInstanceId)
          return -1;
        else
          return 1;
      });

      setTimeout(() => {
        if (type == "Active")
          this.buildVariablesList(caseList);
      }, 1000);
    }
  }

  private buildVariablesList(caseList: ProcessInstanceList[]) {
    caseList.forEach((currentInstance: ProcessInstanceList) => {
      this.service.getCaseVariables(currentInstance.caseId).subscribe((res: any) => {
        this.mapVariableNameValue(res, currentInstance);
        this.onGetActiveTask(currentInstance.processInstanceId, this.user.userid, currentInstance.caseId);
      }, err => {

      });
    });

  }

  private mapVariableNameValue(res: any, caseInstance: ProcessInstanceList) {
    if (res.instances instanceof Array) {
      res.instances.forEach((element: any) => {
        if (element.name == "templateName")
          this.setTemplate(element.value, caseInstance);
      });

    }
  }

  private setTemplate(templateName: string, caseInstance: ProcessInstanceList) {
    this.templates.forEach((rec: Template) => {
      if (rec.name == templateName)
        caseInstance.template = JSON.parse(JSON.stringify(rec));
    });
    if (caseInstance.template === undefined)
      caseInstance.template = JSON.parse(JSON.stringify(this.templates[0]));
  }

  private analyzeNodes(caseInstance: ProcessInstanceList, result: any) {

    if (result && result["node-instance"] && result["node-instance"] instanceof Array) {
      console.log(result["node-instance"]);
      let template: Template = caseInstance.template;
      console.log(template);
      template.steps.forEach((step: Step) => {
        for (let i = 0; i < result["node-instance"].length; i++) {
          var node = result["node-instance"][i];
          if (step.name == node["node-name"] && node["node-type"] == "DynamicNode") {

            if (this.getCountofStep(result, step) > 1) {
              step.isCompleted = true;
            }
            else {
              step.isCompleted = node["node-completed"];
            }
            step.startDate = node["start-date"]["java.util.Date"];
            step.dueDate = node["sla-due-date"];

          }
        }
      });
    }

  }

  private getCountofStep(result: any, step: Step): number {
    let noofTimes: number = 0;
    result["node-instance"].forEach((node: any) => {
      if (step.name == node["node-name"] && node["node-type"] == "DynamicNode")
        noofTimes++;
    });
    return noofTimes;
  }

  onShowSteps(caseInstance: ProcessInstanceList) {
    this.allowShowStep = true;
    this.currentTemplate = caseInstance.template;
    this.service.getProcessNodes(caseInstance.processInstanceId).subscribe((data: any) => {
      this.analyzeNodes(caseInstance, data);
    });
  }

  onShowFlowcase(caseId: string) {
    this.service.getProcessInstanceForCase(caseId, null).subscribe((data: any) => {
      if (data["process-instance"] instanceof Array) {
        let instanceID = data["process-instance"][0]["process-instance-id"]
        this.onShowFlow(instanceID, 'Active');

      }
    });
    //onShowFlow(instance.processInstanceId,'Active')
  }

  onShowFlow(processInstanceId: number, type: string) {


    if (this.allowSvgContent) {
      this.allowSvgContent = false;
      return;
    }
    this.service.getSVGImage(processInstanceId).subscribe((res: any) => {
      this.svgContent = res;
      if (type == "Active")
        this.svgContentElement.nativeElement.innerHTML = this.svgContent;
      else
        this.svgContentElementClosed.nativeElement.innerHTML = this.svgContent;

    }, err => { console.error(err); });
    this.allowSvgContent = true;
  }

  onGetActiveTask(processInstanceId: number, userid: string, caseId: string) {
    this.service.getActiveTaskInstances(processInstanceId).subscribe((res: any) => {
      if (res["task-summary"] && res["task-summary"] instanceof Array) {
        res["task-summary"].forEach((task: any) => {
          let taskInstance: TaskInstance = {
            caseId: caseId,
            processInstanceId: processInstanceId,
            taskCreatedDate: task["task-created-on"]["java.util.Date"],
            taskId: task["task-id"],
            taskName: task["task-name"],
            taskSubject: task["task-subject"],
            taskDescription: task["task-description"]
          }

          if (userid == "AndrewSmith" && taskInstance.taskName == "Plan Task")
            this.activeManagerTasks.instanceList.push(taskInstance);
          if (userid == "StacieDorsey" && taskInstance.taskName == "Approval Task")
            this.activeManagerTasks.instanceList.push(taskInstance);
          if (userid == "JohnStark" && taskInstance.taskName == "Review Task")
            this.activeManagerTasks.instanceList.push(taskInstance);
        });
      }
    }, err => { });
  }

  getTaskVaribles(taskid: number) {
    this.service.getTaskVariables(taskid).subscribe((res: any) => {
      console.log(res);
      //this.openTask(res);
    }, err => { })
  }




  public openDueDate() {
    const modalRef = this.modalService.open(UpdateDueDateComponent, { ariaLabelledBy: 'modal-basic-title', size: 'xl', backdrop: 'static' });

    modalRef.result.then((result : Step) => {

      // window.alert("New Process Instance is created : " + result);
      // 
     // this.updateDueDate(result);
      console.log(result);
      this.updateDueDate(result);
      this.getCaseList();

    }, (reason) => {
      this.closeResult = "Dismissed";

      this.getCaseList();

    });

  }

  updateDueDate(step: Step) {
    let postdata: any = {};
    if (step.stage == "stage1")
      postdata.stage1_dueDate = "P" + step.sla + "D";
    if (step.stage == "stage2")
      postdata.stage2_dueDate = "P" + step.sla + "D";
    if (step.stage == "stage3")
      postdata.stage3_dueDate = "P" + step.sla + "D";
    if (step.stage == "stage4")
      postdata.stage4_dueDate = "P" + step.sla + "D";
    if (step.stage == "stage5")
      postdata.stage5_dueDate = "P" + step.sla + "D";

    this.activeProcessInstances.forEach((instance: ProcessInstanceList) => {
        //Update Case Variable for not activated timers.
        this.service.updateCaseVariables(instance.caseId, postdata).subscribe(() => { })
        //Update timers for existing cases.
        this.service.getSLATimers(instance.processInstanceId).subscribe((data : any) => {
          if(data && data["timer-instance"] && data["timer-instance"] instanceof Array)
          {
              data["timer-instance"].forEach((timerinstance : any) => {
                  var timerid = timerinstance.id;
                  var name = timerinstance.name;
                  if(name.indexOf(step.name) != -1)
                      this.service.updateSLATimer(instance.processInstanceId,timerid,step.sla).subscribe((result : any) => {
                          console.log(result);
                      });
              });
          }
        });
    });
  }

}
