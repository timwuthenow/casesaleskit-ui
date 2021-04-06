import { CityLocation } from '../UserRole';

export interface ComputerRequestWrapper
{
    "com.deluxedemo.deluxemodels.ComputerRequest" : ComputerRequest
}

export interface ComputerRequest
{
    cpu? : string,
    ram? : string,
    screensize? : string,
    operatingSystem? : string,
    price? : number,
    type? : string,
    hardware? : string
}

export interface Insert {
    object?: Object;
    "out-identifier"?: string;
    "return-object"?: boolean;
}

export interface FireAllRules {
}

export interface GetObjects {
    "out-identifier"?: string;
}



export interface Command {
    insert?: Insert;
    "fire-all-rules"?: FireAllRules;
    "get-objects"?: GetObjects;
    "set-focus"? : string;
}

export interface RootObject {
    lookup: string;
    commands?: Command[];
}

export interface ServiceRequest
{
    request : Object;
}

export interface ServiceResponse
{
    response : Object;
}




export interface DateWrapper
{
    "java.util.Date" : number
}




export interface ProcessInstanceData
{
    partList? : Part[];
}

export interface ProcessInstanceList 
{
    caseId? : string,
    processInstanceId? : number,
    status : string,
    startedDate : number,
    partList? : Part[],
    template? : Template
    dueDate? : Date;
}

export interface TaskInstance {
    caseId : string,
    processInstanceId : number,
    taskId : number;
    taskName : string;
    taskSubject : string;
    taskDescription? : string;
    taskCreatedDate : number;
}

export interface TaskInstanceList
{
    instanceList : TaskInstance[]
}

/* export interface TaskData {
    employeeRequest : Employee,
    comments : string,
    managerApprove : boolean
}
 */


 export interface Part {
        partNumber? : string,
        SKU? : string,
        partDesc? : string,
        min? : number,
        max? : number,
        stockQty? : number,
        unitCost? : number,
        orderQty? : number
 }

 export interface BPMNModel{
     contentType? : string,
     content : string
 }

 export interface NodeData{
     id : number,
     name? :  string,
     children : NodeData[],
     type? : string,
     placeHolder? : string,
     isEdit? : boolean,
     isDelete? : boolean
 }

 export interface Applicant {
     name : string,
     ssn : string,
     annualIncome : number,
     monthlyDebt : number,
     loanamount : number,
     bank : string,
     state : string,
     age : number
 }

 export interface Loan {
        type : string,
        amount : number,
        applicationDate : string,
        stateDelivered : string
 }

 export interface Step {
    name : string,
    stage : string,
    step : number,
    sla : number,
    slaunit : string,
    isNew : boolean,
    order? : number;
    dueDate? : Date;
    startDate? : Date;
    isCompleted? : boolean;
    count? : number;
    isTriggered : boolean;
 }

 export interface Template {
     name : string,
     steps : Step[],
     isOverrideWithRules? : boolean;
 }

 export interface StepWrapper {
     "com.redhat.ba.Step" : {
         name : string,
         sequenceNumber : number,
         sla : string
     }
 }

 export interface ProcessRequirementsWrapper {
    "com.redhat.ba.ProcessRequirements" : {
        steps? : StepWrapper[]
    }
 }

 export interface LoanWrapper {
    "com.redhat.ba.Loan" : Loan
 }

 export interface ApplicantWrapper {
    "com.redhat.ba.Applicant" : Applicant
 }