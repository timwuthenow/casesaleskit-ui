import { Component, OnInit } from '@angular/core';
import { UserRole } from 'src/app/Models/UserRole';
import { faUser,faCog,faDatabase } from '@fortawesome/free-solid-svg-icons';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { KieSettingsComponent } from 'src/app/component/Modals/KieSettings/KieSettings.component';
import { CompletedProcessInstanceComponent } from 'src/app/component/Modals//completed-process-instance/completed-process-instance.component';


@Component({
  selector: 'app-main-component',
  templateUrl: './main-component.component.html',
  styleUrls: ['./main-component.component.css']
})
export class MainComponentComponent implements OnInit {


  user : UserRole;
  userList : UserRole[];
  selectedOption : string;
  faUser = faUser;
  faCogs = faCog;
  faDatabase = faDatabase;


  constructor(private modalService: NgbModal) { 
    this.userList = [
      {
        id : 1,
        name : "Andrew Smith",
        role : "CSR Rep",
        userid : "AndrewSmith",
        password : "test123"
      },
      {
        id : 2,
        name : "John Stark",
        role : "Admin",
        userid : "JohnStark",
        password : "test123"
      },
      {
        id : 3,
        name : "Stacie Dorsey",
        role : "Actor",
        userid : "StacieDorsey",
        password : "test123"
      } 
      ,
      {
        id : 5,
        name : "Mathew Park",
        role : "Configurer",
        userid : "Matthew",
        password : "test123"
      } 
    ];

    this.user = this.userList[3];
  }

 changeSelectedOption(option : UserRole)
  {
      this.user = option;
      this.selectedOption = option.name;
  }


  ngOnInit(): void {
  }

  openSettings()
  {
    const modalRef = this.modalService.open(KieSettingsComponent, { ariaLabelledBy: 'modal-basic-title', size: 'xl', backdrop: 'static' });
    
    modalRef.result.then((result) => {
     
      
    }, (reason) => {
      
    });
  }

  openClosedCases()
  {
    const modalRef = this.modalService.open(CompletedProcessInstanceComponent, { ariaLabelledBy: 'modal-basic-title', size: 'xl', backdrop: 'static' });
    
    modalRef.result.then((result) => {
     
      
    }, (reason) => {
      
    });
  }

}
