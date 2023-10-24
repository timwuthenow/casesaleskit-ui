import { Component, Input, OnInit } from '@angular/core';
import { UserRole } from 'src/app/Models/UserRole';
import { PAMServices } from 'src/app/service/PAMServices';
import { faPlus,faArrowUp,faArrowDown,faMinusCircle,faCheck } from '@fortawesome/free-solid-svg-icons';
import { Step, Template } from 'src/app/Models/Requests/Request';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AddStepComponent } from 'src/app/component/Modals/AddStep/AddStep.component';


@Component({
  selector: 'app-Configure',
  templateUrl: './Configure.component.html',
  styleUrls: ['./Configure.component.css']
})
export class ConfigureComponent implements OnInit {

  availableStep: string[] = new Array();
  @Input() user: UserRole;
  service: PAMServices;
  stageMap: Map<string, Step> = new Map();
  templates : Template[] = new Array();
  currentTemplate : Template;
  isOverrideWithRules : boolean;

  faPlus = faPlus;
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;
  faMinusCircle = faMinusCircle;
  faCheck = faCheck;


  constructor(service: PAMServices,private modalService: NgbModal) {
    this.service = service;
    
  }



  ngOnInit() {

    this.stageMap = this.service.getStageMap();
    // get Steps.

    this.getSteps();
    //this.initTemplates();
    console.log(this.templates);

    this.templates = this.service.getTemplates();

   /*  this.templates.forEach((element : Template) => {
      if(element.name == "Personal Loan (Standard)")
       this.currentTemplate = JSON.parse(JSON.stringify(element));
    });  */

  }



  removeStep(step : Step)
  {
    this.currentTemplate.steps = this.currentTemplate.steps.filter((currentStep : Step)=>{
      return currentStep.name != step.name;
       
    })
  }

  onAddNewStep() {
    const modalRef = this.modalService.open(AddStepComponent, { ariaLabelledBy: 'modal-basic-title', size: 'lg', backdrop: 'static' });

    modalRef.result.then((result) => {

      if(result)
      {
          var step = this.stageMap.get(result);
          if(this.currentTemplate)
            this.currentTemplate.steps.push(step);
          else
          {
             this.currentTemplate = {
               name : "New Template",
               steps : new Array(),
               isOverrideWithRules : this.isOverrideWithRules
             }
             this.currentTemplate.steps.push(step);
          }
      }
    
    }, (reason) => {
     
    });

    modalRef.componentInstance.availableStep = this.availableStep;
  }

private arrayMove(arr : Step[],fromIndex,toIndex)
{
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
}


onMoveDown(index : number) {
  this.arrayMove(this.currentTemplate.steps,index,index+1);
}

onMoveUp(index : number) {
  this.arrayMove(this.currentTemplate.steps,index,index-1);
}

onSelectTemplate(template : Template)
{
    this.currentTemplate = JSON.parse(JSON.stringify(template));
}

saveTemplate()
{
  var template : Template;
  template = JSON.parse(JSON.stringify(this.currentTemplate));

  var isAvailable = false;
  this.templates.forEach((rec : Template)=>{
     if(rec.name == template.name)
     {
        isAvailable = true;
        rec.steps = template.steps;
     }
  });

  if(!isAvailable)
  {
    this.templates.push(template);
    //this.service.addTemplate(template);
  }else
  {

  }

}

  onStepChange(rec : Step)
  {
      var key = rec.name;
      rec = this.stageMap.get(key);
  }

  onNewTemplate() {
     this.currentTemplate = {
       name : "New Template",
       steps : []
     }
  }

  getSteps() {
    this.service.getProcessMileStoneSteps().subscribe((data: any) => {
      console.log(data);
      if (data.nodes && data.nodes instanceof Array) {
        data.nodes.forEach((rec: any) => {
          if (rec.type == "MilestoneNode") {
            this.availableStep.push(rec.name);
          }

        });
      }

    });
  }

}
